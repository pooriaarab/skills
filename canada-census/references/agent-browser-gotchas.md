# agent-browser gotchas for the StatCan WET form

The census runs on the Government of Canada **WET (Web Experience Toolkit)**
form framework. It uses custom-styled inputs and JS-driven validation that
break naive automation in three specific ways. Encode these or the form will
silently refuse to advance with no visible error.

## 1. Radios & checkboxes: `check`/`click @ref` doesn't fire `change`

The real `<input type=radio|checkbox>` elements are visually hidden behind
styled labels. Consequences:
- `agent-browser click @<radio-ref>` often does **nothing** (the input isn't the
  hit target).
- `agent-browser check @<radio-ref>` **sets `.checked` but does not dispatch the
  `change` event** the WET validation model listens for. The DOM looks correct,
  no error shows, but **Next won't advance**.

**Fix — native click via `eval`.** Uncheck the whole radio group first so a real
state change fires, then call native `.click()` (which dispatches a trusted-style
click → `change`):

```bash
env -u AGENT_BROWSER_AUTO_CONNECT agent-browser --session census eval '(() => {
  // pick the target radio by its label text
  const r = [...document.querySelectorAll("input[type=radio]")]
    .find(x => [...(x.labels||[])].some(l => /^\s*No\s*$/i.test(l.textContent.trim())));
  document.querySelectorAll(`input[name="${r.name}"]`).forEach(o => o.checked = false);
  r.click();                       // fires click + change
  return r.name + "=" + r.checked;
})()'
```

For checkboxes (multi-select, e.g. languages), just native-click each desired
box if not already checked — no need to clear the group:

```bash
... eval '(() => {
  const want = ["English","Other language"];
  const cbs = [...document.querySelectorAll("input[type=checkbox]")]
    .filter(x => [...(x.labels||[])].some(l => want.includes(l.textContent.trim())));
  cbs.forEach(c => { if (!c.checked) c.click(); });
  return cbs.map(c => c.labels[0].textContent.trim()+"="+c.checked).join(", ");
})()'
```

When the same label appears once per person (e.g. "Man" for both Person 1 and
Person 2), the `filter` above returns them in DOM order — index 0 = first
person, etc. Disambiguate by the input `name` (e.g. `ROSTER_PEOPLEGender[0]`
vs `[1]`) when you need to target one specific person.

## 2. There are TWO "Next" buttons — click `#__btnNext`

The page contains a hidden submit (`class="wb-inv"`, web-invisible) **and** the
real visible one. `find role button --name "Next"` / `find text "Next"` may hit
the invisible one, which does nothing. Always:

```bash
env -u AGENT_BROWSER_AUTO_CONNECT agent-browser --session census eval 'document.getElementById("__btnNext").click(); "next"'
```

Submit button is **`#__btnSubmit`** (same pattern). Previous is `#__btnPrevious`.

## 3. Text inputs & dropdowns work natively

`agent-browser fill @ref "..."` and `agent-browser select @ref "Label"` fire the
proper events and commit fine. Use them for: telephone, email, address fields,
"specify" language boxes, day/month dropdowns, year, comments. Verify with
`get value @ref`.

## 4. Soft "Attention" warnings are non-blocking

After Next, the form may stay on the page and show an **"Attention"** panel
(e.g. "be more specific in question 10 — report Dari or Iranian Persian instead
of Persian"). This is **not** a hard error. Either refine the answer (re-`fill`
the specify box with the precise term) and click Next again, or — if the user is
satisfied with the original — clicking Next a second time accepts it.

## 5. Session / environment

- `AGENT_BROWSER_AUTO_CONNECT=1` may be set in the environment, which forces
  attaching to a running Chrome and conflicts with `--cdp`/fresh sessions. Run
  every command with `env -u AGENT_BROWSER_AUTO_CONNECT ...` and an isolated
  `--session <name>`.
- Use `--headed` so the respondent can watch and verify before submit.
- The census login is via the access code (not Google), so a fresh browser
  context is fine — you do not need the user's real Chrome profile.

## 6. General loop hygiene

- **Re-snapshot after every navigation** — refs (`@e1`…) are invalidated.
- Read the **progress %** in the step heading to gauge position; don't rely on
  the `/pNN` URL number (it's non-sequential and skips).
- If Next doesn't advance and there's no visible error, you almost certainly hit
  gotcha #1 (change event) or #2 (wrong Next button). Check both before
  re-trying blindly. A full-page `screenshot` quickly confirms field state.
