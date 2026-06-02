# Census flow map (observed)

The 2026 Census of Population online questionnaire is a multi-page StatCan WET
form hosted on `surveys-enquetes.statcan.gc.ca`. URLs increment as `.../p4`,
`/p5`, ... but **page numbers are not stable** — the form skips pages based on
answers and a progress percentage is shown in the step heading. **Re-snapshot
every page and read the question text; never hardcode page numbers or question
indices.**

This map reflects the **short form** for a 2-person, no-children household,
captured end to end. The **long form** inserts many more questions inside Step D
and adds income/work/education/ethnicity/religion sections — handle those the
same way (snapshot → identify type → ask user → fill).

## Login
- Landing `census.gc.ca` → **"Start questionnaire"**.
- Secure-access-code page: one text field (`1234 5678 9012 3456`), **Start** button.
- Spaces in the code are accepted; the field tolerates the grouped format.

## Step A — Contact & address
1. **Telephone number** (text; hyphens auto-inserted, enter 10 digits).
2. **Email address** (text, optional — household contact).
3. **Address** — usually **pre-filled from the access code**. Verify with the
   user; only edit if wrong. Fields: Number, Apartment/unit, Street name,
   City, Province (dropdown), Postal code.
4. **Is the mailing address different?** radio No/Yes (+ text if Yes).

## Step B — Household roster
- **Number of persons** staying at the address on Census Day (text, e.g. `2`).
- **List all persons** — two columns: **Family name** (left), **Given name**
  (right). Begin with an adult, then spouse/common-law partner, then children,
  then others.
- **Persons who could be excluded** — three No/Yes radios:
  a) staying temporarily / main residence elsewhere in Canada (visitor/secondary);
  b) resident of another country visiting Canada;
  c) foreign government representative.

## Step C — Coverage check
- Anyone listed you were **unsure** should be included? No/Yes.
- Anyone **left out** because unsure? No/Yes.

## Step D — Demographic information (per person)
Asked for every person on the roster. Some questions auto-skip based on answers.
- **Date of birth** — Day (dropdown), Month (dropdown, January–December), Year (text). Then an **age verification** confirmation page.
- **Gender** — Man / Woman / Or please specify (+ text).
- **Sex at birth** — Male / Female.
- **Relationship to Person 1** — only for persons 2+ (Wife / Common-law partner / Son / Daughter / Mother / Father / Roommate / Other …).
- **Marital status** — Never legally married / Legally married (and not separated) / Separated / Divorced / Widowed.
- **Languages — can converse** — English only / French only / Both / Neither.
- **Languages spoken at home (9a)** — checkboxes English / French / Other (+ specify up to several). If 2+ selected, a **9b "most often"** follow-up appears; with one language it auto-skips.
- **Mother tongue (10)** — "first learned at home in childhood and still understands": checkboxes English / French / Other (+ specify). May trigger a soft **Attention** to be more specific (e.g., "Iranian Persian" not "Persian").
- **Schooling in French in Canada (12)** — Yes/No per person (immersion counts).

## Step E — Comments & submit
- Optional free-text **comments** box (1000 char limit).
- **Submit** button (`#__btnSubmit`). → "Thank you" page with a **confirmation code** (format `WXXX-XXXX-XXXX`). Save it as proof.

## Long form — additional sections (not yet captured)
When the access code maps to the long form, expect these after the short-form
demographics, still per person: activities of daily living; sociocultural
(ethnic/cultural origins, population group, Indigenous identity, religion);
mobility (address 1/5 years ago); education (highest credential, field, where);
labour (work last week, employer, occupation, industry, hours, commute);
income (sources, amounts — or consent to use tax data). Same mechanics apply.
