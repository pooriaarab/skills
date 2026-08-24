---
name: twilio-number-provisioning
description: "Use when buying and provisioning a Twilio phone number for a product — a memorable/vanity number, and wiring it to WhatsApp Cloud API, SMS, and voice. Covers the Twilio CLI (auth, searching available numbers, buying), scoring numbers for memorability (repeating/pattern digits, the '888 is least-scammy toll-free' rule, why vanity like 1-8XX-BRAND rarely exists in self-serve inventory), and the big trap: a brand-new TOLL-FREE number CANNOT send/receive SMS until its toll-free registration is approved (days), so WhatsApp/OTP verification codes silently never arrive — a local 10-digit number verifies far more reliably. Then: registering the number with WhatsApp Cloud API (the number gets consumed for WhatsApp; verify by SMS or VOICE), a ZERO-SERVER trick to auto-capture a spoken voice verification code via a Twilio Studio Flow, the Twilio toll-free registration intake form field-by-field (legal name vs DBA, non-US business registration number, opt-in proof + the consent language carriers require on your Terms/Privacy), and the env vars an app needs. Triggers: 'buy a twilio number', 'get a memorable phone number', 'twilio whatsapp verification not arriving', 'register toll-free', 'toll-free SMS not working', 'set up a business phone number', 'read the SMS/voice OTP from twilio', 'twilio number for whatsapp'."
---

# Twilio number provisioning

Buy a number, then wire it to WhatsApp / SMS / voice. The order and the number *type*
matter more than anything — pick wrong and verification silently fails for days.

## Twilio CLI setup

Install: `npm install -g twilio-cli` (binary `twilio`). Auth without an interactive
login by exporting creds — the CLI reads them from the environment:
```bash
export TWILIO_ACCOUNT_SID="AC…"   # 34 chars, starts AC
export TWILIO_AUTH_TOKEN="…"      # 32 hex
twilio api:core:accounts:fetch --sid "$TWILIO_ACCOUNT_SID" -o json   # verify: status "active", type "Full"
```
You cannot create the Twilio account for the user (account creation is theirs). A
**Full** (not Trial) account is required to buy a real number and run WhatsApp production.

## Search + score numbers for memorability

Twilio's `Contains` search is **prefix-anchored** (`"833*******"` works; leading-wildcard
`"*******7777"` returns nothing), and true vanity (`1-8XX-BRAND`) is essentially never in
self-serve inventory. So: pull a large batch and score locally.
```bash
# toll-free (business, national, free-to-call): one call per prefix, collect, score
twilio api:core:available-phone-numbers:toll-free:list --country-code US \
  --contains "888*******" --sms-enabled --mms-enabled --voice-enabled --limit 30 -o json
# local (more reliable for WhatsApp verify): use --area-code
twilio api:core:available-phone-numbers:local:list --country-code CA --area-code 604 \
  --sms-enabled --mms-enabled --voice-enabled --limit 30 -o json
```
Score by repetition: weight runs of the same digit hard (a pair=+3, triple=+12, quad=+27),
bonus for `ABAB`/`AABB` last-4 and ascending sequences. Present the top ~6 with the pattern
spelled out ("84-84 repeating"), then let the user pick.

**Least-scammy toll-free prefix: 888** (oldest after 800, reads as an established business).
833/844 are newest and read spammier. A number people *text* (WhatsApp/SMS bot) barely
needs vanity — they tap a `wa.me` link or scan a QR, they don't dial it. Don't over-optimize.

Buy (this CHARGES ~$1.15–2.15/mo — confirm the exact number + cost with the user first):
```bash
twilio api:core:incoming-phone-numbers:create --phone-number "+18886555892" -o json
# returns sid PN… + capabilities {voice,sms,mms}
```

## THE BIG TRAP: toll-free can't SMS until registered

A brand-new toll-free number's SMS/MMS say **"Registration required"** and are BLOCKED until
its **toll-free verification** is approved (days to weeks). So a WhatsApp / OTP verification
code sent by SMS **silently never arrives** — Twilio logs zero delivery attempts
(`twilio api:core:messages:list --to "+1…"` → "No results"). This is not lag.

- **Local 10-digit numbers verify immediately** and are the reliable choice for WhatsApp/OTP.
  If the plan is "one number for WhatsApp + SMS + website", a toll-free still needs its
  registration approved first; a local number sidesteps the wait.
- Check the number's status: `incoming-phone-numbers:fetch --sid PN…` → `smsUrl` empty +
  capabilities all true is normal; the block is carrier-side, not a config gap.

## WhatsApp Cloud API registration (Meta side)

Registering a number to WhatsApp Cloud API **consumes it for WhatsApp** (it can no longer be
used in the consumer WhatsApp app). Flow: Meta app → WhatsApp use case → "Register your
WhatsApp phone number" → enter the number → verify by **SMS or phone call**.

- On a **Twilio** number you own, the code lands at Twilio, so you can read it yourself:
  - **SMS:** `twilio api:core:messages:list --to "+1…" --limit 5` (only works once SMS is
    unblocked — see the toll-free trap above).
  - **VOICE (zero-server auto-capture):** point the number's Voice URL at a Twilio **Studio
    Flow** that answers and gathers the spoken/DTMF code, then read the flow execution:
    ```bash
    # publish a flow (POST Definition@flow.json to https://studio.twilio.com/v2/Flows,
    #   FriendlyName + Status=published). Widgets: trigger → gather-input-on-call
    #   (input "dtmf speech", num_digits 8, finish_on_key "#") → say-play.
    #   NOTE: there is no "hangup" widget type — just end after say-play.
    twilio api:core:incoming-phone-numbers:update --sid PN… \
      --voice-url "https://webhooks.twilio.com/v1/Accounts/AC…/Flows/FW…" --voice-method POST
    # then poll: GET https://studio.twilio.com/v2/Flows/FW…/Executions  → read the gathered digits
    ```
- Meta's SMS/voice to a fresh toll-free is subject to the same block — expect to wait for the
  toll-free registration before verification succeeds.

## Toll-free registration intake form (Twilio Console)

`1console.twilio.com → Phone Numbers → the number → Regulatory/Toll-free registration`. Manual
entry (no existing compliance profile) walks these fields:
- **Legal business name** = the exact registered entity. For a nonprofit product, this is the
  *foundation/company*, not the product. **Business DBA** = the product/consumer-facing name.
  (Legal-entity-operates-product-under-brand is exactly what the DBA field is for.)
- **Company type** (Non profit / …), **issuing country** (auto-detects), **Business registration
  ID type** (picks the country-correct one, e.g. "Canada: Canadian Business Number (CBN)"),
  **registration number** — for a Canadian BN like `705955300RC0001`, enter the **9-digit CBN**
  (`705955300`) without the `RC0001` program-account suffix.
- **Authorized representative** — a real officer/director's name, email, phone (a legal
  designation; get the user to confirm who, don't guess).
- **Use case** — for a 2-way conversational assistant, "Customer Care" fits (no "Conversational"
  option exists). Volume: pick a modest tier (e.g. 1,000/mo).
- **Opt-in** — the most-scrutinized part. Opt-in type "Web form"; **Opt-in policy proof** = a
  URL showing the exact consent point (a signup form with an *un-pre-checked* consent checkbox,
  message-type + frequency + rate disclaimers + HELP/STOP + ToS/Privacy links). If no compliant
  form is live, host a screenshot on a public URL (Google Drive). A bare homepage URL is the
  usual rejection cause.
- Terms + Privacy URLs (verify they 200 first).

**Carriers read the linked Terms/Privacy.** They must contain: consent to receive texts, message
frequency, "message & data rates may apply", reply HELP/STOP, "consent is not a condition of
purchase", and in Privacy the exact carve-out **"mobile information / SMS consent is not shared
with or sold to third parties for marketing."** Add these before submitting if missing.

## App env vars (typical)

`TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` (E.164). For WhatsApp, the app
also needs the Meta-side values (`WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_BUSINESS_ACCOUNT_ID`,
`WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_APP_SECRET`, `WHATSAPP_VERIFY_TOKEN`) — see the
`messaging-bot-onboarding-setup` skill for the WhatsApp webhook/verify-token half.

## Gotchas

- Meta's WhatsApp wizard pages are JS-heavy and freeze browser automation on paste — type in
  short chunks, verify with a zoom screenshot, prefer the Twilio console (lighter) for long text.
- Entering a business tax/registration ID via automation may be blocked by a safety classifier —
  hand that one field to the user, then continue.
- `timeout` isn't on macOS by default (`gtimeout` via coreutils); don't wrap polls in it.
