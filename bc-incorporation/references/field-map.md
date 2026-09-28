# Field map — BC Registries incorporation flow

Every field, captured from a live walk-through. `<placeholder>` = ask the user;
never invent a value.

## 1. Authentication (`account.bcregistry.gov.bc.ca/choose-authentication-method`)

- Button "Log in with BC Services Card app" — user approves on their phone.
  The page states it receives: given names, surname.
- Button "Log in with Username/password + BC Token" — legacy BC OnLine token
  path.
- Link "Set up a BC Services Card account" for users without the app.

## 2. Create account (`setup-account`) — "Account Information"

- Radio: **Individual Person** | **Business** | Government Agency.
- Individual: account name + mailing address + contact.
- Business adds:
  - Legal Business Name — `<business or personal name>`
  - Branch/Division (optional)
  - Business Type — 20-option industry list (`ACCOUNTING FIRM`, `APPRAISER`,
    `AUTOMOBILE DEALER`, `BANK`, `BC LAND SURVEYOR`, `BUILDING SUPPLIES`,
    `CHAMBER OF COMMERCE`, `CONSULTING FIRMS`, `CREDIT REPORTING, PI, SKIP
    TRACERS`, `CREDIT UNION`, `ELECTRICAL CONTRACTOR`, `FINANCING COMPANY`,
    `FIRST NATION INDIAN BAND`, `FORESTRY`, `GAS & ELECTRICAL CONTRACTOR`,
    `GAS CONTRACTOR`, `GAS, PETROLEUM AND MINERAL EXPLORATION`,
    `GENERAL BUSINESS`, `INSURANCE AGENCIES`, `INVESTMENT COMPANY`)
  - Business Size — `1 Employee` / `2-5` / `6-10` / `11-20` / `21-30` /
    `More than 30 Employees`
  - Street Address `<street>`, Additional Street Address (opt), City `<city>`,
    Province/State (opt) `<prov>`, Postal Code `<postal>`,
    Country (readonly select, full ISO list), Delivery Instructions (opt)
  - Next stays disabled until every required field validates — the dropdowns
    are easy to leave unset.

## 3. Account record (after creation)

- Account Number (e.g. `######`), Access Type (`Regular Access`), Account
  Name, Mailing Address — all visible under Account Settings → Account Info.
- Account URL pattern: `account.bcregistry.gov.bc.ca/account/<id>`.

## 4. Business Registry dashboard (`business.bcregistry.gov.bc.ca/account/<id>`)

- "My Products and Services" → My Business Registry → Open.
- Buttons: "Manage my Business" / "Request a Name".
- Search radios: Existing Business | Name Request (for retrieving an NR filed
  while logged out — needs NR number + the contact phone/email used).
- "My List" table: Name / Number / Type / Status / Actions columns; an
  approved NR gains a "Register Now" action.

## 5. Name Request (`names.bcregistry.gov.bc.ca`)

Tabs: "Get a Business Name or Start a Numbered Business" | "Manage My Name
Request".

- Action (nested-select) → "Start a new BC-based business" (other branches
  cover existing-business actions).
- "Select type of business in B.C." — choose the BC limited company entry.
- Named | Numbered fork.
- Named: "Enter a name to request" `<name>` + "Select a Designation"
  (`INC.`/`LTD.`/`CORP.`/`INCORPORATED`/`LIMITED`/`CORPORATION` family —
  a named BC company legally requires one) → "Check this Name".
- Checks: Name Structure Check (needs distinctive + descriptive elements +
  designation; a bare coined word warns "Ensure there is a descriptive
  element") and Similar Name Check (lists existing names — informational,
  examiner decides).
- Then: "Submit this Name for Review" → applicant details (name, address,
  phone/email — up to 3 ranked name choices on one request) → pay.

## 6. Incorporation application

Launched from My List → "Register Now" / "Incorporate using the NR".

1. NR confirm + checkbox for translated names used outside Canada (else skip).
2. Registered Office — delivery address `<BC street>`; mailing same-as or
   different.
3. Records Office — same shape.
4. Contact Information — email (required) `<email>`, phone (optional),
   Folio/Reference (optional).
5. People and Roles — Completing Party first, then ≥1 Incorporator and ≥1
   Director; each person: legal name + mailing address; checkboxes stack roles
   on one person.
6. Share Structure — "Add Share Class": name `<e.g. Common>`; maximum number
   or no maximum; par value or no par value; special rights/restrictions yes/no.
   ≥1 class required. Standard default: unlimited, no par value, no special
   rights.
7. Agreement & Articles — "sample Incorporation Agreement and Articles" or
   "custom" (custom = lawyer territory).
8. Review and Confirm — step-bar navigation back to any step; effective
   date/time: immediate or future ≤10 days (+$100).
9. Certify — checkbox; legal name auto-fills from the logged-in identity.
   Then File and Pay → credit card → $351.50.

## After filing

Company dashboard → History → download incorporation documents (notice of
articles, incorporation application, certificate). Corporation number format
`BC#######`. Annual reports recur yearly from the dashboard.
