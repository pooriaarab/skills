---
name: incorporate-bc-company
description: "Operator runbook for incorporating a British Columbia for-profit company through the new BC Business Registry — account creation, named-vs-numbered decision, the Name Request flow (fees, wait times, check results), the numbered-company skip path, the incorporation application's five steps, and the Vuetify-2 automation traps on the registry UI. Use when registering a BC company, choosing provincial vs federal incorporation, or unlocking grant programs that require a BC-incorporated for-profit (Innovate BC ESDC, IRAP, SR&ED). Verified end-to-end 2026-09-27 on account.bcregistry.gov.bc.ca."
---

# Incorporate a BC For-Profit Company

A named BC limited company costs about **$382 total** ($31.50 name request + ~$350 incorporation filing) and takes **~5 business days** for the name, then ~1–2 days for the filing. A numbered company skips the name request entirely — **~$350, same day**. Verified against the live registry flow 2026-09-27; fees change, confirm on the fee schedule page before filing.

**Use when:** incorporating in BC, deciding provincial vs federal, or a grant (Innovate BC ESDC, IRAP, SR&ED) requires a for-profit company incorporated in British Columbia.

## Provincial vs federal

Pick BC when the company operates in BC and a program asks for "a company incorporated in British Columbia" (the Innovate BC ESDC call says exactly this). A federal corporation must also register extra-provincially in BC to operate here — roughly $550 combined and two annual filings forever, versus $350 and one.

## The three systems, and which one you want

| System | URL | Use |
|---|---|---|
| BC Registries account | `account.bcregistry.gov.bc.ca` | Portal identity, products, payment |
| Name Request app | `names.bcregistry.gov.bc.ca/<accountId>` | Named companies; numbered bypasses it |
| Business dashboard / Create app | `business-dashboard.bcregistry.gov.bc.ca/<draftId>` → `create.business.bcregistry.gov.bc.ca` | The incorporation filing itself |

There is also legacy **Corporate Online** (`bconline.gov.bc.ca`) — ignore it; the new registry is cheaper to operate and where modern filings live.

## Step 0 — Account (one time)

`account.bcregistry.gov.bc.ca/setup-account` — three steps: Account Information → Account Administrator → Products and Payment.

- User type **Business** (not Individual — business accounts attach filings to the company).
- Legal Business Name is the *account* name; it does not create the company.
- Business Type: `GENERAL BUSINESS` fits software; Business Size: pick true headcount.
- No BCeID is required for this portal account — email + password + a card on file is enough. Business BCeID is a separate government credential used by *other* ministries (needed for WorkBC etc., not for incorporation).

## Step 1 — Named or numbered

On `names.bcregistry.gov.bc.ca/<accountId>`, tab **"Get a Business Name or Start a Numbered Business"**:

- **Action:** "Start a new BC-based business" (menu item value `NEW`, group 0 — a second `NEW` exists under extraprovincial; pick the group-0 one).
- **Type:** "Limited Company" for a corporation. Sole proprietorship/DBA/partnership are the other options.
- **Radio:** `namedCompany` vs `numberedCompany`.

**Numbered** shows "Incorporate using the New BC Business Registry" → click it → a draft filing is created at `business-dashboard.bcregistry.gov.bc.ca/<tempId>?accountid=…` and the Create app opens at `create.business.bcregistry.gov.bc.ca/incorporation-define-company?id=<tempId>`. No name request, no wait.

**Named** requires the Name Request first: enter the name in caps (`PHARMFLOW SOLUTIONS`), pick a designation (`INC.` / `LTD.` / `CORP.` etc.), click **Check this Name**. The check returns three verdicts:

- *Name Structure Check* — OK or fix.
- *Similar Name Check* — 50 similar names is normal for distinctive prefixes; not a blocker.
- *Unknown words* — any coined word (e.g. "PharmFlow") blocks **auto-approval** and sends the NR to manual examination regardless.

Then **Submit this Name for Review** → applicant details → payment. The NR only exists once paid. Fees: ~$31.50 standard (~5 business days), **+$100 priority** (~1 day), renewal $30/56 days. You can submit up to 3 name choices per request.

## Step 2 — The incorporation application

Five steps: **Define Your Company → Add People and Roles → Create Share Structure → Incorporation Agreement → Review and Confirm.**

- **Name:** numbered shows `[Incorporation Number] B.C. LTD.` — the number is assigned at filing completion.
- **Registered + Records Offices:** mailing *and* delivery addresses, all in BC; delivery address **cannot be a PO Box**. "Same as Mailing Address" checkboxes collapse the duplicate fields.
- **People and Roles:** incorporator + at least one director (can be the same person). Directors need full legal name + mailing address.
- **Share structure:** plain "Common Shares" class with unlimited authorized shares is the default-safe choice; preferred shares matter only when taking investment.
- **Incorporation Agreement:** each incorporator e-signs — date + typed name counts.
- **Review and Confirm → File and Pay:** ~$350 via the registry's payment app (credit card). Filing completes in ~1–2 business days (banner said "All other filings: 10 business days" during a backlog — check the banner).

The draft auto-saves; the URL `business-dashboard.bcregistry.gov.bc.ca/<tempId>` is the re-entry point if the tab closes.

## Automating the registry UI (the traps that cost a session)

The apps are **Vuetify 2** (`v-input__slot`, `v-select__slot`, detached `.v-menu__content`). Three traps:

1. **Snapshot refs expire on re-render.** `agent-browser` refs die whenever the Vue tree re-mounts — which includes switching tabs between calls. Take the snapshot and click the ref in the same breath, or drive the DOM directly.
2. **Synthetic clicks don't open v-selects reliably; `el.click()` on options doesn't commit.** Instead, reach the component and call the model API:
   ```js
   var vm = document.querySelector('#request-action-select').__vue__;
   var it = vm.items.find(i => i.text && i.text.includes('Start a new'));
   vm.selectItem(it);
   ```
   Same for the entity-type and designation selects. The selection shows in `.v-select__selection`, not `input.value` (the input is a readonly display proxy).
3. **Text inputs need the native setter:** `Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(el,v)` + `input`/`change` events, or the v-model never sees the value and validation reads empty.

Also expect **tab drift** if the human is using the same Chrome — pin your tab (`tab <id>` chained into every command) or you will eval against whatever they're looking at.

## After incorporation

- You get: incorporation number (`BC1xxxxxx`), certificate, notice of articles. Register a CRA business number + GST/PST accounts separately.
- Annual report due each year (~$43) — missing two in a row dissolves the company.
- Grant-specific: ESDC wants BC-incorporated for-profit + a pilot partner; IRAP wants the for-profit + a call with an ITA; SR&ED is claimed at tax time by the corporation.
