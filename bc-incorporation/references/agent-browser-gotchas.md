# agent-browser gotchas on BC Registries

The apps are Vue 2 / Vuetify SPAs. Expect these traps.

## Invisible overlays still block clicks

`.loading-container.grayed-out` keeps intercepting pointer events while it
fades out (`fade-transition-leave-active`, `offsetParent === null`).
agent-browser reports "element is covered". Either wait ~8s for it to leave
the DOM, or force-hide it:

```js
document.querySelectorAll('.loading-container').forEach(e => e.style.display='none')
```

The same symptom: an empty `.v-overlay--active` dark scrim with no content —
Escape or click the scrim clears it.

## v-selects are readonly inputs, not selects

"Action", "Country", "Select a Designation" render as `input[readonly]`
inside a `.v-select`. `fill` writes text Vue ignores; `select` does not apply.

To open: dispatch **one** click on the `.v-select` container. Dispatching
click on the container AND the append icon toggles it twice — net closed.
To pick an option: after the menu opens, click the matching
`.v-list-item__title` inside `.v-menu__content--active`:

```js
const menu = document.querySelector('.v-menu__content--active');
[...menu.querySelectorAll('.v-list-item__title')]
  .find(e => e.textContent.trim() === 'Canada')?.click();
```

Verify by reading the `.v-select__slot input[type=hidden]` value afterwards —
typing into the readonly input leaves stale text in hidden fields that fails
validation silently.

## Virtualized lists hide options from the a11y tree

Long dropdowns render only visible rows; `snapshot` shows a truncated set and
an empty `listbox` ref. Dump the DOM instead:

```js
[...document.querySelectorAll('.v-menu__content .v-list-item__title')]
  .map(e => e.textContent.trim())
```

The country list alone is ~250 entries.

The DOM dump reads only the rows the menu has rendered. To reach an option
that is not on screen (for example a country late in the alphabet), type the
first letters into the field when it filters, or scroll the menu element
(`.v-menu__content`) step by step and dump again after each step. Select the
row only when its text matches exactly.

## Nested-selects are custom

The Name Request "Action" and business-type fields use a `nested-select`
component — not a standard menu. Options render in a cascade; snapshot the
page after each selection and prefer real Playwright clicks on the rendered
labels over eval clicks.

## Deep links boot an empty app

`business.bcregistry.gov.bc.ca` or `/account/<id>` loaded directly can render
`#app` with zero text ("JavaScript must be enabled" in body but JS ran — a
boot failure). Enter through `account.bcregistry.gov.bc.ca` and click Open on
My Business Registry instead of deep-linking.

## Refs die on navigation; sessions share the browser

Every Vue route change invalidates `@e` refs — re-snapshot per step. Separate
`--session` names still share one Chrome instance in some setups: restored
tabs from a cloned profile steal focus mid-task. `tab list` often; close
stale restored tabs before driving.
