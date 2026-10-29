"""Offline provisioning regression tests: python3 -m unittest discover -s domain-email-warming/test."""
import contextlib
import copy
import importlib.util
import io
import os
from pathlib import Path
import unittest
from unittest.mock import patch
from urllib.parse import parse_qs, urlsplit

SCRIPT = Path(__file__).resolve().parents[1] / 'scripts' / 'provision-domain.py'
with patch.dict(os.environ, {'CLOUDFLARE_API_TOKEN': 'offline-test-token'}):
    spec = importlib.util.spec_from_file_location('provision_domain', SCRIPT)
    provision = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(provision)


class FakeZone:
    def __init__(self, registration='add'):
        self.records = []
        self.subs = []
        self.rules = []
        self.serial = 0
        self.registration = registration

    def add(self, name, content, rtype='TXT'):
        self.serial += 1
        record = dict(id=str(self.serial), type=rtype, name=name, content=content)
        self.records.append(record)
        return record

    def cf(self, path, method='GET', body=None):
        url = urlsplit(path)
        route = url.path.removeprefix('/zones/zone/')
        query = parse_qs(url.query)
        result = None
        if route == 'dns_records' and method == 'GET':
            result = [r for r in self.records if all(r.get(k) == v[0] for k, v in query.items()
                                                     if k in ('name', 'type'))]
        elif route == 'dns_records' and method == 'POST':
            result = self.add(body['name'], body['content'], body['type'])
        elif route.startswith('dns_records/'):
            record = next(r for r in self.records if r['id'] == route.split('/')[-1])
            if method == 'DELETE':
                self.records.remove(record)
            elif method == 'PUT':
                record.update(body)
                result = record
            else:
                raise AssertionError((path, method))
        elif route == 'email/sending/subdomains':
            if method == 'POST':
                result = dict(id=str(len(self.subs)), name=body['name'])
                self.subs.append(result)
                name = '_dmarc.' + body['name']
                existing = [r for r in self.records if r['name'] == name]
                if self.registration == 'overwrite' and existing:
                    existing[0]['content'] = 'v=DMARC1; p=reject'
                else:
                    self.add(name, 'v=DMARC1; p=reject')
            else:
                result = self.subs
        elif route.startswith('email/sending/subdomains/') and route.endswith('/dns'):
            sub = next(s for s in self.subs if s['id'] == route.split('/')[-2])
            result = [dict(type='TXT', name='_dmarc.' + sub['name'],
                           content='"v=DMARC1; p=reject; adkim=s"')]
        elif route == 'email/routing/rules':
            if method == 'POST':
                self.rules.append(copy.deepcopy(body))
                result = body
            else:
                result = self.rules
        else:
            raise AssertionError((path, method))
        return dict(success=True, result=copy.deepcopy(result))


class ProvisionTests(unittest.TestCase):
    apex = 'example.test'
    original = 'v=DMARC1; p=none; rua=mailto:reports@example.test'

    def run_twice(self, zone):
        with patch.object(provision, 'cf', side_effect=zone.cf), \
             patch.object(provision.time, 'sleep'), \
             patch.object(provision.urllib.request, 'urlopen', side_effect=AssertionError('Network forbidden')), \
             contextlib.redirect_stdout(io.StringIO()):
            for _ in range(2):
                provision.provision(self.apex, 'zone', 'test-worker')
                dmarc_names = {'_dmarc.' + name for name in
                              [self.apex] + [p + '.' + self.apex for p in provision.SUBDOMAIN_PREFIXES]}
                dmarc_names.update(r['name'] for r in zone.records
                                   if r['type'] == 'TXT' and r['name'].startswith('_dmarc.'))
                for name in dmarc_names:
                    self.assertEqual(sum(r['type'] == 'TXT' and r['name'] == name
                                         and provision.policy_tag(name, r['content']) == 'v=DMARC1'
                                         for r in zone.records), 1, name)
                for prefix, tag in provision.POLICY_TAGS.items():
                    records = [r for r in zone.records if r['name'] == prefix + self.apex
                               and provision.policy_tag(r['name'], r['content']) == tag]
                    self.assertEqual(len(records), 1, prefix)
        return {r['name']: r['content'] for r in zone.records if r['type'] == 'TXT'}

    def test_existing_policies_survive_reruns(self):
        zone = FakeZone()
        zone.add('_dmarc.' + self.apex, self.original)
        zone.add('_mta-sts.' + self.apex, 'v=STSv1; id=20250101')
        zone.add('_smtp._tls.' + self.apex, 'v=TLSRPTv1; rua=mailto:original@example.test')
        records = self.run_twice(zone)
        self.assertEqual(records['_dmarc.' + self.apex], self.original)
        self.assertEqual(records['_mta-sts.' + self.apex], 'v=STSv1; id=20250101')
        self.assertIn('original@', records['_smtp._tls.' + self.apex])

    def test_registration_adds_second_dmarc(self):
        zone = FakeZone()
        zone.add('_dmarc.' + self.apex, self.original)
        records = self.run_twice(zone)
        self.assertEqual(records['_dmarc.' + self.apex], self.original)

    def test_registration_overwrites_dmarc(self):
        zone = FakeZone(registration='overwrite')
        zone.add('_dmarc.' + self.apex, self.original)
        self.assertEqual(self.run_twice(zone)['_dmarc.' + self.apex], self.original)

    def test_fresh_zone(self):
        self.run_twice(FakeZone())

    def test_shorter_reporting_dmarc_wins_snapshot_and_dedupe(self):
        for registration in ('add', 'overwrite'):
            with self.subTest(registration=registration):
                zone = FakeZone(registration)
                name = '_dmarc.' + self.apex
                zone.add(name, 'v=DMARC1; p=none; ' + 'adkim=s; ' * 20)
                zone.add(name, self.original)
                self.assertEqual(self.run_twice(zone)[name], self.original)

    def test_singleton_prefers_reporting_over_snapshot(self):
        zone = FakeZone()
        name = '_dmarc.' + self.apex
        preferred = 'v=DMARC1; p=reject; ' + 'adkim=s; ' * 20
        zone.add(name, preferred)
        reporting = zone.add(name, self.original)
        with patch.object(provision, 'cf', side_effect=zone.cf), contextlib.redirect_stdout(io.StringIO()):
            provision.singleton_policy('zone', copy.deepcopy(zone.records), name, preferred, preferred)
        self.assertEqual(zone.records, [reporting])

    def test_foreign_mx_dedupes_without_changing_mx_or_spf(self):
        zone = FakeZone()
        zone.add(self.apex, 'mx.incumbent.test', 'MX')
        zone.add(self.apex, 'v=spf1 include:incumbent.test -all')
        before = copy.deepcopy(zone.records)
        for prefix, tag in provision.POLICY_TAGS.items():
            zone.add(prefix + self.apex, tag + '; p=none')
            zone.add(prefix + self.apex, tag + '; p=none; rua=mailto:reports@example.test')
        self.run_twice(zone)
        self.assertEqual([r for r in zone.records if r['type'] == 'MX'
                          or r['content'].startswith('v=spf1')], before)
        self.assertEqual(zone.rules, [])

    def test_spf_and_verification_txt_survive(self):
        zone = FakeZone()
        protected = [zone.add(self.apex, 'v=spf1 include:incumbent.test -all'),
                     zone.add(self.apex, 'google-site-verification=apex-token'),
                     zone.add('_dmarc.' + self.apex, 'google-site-verification=dmarc-token')]
        before = copy.deepcopy(protected)
        zone.add('_dmarc.' + self.apex, self.original)
        zone.add('_dmarc.' + self.apex, 'v=DMARC1; p=reject')
        self.run_twice(zone)
        for record in before:
            self.assertIn(record, zone.records)

    def test_final_pass_covers_all_zone_policy_names(self):
        zone = FakeZone()
        for prefix, tag in provision.POLICY_TAGS.items():
            name = prefix + 'other.' + self.apex
            zone.add(name, tag + '; p=none')
            zone.add(name, tag + '; p=none; rua=mailto:reports@example.test')
        self.run_twice(zone)
        for prefix in provision.POLICY_TAGS:
            records = [r for r in zone.records if r['name'] == prefix + 'other.' + self.apex]
            self.assertEqual(len(records), 1)
            self.assertIn('rua=', records[0]['content'])

    def test_helper_syncs_records_and_preserves_unrelated_txt(self):
        zone = FakeZone()
        name = '_mta-sts.' + self.apex
        zone.add(name, 'unrelated verification')
        with patch.object(provision, 'cf', side_effect=zone.cf), contextlib.redirect_stdout(io.StringIO()):
            recs = copy.deepcopy(zone.records)
            provision.add_dns('zone', recs, 'TXT', name, 'v=STSv1; id=20250101')
            self.assertEqual(recs, zone.records)
            zone.add(name, 'v=STSv1; id=20260101; extra=tag')
            recs = copy.deepcopy(zone.records)
            provision.add_dns('zone', recs, 'TXT', name, 'v=STSv1; id=20261009')
            self.assertEqual(recs, zone.records)
            self.assertEqual(len(recs), 2)
            self.assertTrue(any(r['content'] == 'unrelated verification' for r in recs))


if __name__ == '__main__':
    unittest.main()
