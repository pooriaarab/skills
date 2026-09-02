---
name: ads-naver
description: "Use for Naver Ads and Naver Search Ads setup, wcs.trans conversion tracking, NaPm click attribution, Search Ads API reporting, or debugging missing Naver conversions."
---

# Naver Ads

Naver Search Ads has a public advertiser account, a public management API, and a
browser conversion script. It does **not** publish a server-to-server conversion
upload API. Use this adapter as `pixel-only` in `ad-conversion-hub`, not as a
`real-capi` adapter.

## Account and access

Naver uses a self-serve advertiser flow. A new Search Ads member uses a
real-name Naver ID to create an individual or business account in the [Naver
integrated advertiser center](https://ads.naver.com/help/faq/54). The center
requires a verified member who is at least 19.

Create a site **Biz Channel** and wait for PC or mobile review to reach
`exposure available`. Then apply for tracking:

1. Open `Search Ads > Tools > Conversion Tracking Management`.
2. Select `+ Apply for conversion tracking`.
3. Choose self-install or NHN DATA installation.
4. Use the installation email to get the site's Naver common key.

The official process says the site must pass review, the site must allow
JavaScript, and self-installed tracking needs a separate review request. The
common key is normally available in the installation email or in
`Tools > Conversion Tracking`. See the [Search Ads application and installation
guide](https://ads.naver.com/help/faq/1473).

Smart Store and Brand Store usually need no separate application. A different
advertiser and store owner can require manual application. GFA tracking needs
separate setup. See the [GFA tracking management guide](https://ads.naver.com/help/faq/1716).

### Search Ads API access

The Search Ads API manages ads and reports. It is not a conversion ingestion
API. Apply in `Tools > API Usage Management`; Naver then issues an access
license and secret key. It covers some products, including site-search ads. Apply through the Naver Ads console; see the
[Search Ads API documentation](https://naver.github.io/searchad-apidoc/).

Use these adapter names. Naver does not define environment-variable names.

```text
NAVER_ADS_TAG_ID       # public na_account_id, also called the Naver common key
NAVER_ADS_API_KEY      # Search Ads API access license
NAVER_ADS_SECRET_KEY   # Search Ads API secret key
NAVER_ADS_CUSTOMER_ID  # numeric advertiser Customer ID
```

The API uses `https://api.searchad.naver.com`. Sign each request with
HMAC-SHA256 over `{timestamp}.{HTTP_METHOD}.{request_uri}`. Send the Base64
signature in `X-Signature`, plus `X-Timestamp` in Unix milliseconds, `X-API-KEY`,
and `X-Customer`. See the [official sample](https://github.com/naver/searchad-apidoc/blob/master/python-sample/examples/ad_management_sample.py).

## Client-side tag and conversion script

Load the official `wcslog.js` on every page that needs tracking. Use HTTPS. Set
the common key and cookie domain before `wcs_do()` or `wcs.trans()`.

```html
<script src="https://wcs.naver.net/wcslog.js"></script>
<script>
if (window.wcs) {
  if (!wcs_add) var wcs_add = {};
  wcs_add["wa"] = "<NA_ACCOUNT_ID>";
  wcs.inflow("example.com");
  wcs_do();
}
</script>
```

`<NA_ACCOUNT_ID>` is `na_account_id`, also called the Naver common key. It is
not a pixel ID. Store it in the public `NAVER_ADS_TAG_ID` build setting. The
[wcs.trans guide](https://naver.github.io/conversion-tracking/pages/01_script_guide_wcstrans/)
defines this setup.

Fire the conversion only after the user action completes. For a paid order,
fire it only after the payment provider confirms the charge.

```js
var _conv = {
  type: "purchase",
  id: "<ORDER_ID>",
  value: "50000",
  items: [{
    id: "<PRODUCT_ID>",
    name: "<PRODUCT_NAME>",
    quantity: 1,
    payAmount: 50000
  }]
};
wcs.trans(_conv);
```

`type` is required for every conversion. `purchase` also requires `value`.
Use the advertiser-created `id` for the action, such as an order number. For an
item, `id`, `name`, `quantity`, and total `payAmount` are the useful fields. The
[event specification](https://naver.github.io/conversion-tracking/pages/01_script_guide_wcstrans/)
caps reported purchase values at 1 billion.

## Server-side conversion API: none published

Naver's public conversion contract is browser `wcs.trans()`. The [test guide](https://naver.github.io/conversion-tracking/pages/04_trans_script_test_guide/) shows `POST https://wcs.naver.com/b`, but does not document a server API.

The public [Search Ads API](https://naver.github.io/searchad-apidoc/) documents ad management and reporting. It documents no
conversion upload, conversion identity fields, or server idempotency. Therefore:

- Do not invent a Naver CAPI endpoint or bearer token.
- Do not send raw hub events to `wcs.naver.com/b` from a webhook.
- Do not create `NAVER_ADS_CAPI_TOKEN`.
- Keep the payment webhook as business truth in `ad-conversion-hub`.
- Dispatch Naver conversion events from the confirmed browser flow, then
  reconcile them with the Search Ads report.

Naver's web event docs define no identity hash fields. Do not send hub identity fields to this script. Apply the hub consent gate before loading or firing. The
hub still requires `measurement` consent and does not require a click ID.

## Canonical event mapping

The adapter translates the hub taxonomy at the edge:

| Hub event | Naver event | Notes |
|---|---|---|
| `page_view` | `wcs_do()` | PV log, not a conversion type |
| `view_content` | `view_content` | Reportable |
| `lead` | `lead` | Reportable |
| `signup` | `sign_up` | Reportable |
| `begin_checkout` | `begin_checkout` | Collected, not a report conversion |
| `purchase` | `purchase` | Reportable; `value` required |
| `subscription_start` | `custom001` | Use only after the account defines this custom meaning |
| `refund` | none | Reconcile in the hub; Naver has no documented refund type |

Naver also defines `add_to_cart`, `schedule`, `add_to_wishlist`, `subscribe`,
`view_product`, and ten `custom` types. `subscribe` means consent to receive
regular information, not necessarily a paid subscription. See the [event
table](https://naver.github.io/conversion-tracking/pages/01_script_guide_wcstrans/).

## Deduplication

Naver publishes no client/server deduplication contract because it publishes no
server conversion twin. The [public event guide](https://naver.github.io/conversion-tracking/pages/01_script_guide_wcstrans/) defines `_conv.id` as the advertiser's action ID, but the
guide does not say it reconciles requests. Use hub `event_id` as `_conv.id` for
traceability, not as a claimed deduplication field.

Do not install both `wcs.cnv` and `wcs.trans` for one event. After a `wcs.trans`
event, Naver can permanently filter the matching old `wcs.cnv` event. This is a
script-version rule, not event-ID deduplication. See the [migration guide](https://naver.github.io/conversion-tracking/pages/05_cnv_to_trans_guide/).

## Click parameter and attribution lifetime

Naver appends the case-sensitive query parameter `NaPm` to the landing URL.
Its value contains fields such as `ci` (click identifier) and `tr` (`sa` for
Search Ads or `gfa` for Performance Display Ads). Preserve the complete raw
`NaPm` value. Do not decode and rebuild it.

`wcs.inflow("example.com")` lets the script create and read the Naver tracking
cookies. For a Search Ads click, the official assistant expects `NA_SA`,
`NVADID`, and `NA_CO`. A GFA click uses `NA_DA`, `NVADID`, and `NA_CO`. The
[official assistant guide](https://naver.github.io/conversion-tracking/pages/06_script_assistant_guide/)
documents these names and the `NaPm` fields.

The conversion attribution window is separate from the browser cookie expiry.
For Search Ads, the current default is 15 days and the setting is 7–20 days.
Naver counts a direct conversion within 30 minutes of the click. It counts an
indirect conversion after 30 minutes and within the configured window. A
conversion can therefore appear after a campaign stops. See the [official
conversion-window help](https://ads.naver.com/help/faq/1215).

> **UNVERIFIED:** Naver's public web tracking docs show that the assistant can
> display each cookie's expiry, but they do not publish one fixed `NaPm` or
> cookie TTL. Do not replace the configured attribution window with a guessed
> cookie lifetime.

Persist the first and latest raw `NaPm` values in first-party state only when
the product needs its own attribution record. Preserve the parameter through
every redirect. Let Naver's script manage its vendor cookies. The URL must not
gain a second `?`, and a `#anchor` must not come before `NaPm`. Naver states that
redirects that drop, double-encode, or decode `NaPm` break attribution. See the
[official troubleshooting guide](https://naver.github.io/conversion-tracking/pages/01_script_guide_wcstrans/).

## Quirks that cause real failures

- `wcs.trans` must run after the common setup and PV code. Running the
  conversion block first can break tracking.
- Only reportable event types appear in conversion reports. `begin_checkout` and
  `view_product` logs do not become report metrics; `lead` does. Check the table.
- Search Ads can show a conversion after the campaign stops. Check the window
  before treating this as a phantom event.
- The Search Ads report can remain empty until installation review completes.
  The official process says a passed review enables reports from the next day.
- Naver's current attribution models include last-click and data-driven
  attribution. Do not compare the two metrics as if they were the same count.

## Verification

Use three proofs:

1. **Request proof:** run a click-to-conversion test and confirm the
   `wcs.naver.com` request. See the [official test guide](https://naver.github.io/conversion-tracking/pages/04_trans_script_test_guide/).
2. **Platform proof:** query signed `GET /stats` metrics such as `ccnt` and
   `convAmt`, or create an `AD_CONVERSION` report. See the [conversion report
   notice](https://naver.github.io/searchad-apidoc/notice/2024/05/30/notice1/).
3. **Business proof:** compare the report with payment-provider succeeded
   charges. A browser request or API `200` alone does not prove attribution.

Use the HMAC headers above. Store status, transaction ID, report date, event
type, and redacted errors in the hub. Retry only signed report reads after 5xx
or timeout errors. Never retry through the undocumented collector.

## Common pitfalls

- Treating `NAVER_ADS_TAG_ID` as a Meta-style pixel ID. It is the `na_account_id`
  common key issued by conversion tracking.
- Firing only when `NaPm` exists. Organic and direct conversions still belong in
  the payment and product records, even when Naver cannot attribute them.
- Losing `NaPm` during a mobile redirect or changing its encoding.
- Using a second `?` or placing a URL fragment before the Naver parameter.
- Installing the old `wcs.cnv` script beside `wcs.trans`.
- Firing `purchase` before a confirmed charge, or firing it again on refresh.
- Expecting a server webhook to repair a blocked browser tag. Naver has no
  documented public server conversion upload path.
- Reading an empty same-day conversion report as proof of failure. Check review
  state, reporting delay, attribution window, and the correct report date.

## Security

Keep `NAVER_ADS_SECRET_KEY` server-side. Keep API credentials out of client bundles.
Never log HMAC inputs, signatures, raw `NaPm`, cookie values, or URLs
that contain them. Load only `https://wcs.naver.net/wcslog.js` and apply the
hub consent gate. Keep raw click and identity data inside the server boundary.

## Pairing

Use [ad-conversion-hub](../ad-conversion-hub/SKILL.md) for canonical events,
consent, event IDs, retry isolation, and payment reconciliation.
