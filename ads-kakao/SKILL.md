---
name: ads-kakao
description: "Use when setting up Kakao Moment Ads, Kakao Pixel, Kakao SDK, or Kakao Conversion API; when a Kakao advertiser needs account or Business API access; or when Kakao reports no conversions, wrong app or web data, duplicate events, or weak customer matching."
---

# Kakao Moment Ads

Kakao provides a real Pixel, mobile SDK, and server-side Conversion API.
Conversion API is separate from the Kakao Moment campaign API. It uses a
Pixel & SDK Track ID and a token from the Pixel & SDK console.

Kakao currently supports Conversion API performance measurement for KakaoTalk
mobile Bizboard and Display ads. Treat other surfaces as unsupported until
Kakao confirms support. [Conversion API guide](https://kakaobusiness.gitbook.io/main/tool/pixel-sdk/conversion-api)

## Account and access

1. Create a Kakao Account.
2. Convert it to an integrated Kakao Business account and accept the Kakao
   Business terms. [Moment concepts](https://developers.kakao.com/docs/en/kakaomoment/common)
3. Create an ad account in Kakao Business. An advertiser or agency can create
   it. Business information is used for tax invoices. [Moment concepts](https://developers.kakao.com/docs/en/kakaomoment/common)
4. Open Business tools > Pixel & SDK and create a Pixel & SDK. Copy its
   Track ID. A member can request access to an existing tracker.
   [Pixel & SDK guide](https://kakaobusiness.gitbook.io/main/tool/pixel-sdk/install)
5. Link the Pixel & SDK to the ad account. One ad account can link up to 100
   trackers. [Tracker linkage API](https://developers.kakao.com/docs/en/kakaomoment/pixel-and-sdk)

Moment campaign API access has a separate gate. Register an app, switch it to
a Biz app, verify the app owner's identity, and request Moment API permission.
Register a business redirect URI and the required business consent items.
Use a Business token for these management calls. [Moment API concepts](https://developers.kakao.com/docs/en/kakaomoment/common)

Conversion API access has a separate token flow. Open Pixel & SDK detail >
Settings > Issue token. Only the Pixel & SDK master can view Settings. Choose
an expiry, then copy the token before closing the dialog. Kakao permits up to
five tokens and does not show a token again. [Conversion API guide](https://kakaobusiness.gitbook.io/main/tool/pixel-sdk/conversion-api)

Use these adapter secret names:

~~~text
KAKAO_MOMENT_PIXEL_ID       # public Track ID
KAKAO_MOMENT_CAPI_TOKEN     # private Conversion API token
KAKAO_MOMENT_ACCESS_TOKEN   # private Moment Business token
KAKAO_MOMENT_AD_ACCOUNT_ID  # Moment ad account ID
~~~

Do not use the Moment Business token for Conversion API.

## Web Pixel

Load the script in the page head before calling kakaoPixel. Use Kakao's
documented HTTPS origin and the Track ID from KAKAO_MOMENT_PIXEL_ID.
   [Web Pixel installation](https://kakaobusiness.gitbook.io/main/tool/pixel-sdk/install)

~~~html
<script type="text/javascript" charset="UTF-8"
  src="https://t1.daumcdn.net/kas/static/kp.js"></script>
<script>
  kakaoPixel("<KAKAO_MOMENT_PIXEL_ID>").pageView();
</script>
~~~

Send pageView() on every web page. Send conversion methods only when the
action completes. Send purchase() after a confirmed payment.

~~~js
const pixel = kakaoPixel(import.meta.env.KAKAO_MOMENT_PIXEL_ID);
pixel.pageView();
pixel.completeRegistration();
pixel.search({ keyword: "<query>" });
pixel.viewContent();
pixel.addToCart();
pixel.addToWishList();
pixel.viewCart();
pixel.participation(); // lead or potential customer
pixel.signUp();        // service application
pixel.purchase({
  total_quantity: "1",
  total_price: "500",
  currency: "KRW",
  products: [{
    id: "sku123", name: "Example product", quantity: "1",
    price: "500", brand: "Example brand"
  }]
});
~~~

Purchase fields are optional. Use an ISO 4217 three-letter currency code.
Kakao defaults an omitted currency to KRW. Product quantity and price are
strings in the current guide. [Web event reference](https://kakaobusiness.gitbook.io/main/tool/pixel-sdk/and)

Kakao supports a string tag after an event or a tag field in an event object.
Configure the same tag in the Pixel & SDK console. Code-only tags do not create
the matching custom-event audience. [Pixel & SDK guide](https://kakaobusiness.gitbook.io/main/tool/pixel-sdk/install)

## App SDK

Install the Kakao SDK for iOS or Android, or use a supported MMP. Use the same
Pixel & SDK Track ID. Kakao documents AppInstall, AppLaunch, app purchase, and
registration events. Do not use web Pixel code in an app server. [Pixel & SDK](https://business.kakao.com/info/pixelsdk/)

## Event mapping

The first column is the hub event. The second column is the verified Kakao
standard name for Pixel and SDK. Use the v1.8 PDF for CAPI wire mapping.

| Hub event | Kakao Pixel/SDK name |
|---|---|
| page_view | PageView |
| view_content | ViewContent |
| lead | Participation |
| signup | CompleteRegistration |
| purchase | Purchase |
| begin_checkout | UNMAPPED |
| subscription_start | SignUp only for service application |
| refund | UNMAPPED |

Kakao also defines Search, AddToCart, AddToWishlist, ViewCart, SignUp,
AppInstall, and AppLaunch. SignUp means a service application. It does not
mean ordinary account registration. [Pixel event list](https://kakaoad.github.io/kakao-pixel/)

## Conversion API

Kakao Conversion API sends first-party events from the advertiser server.
Kakao matches users with SHA-256 hashed email hem and hashed phone hpn. Kakao
does not accept internal customer IDs, account IDs, addresses, or birth dates
as replacement identifiers. [Conversion API guide](https://kakaobusiness.gitbook.io/main/tool/pixel-sdk/conversion-api)

The public guide links Kakao Conversion API integration guide v1.8.pdf.
That PDF contains the request URL, authentication header, required fields,
event codes, timestamp rules, and body schema. The accessible official page
does not expose that contract. The Moment API reference lists no CAPI send
route. Therefore:

> UNVERIFIED: Do not guess the Conversion API endpoint, auth header, token
> prefix, required fields, event codes, timestamp unit, or JSON body. Copy them
> from the linked v1.8 PDF or obtain Kakao confirmation before implementation.
> Do not send CAPI data to https://apis.moment.kakao.com. That host documents
> Moment management APIs. [Moment API reference](https://developers.kakao.com/docs/en/kakaomoment/reference)

The CAPI guide verifies these contract boundaries:

- Use the Pixel & SDK Track ID.
- Issue the private token from Pixel & SDK Settings.
- Send only consented marketing data.
- Send only SHA-256 hashed hem and hpn for direct user matching.
- Expect customer matching to fail when neither email nor phone is present.
- Use the existing Pixel & SDK when possible. More events increase the learning
  seed for optimization. [Conversion API guide](https://kakaobusiness.gitbook.io/main/tool/pixel-sdk/conversion-api)

Normalize in ad-conversion-hub before hashing. Use trim and lowercase for
email. Use the hub's current country-code rules for phone. Do not hash a value
twice. Require measurement consent before dispatch. Require ad_user_data
consent before adding hem or hpn.

## Deduplication

Kakao does not document an advertiser-controlled event_id, eventID,
order-number, or other CAPI deduplication field in the accessible guide text.
Kakao says it internally removes duplicate Pixel and CAPI conversions when it
builds the final Moment ad performance report. The Pixel & SDK dashboard can
show both raw sends. [Conversion API FAQ](https://kakaobusiness.gitbook.io/main/tool/pixel-sdk/conversion-api)

Keep the hub event_id in the dispatch log. Do not put it into an undocumented
Kakao field. Send Pixel and CAPI twins with the same business event data. Verify
deduplication in the final integrated report, not only in the dashboard.

## Kakao Click ID

The click parameter is kclid. Enable Kakao Click ID for a supported campaign.
Kakao adds kclid to the landing URL. The Pixel stores it in a first-party
cookie and uses it on later conversion events. [Kakao Click ID](https://kakaobusiness.gitbook.io/main/tool/pixel-sdk/id-kclid)

The official guide does not state a fixed cookie lifetime. The TTL is therefore
UNVERIFIED. Store first-touch and most-recent kclid in first-party storage under
the hub retention policy. Do not invent a 7-day or 30-day TTL.

Kakao does not support kclid for app landings or web landings with redirects.
It supports only listed campaign types and goals. A redirect can discard the
parameter before the Pixel sees it. [Click ID limitations](https://kakaobusiness.gitbook.io/main/tool/pixel-sdk/id-kclid)

## Tracking quirks

- CAPI events without email or phone can arrive but cannot complete normal
  customer matching for conversion measurement.
- Sending both identifiers improves match rate. Kakao says phone matching is
  usually more accurate than email matching.
- CAPI performance measurement currently covers KakaoTalk mobile Bizboard and
  Display. Do not assume other surfaces use CAPI.
- The integrated report removes Pixel/CAPI duplicates. It is a next-day custom
  report, not a real-time dashboard.
- Moment conversion reports expose separate one-day and seven-day metrics,
  including conv_purchase_1d and conv_purchase_7d.
- A conversion campaign needs the Pixel & SDK objective ID. An installed
  tracker that is not linked to the ad account cannot optimize that campaign.
   [Moment metrics](https://developers.kakao.com/docs/en/kakaomoment/type-info) · [Campaign API](https://developers.kakao.com/docs/en/kakaomoment/campaign)

## Verification

1. Request proof: record the redacted CAPI response. A successful request does
   not prove that Kakao counted the event.
2. Platform proof: open Pixel & SDK detail > Dashboard. Filter the source to
   Conversion API. Inspect event history and customer-match rate.
   [Conversion API guide](https://kakaobusiness.gitbook.io/main/tool/pixel-sdk/conversion-api)
3. Business proof: on the next day, download the integrated Moment report.
   Compare deduplicated Purchase results with succeeded payment-provider
   charges. [Moment reports](https://developers.kakao.com/docs/en/kakaomoment/report)

Use Pixel Helper for client proof. It shows event calls, parameters, page URL,
event URL, send time, and load time. Pixel Helper does not prove server delivery.
   [Pixel Helper](https://kakaobusiness.gitbook.io/main/tool/pixel-sdk/pixel-helper)

## Common pitfalls

- Use the Pixel CAPI token for CAPI. Use the Business token for Moment API calls.
- Copy the CAPI token before closing its dialog. Kakao does not show it again.
- Load kp.js before calling kakaoPixel().
- Put the Pixel in web pages and the SDK in apps. They are not server modules.
- Use CompleteRegistration for account signup and SignUp for service
  application.
- Send SHA-256 hem and hpn, never raw email or phone.
- Do not invent a CAPI event_id or send CAPI to the Moment Open API host.
- Do not treat dashboard raw duplicates as final report duplicates.
- Do not treat missing kclid as proof that a purchase was not from Kakao.
- Do not use a non-ISO currency. An omitted currency means KRW.
- Set action_source and app fields only after confirming the v1.8 schema.

## Security

Keep KAKAO_MOMENT_CAPI_TOKEN and KAKAO_MOMENT_ACCESS_TOKEN in the deployment
secret store. Never put tokens in browser code, URLs, logs, tests, screenshots,
or commits. Load kp.js only from Kakao's HTTPS origin.

Apply the hub consent gate before hashing. Do not log raw identity values, hem,
or hpn. Redact tokens and event payloads from retry logs.

Use ad-conversion-hub for canonical events, consent, hashing, click capture,
retry policy, dispatch isolation, and payment reconciliation. Use this skill for
Kakao console gates, names, Pixel methods, CAPI limits, and report behavior.
