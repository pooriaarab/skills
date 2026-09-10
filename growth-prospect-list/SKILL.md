---
name: growth-prospect-list
description: "Build a defensible, verified B2B prospect list with a consent-evidence column set (basis, evidence URL, date observed, no-solicitation flag), source terms and robots checks, named versus role contact decisions, fan-out research across segments, build-time verification, and lawful enrichment boundaries. Use when the user asks to 'build a prospect list', 'find B2B leads', 'source prospects', 'verify a lead list', 'check if we can legally email this list', 'judge a researcher's output', or decide whether an enrichment step is safe."
---

# growth-prospect-list

A B2B prospect list is an asset only when every row has a recorded reason to be contacted and a right to be contacted. A row without that reason is a liability, and a row with an unverified address is a deliverability risk. Both are cheap to fix at build time and expensive after a send.

This skill is the **build and verify** step. Channel mechanics — how to write and send the cold email, or how to run the cold call — are a separate concern with their own playbook. Do not mix list building with send mechanics.

## What makes a row defensible

A defensible row is one you can explain to a regulator, a prospect, or a domain-reputation system:

- **Where the address came from.** A URL, a business card, an inbound form, a prior purchase, or a public directory.
- **Why you may contact it.** A legal basis tied to a jurisdiction, not a hope.
- **When you observed it.** Public pages change; an address captured six months ago may no longer be published or may now carry a no-solicitation statement.
- **Whether the source forbids it.** A terms page, a robots.txt, or a no-solicitation statement overrides everything.
- **Whether the address is real.** Syntax, domain, and deliverability checks belong at build time, not at send time.

The list is the evidence step. The send step comes later.

## Column set

Use one row per contact. Keep one row per named person or per role address; do not duplicate the same person across three guessed addresses.

| Column | Purpose |
|---|---|
| `company` | Legal or operating name of the target business. |
| `company_domain` | Primary domain. Used for domain verification and suppression dedupe. |
| `country` / `jurisdiction` | Country whose rules govern the contact. This changes the basis. |
| `segment` | The use-case or vertical you used to find them. Keeps the list testable by segment. |
| `contact_name` | First and last name, or blank if only a role address is available. |
| `contact_role` | Job title or function. Use it to judge message fit, not as a personalization token. |
| `email` | The address you intend to use. |
| `email_type` | `named` or `role`. Record which one it is. |
| `phone` | Optional. Only collect if the channel plan needs it and the basis allows it. |
| `source_url` | The page, directory, or document where the contact or role address appears. |
| `source_date` | Date you captured the source. For public pages, this is your evidence timestamp. |
| `basis` | The reason you may contact this address: `public_role`, `public_named`, `existing_customer`, `inbound_inquiry`, `consent`, `referral`, or `do_not_contact`. |
| `basis_expiry` | When the basis expires, if it is time-limited. For example, CASL's existing-business relationship windows. |
| `evidence_url` | Permalink or archive of the page that supports the basis. Not the same as the company home page. |
| `date_observed` | When the evidence was last checked. This is your freshness field. |
| `no_solicitation_flag` | `true` if the source says no unsolicited contact, the privacy policy opts out, or the robots/terms forbid extraction. This overrides `basis`. |
| `verification_status` | `unverified`, `syntax_ok`, `domain_ok`, `deliverable`, `catch_all`, `role`, or `do_not_contact`. |
| `do_not_contact` | `true` after an opt-out, a bounce, a no-solicitation finding, or a manual suppression. |
| `notes` | One sentence of context: what problem they likely have, why they fit. Not a pitch. |

Fill the compliance columns before the outreach columns. If `no_solicitation_flag` is `true`, set `do_not_contact` to `true` and stop. Do not keep the row for a later channel.

## Legal basis by jurisdiction (what to record, not advice)

This is a record-keeping guide. Laws change and overlap. Ask counsel before sending at scale.

### United States — CAN-SPAM

The CAN-SPAM Act covers commercial email and has **no business-to-business exception**. Every commercial message must:

- Use accurate header information.
- Use a subject line that reflects the message content.
- Identify the message as an ad where applicable.
- Include a valid physical postal address.
- Provide a clear, working opt-out and honor it within 10 business days.

The FTC guide states that each separate email in violation can carry a civil penalty of up to **$53,088**. See [FTC CAN-SPAM guide](https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business).

For the list, record `basis: public_role` or `public_named` and the `source_url`. CAN-SPAM does not require prior consent, but it requires truth and an easy opt-out. Still, a list built from addresses that never agreed to hear from you will convert poorly and is a reputation risk.

### Canada — CASL

CASL applies to commercial electronic messages (CEMs). You need **consent**, identification, and an unsubscribe mechanism. Consent can be **express** or **implied**.

Implied consent includes:

- An **existing business relationship** based on a purchase or lease within the **two years** before the message, or an inquiry or application within **six months**. See [CRTC CASL guide](https://crtc.gc.ca/eng/com500/guide.htm).
- A person who **publishes their email address on a website** without a statement saying they do not want CEMs, if the message relates to their business role, functions, or duties.

The CRTC can issue administrative monetary penalties of up to **$1 million per violation for an individual** and **$10 million per violation for a business**. See [CRTC CASL FAQ](https://crtc.gc.ca/eng/com500/faq500.htm).

Record:

- `basis: public_named` or `public_role` with the `evidence_url` and `date_observed`.
- The absence of a no-solicitation statement at the time of capture.
- `basis_expiry` for existing-customer or inquiry relationships.

If the source later adds a no-solicitation statement, set `no_solicitation_flag` to `true` and suppress the row.

### United Kingdom — PECR and UK GDPR

PECR does not require consent to send marketing emails to **corporate subscribers** (companies and similar corporate bodies). It does require consent or a soft opt-in for **individual subscribers**, which includes sole traders and some partnerships. See [ICO B2B marketing guidance](https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/business-to-business-marketing/).

Even when PECR does not require consent, the **UK GDPR** still applies because a business contact is personal data. You need a **lawful basis**, most often **legitimate interests** for corporate subscribers or **consent** for sole traders. You must also inform the contact and honor opt-outs. See [ICO lawful basis guidance](https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/sending-direct-marketing-choosing-your-lawful-basis/).

Record `jurisdiction: UK` and `basis: public_role` or `public_named` with evidence. For sole traders and non-corporate partnerships, treat them like individuals: record `consent` or `inbound_inquiry` and a clear opt-out path.

### European Union — ePrivacy Directive and GDPR

Article 13 of the ePrivacy Directive says unsolicited direct marketing by email generally requires **prior consent** for natural persons. It lets Member States choose how to protect **legal persons** from unsolicited email, so B2B rules vary by country. See [Directive 2002/58/EC, Article 13](https://www.legislation.gov.uk/eudr/2002/58/article/13/data.xht).

The GDPR still governs the processing of personal data. Lawful bases include **legitimate interests** or **consent**, depending on the country and the context. See [EDPB Guidelines 1/2024 on legitimate interest](https://www.edpb.europa.eu/system/files/2024-10/edpb%5Fguidelines%5F202401%5Flegitimateinterest%5Fen.pdf).

Record `jurisdiction` and `basis` per country. Do not treat an EU rule as if it applies to every EU country. Germany, for example, is stricter than some others about B2B cold email.

## Check the source's terms and robots before extracting

Before you or a worker pulls contacts from a source:

1. Read the source's **Terms of Service** or **Terms of Use**.
2. Check `/robots.txt` for the relevant path.
3. Check the **privacy policy** or **data-use policy** for a no-solicitation or no-scraping clause.
4. If the source offers an **API or export**, use that instead of scraping.

If any of these forbid extraction, stop. Do not extract manually to get around an automated ban, and do not hire humans to copy data if the terms prohibit "third-party access," "manual systematic retrieval," or "use of the service on behalf of another." Both routes break the same rule.

### Worked example: a legal database that blocks both routes

A legal database displays case-law contact pages and has these terms:

- Users may not use "any robot, spider, or other automatic device" to access the site.
- Users may not "permit any third party to access or use the service on your behalf" for data extraction.
- The robots.txt disallows the directory.

The "hire a human" loophole is closed by the second clause. You cannot use a worker, an agent, or a virtual assistant to extract contacts from this source. Use the database's own search and read the decision to find public counsel pages outside the database, or find the same contact on a firm website that does not forbid extraction.

## Fan-out research across segments

Do not ask one worker to "find me 500 SaaS prospects." That brief guarantees generic results and invented rows.

Instead:

1. Split the market into **segments** (use case, role, industry, geo, company stage).
2. Give each worker one segment and a **specific source list** (e.g., a conference speaker list, a public customer page, a directory, a GitHub org).
3. Require every row to include a `source_url` and `evidence_url`.
4. Forbid invented rows. A worker must return `not_found` for a target, not a guessed email.
5. Set a **duplicate rule**: if two workers find the same contact, keep the one with the stronger basis and the more recent `date_observed`.

A good fan-out brief looks like:

```text
Segment: US-based accounting firms with 11-50 employees that list cloud-software partners.
Sources: Firm websites, state CPA directory, partner marketplaces.
Output: Up to 50 rows with source_url, evidence_url, named contact if published, role otherwise.
Rule: Do not invent an email. If no named contact is public, record the role address and flag it.
```

## Named contact versus role address

A `named` email (`jane.doe@example.com`) is tied to a person. A `role` email (`support@example.com`, `hello@example.com`, `sales@example.com`) is tied to a function.

| Factor | Named | Role |
|---|---|---|
| **Reply likelihood** | Higher — the recipient owns the inbox. | Lower — the inbox is shared or filtered. |
| **Gatekeeper risk** | Lower. | Higher — a role inbox may be staffed by someone who does not own the problem. |
| **Finding cost** | Higher — requires research. | Lower — usually on the website. |
| **Deliverability risk** | Lower if verified. | Higher if the role address is a catch-all. |

### The market-size effect

In a **small market** (hundreds of accounts), one bad send is a large share of your reachable audience. Burning a domain's reputation in a small market is expensive because there is no replacement audience. In a small market, prefer named contacts and a higher evidence bar.

In a **large market** (tens of thousands of accounts), role addresses can be a scalable starting point, but they still need verification and a clear basis. The risk is not market exhaustion; it is domain-reputation damage that poisons the named-contact sends you run later.

## Verification as a build step

Do not discover invalid or toxic addresses on send day. Verify at build time.

1. **Syntax check.** Reject malformed addresses.
2. **Domain check.** Confirm the domain has MX records and accepts mail.
3. **Deliverability probe.** Use an SMTP handshake or a deliverability service to detect catch-alls, full inboxes, and disabled accounts. Do not send a real email to test.
4. **Role detection.** Flag `support@`, `info@`, `hello@`, `sales@`, `contact@`, `admin@`, and similar patterns as `role`.
5. **Catch-all detection.** If the domain accepts every local part, the address is not a reliable signal of a real recipient.
6. **Re-visit the evidence URL.** If the page changed and the address or the no-solicitation statement is different, update `date_observed` and `no_solicitation_flag`.
7. **Jurisdiction check.** Confirm the company's country and the contact's country if they differ.

Update `verification_status` after each step. A row with `verification_status: unverified` does not leave the build stage.

### When an address fails verification

- **Bounce or invalid:** set `do_not_contact: true` and do not retry.
- **Catch-all:** keep the row but mark `verification_status: catch_all` and lower the expected reply rate. Do not treat catch-all as "deliverable."
- **Role address:** keep it if the basis is `public_role` and the message fits the function. Flag `email_type: role`.
- **No-solicitation found on re-visit:** set `no_solicitation_flag: true` and `do_not_contact: true`.

## Enrichment: what is safe and what is not

Enrichment can make a list smarter, but the wrong enrichment can destroy the basis you recorded.

### Safe enrichment

These are usually safe because they do not change the contact basis:

- Company size, industry, location, and funding.
- Public technology signals (e.g., from job posts, public case studies, open-source repos).
- Recent news, leadership changes, or expansion announcements.
- The contact's role, if it is publicly stated.

Use this context to write a relevant message, not to claim insider knowledge.

### Unsafe enrichment

These are usually unsafe because they break the audit trail:

- **Sourcing the email or phone from an enrichment vendor** when the original basis was a public address. The vendor did not observe the source's no-solicitation statement and may have scraped the address from a different context. The `evidence_url` you recorded no longer matches the address you send to.
- **Appending a named email to a role address** without a public source. A guess like `first.last@example.com` is an invention.
- **Sourcing a phone number from a private data broker** if you do not have a calling basis.
- **Merging a contact from a bought list.** Bought lists usually cannot prove consent or basis.

If you must use an enrichment service for an address, record the new `evidence_url` and `basis` for that new address. Do not keep the old evidence as a fig leaf.

## Judging a research worker's output

Before you accept a list from a worker:

1. **Evidence density.** What share of rows have a real `evidence_url`? A rate below 100% is a red flag.
2. **Invented-row check.** Sample 10 rows and compare each `email` against the `evidence_url`. If any email does not appear on the evidence page, reject the batch.
3. **Basis consistency.** Confirm the `basis` matches the `evidence_url`. A public directory is not `consent`.
4. **No-solicitation sweep.** Open 5-10 evidence URLs and look for "no unsolicited," "do not contact," or a no-solicitation email. If any appear, the worker should have flagged them.
5. **Duplication.** Check for the same contact across multiple rows or the same email across different companies.
6. **Market coverage.** Did the worker follow the segment brief, or return 50 generic "sales@" addresses from a directory?

Rejection language:

```text
This batch has 12 of 50 rows with no evidence_url and 2 rows whose email does not appear on the evidence page. Rejected. Re-run the segment and return not_found for any target where a public address is not available.
```

## Suppression and re-verification

A prospect list is a living file, not a one-time export.

- **Suppression is permanent.** An opt-out, a hard bounce, a no-solicitation flag, or a do-not-contact request removes the row forever.
- **Re-verify before each campaign.** Public pages change. `date_observed` more than 90 days old is stale for public addresses; refresh the `evidence_url` and `no_solicitation_flag` before sending.
- **Basis expiry matters.** A CASL existing-customer basis expires after 2 years for a purchase or 6 months for an inquiry. Do not let time-limited bases silently age out.
- **Segment lock.** Do not reuse a row for a different product or use case without re-checking the basis. A `public_role` basis for a dev-tool may not cover a marketing-tool pitch.

## Checklist

- [ ] Define the segment, use case, and ICP before any research starts.
- [ ] Create the column set with `basis`, `evidence_url`, `date_observed`, and `no_solicitation_flag`.
- [ ] Check the source's terms, robots.txt, and privacy policy before extracting.
- [ ] Never extract from a source that forbids it, including through manual or human workarounds.
- [ ] Forbid invented rows in the research brief.
- [ ] Record the jurisdiction and legal basis for every row.
- [ ] Decide `named` versus `role` per row based on market size and source quality.
- [ ] Verify syntax, domain, deliverability, and role/catch-all status at build time.
- [ ] Re-visit `evidence_url` and update `date_observed` before sending.
- [ ] Enrich only with safe fields; never carry an old `evidence_url` across a new address from a vendor.
- [ ] Judge a worker's output by evidence density, basis consistency, and a manual sample.
- [ ] Maintain suppression and re-verification as a standing discipline.

## Related

- `founder-led-sales` — the broader first-sales motion.
- `ad-experiments` — when you move from outbound to paid experiments.
