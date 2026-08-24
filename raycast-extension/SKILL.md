---
name: raycast-extension
description: "Build, run, and submit a Raycast extension (TypeScript + React commands on @raycast/api, source under integrations/raycast-extension/) and get it merged into the Raycast Store. Use when creating a new Raycast command, wiring package.json commands/preferences, debugging ray develop/ray build/ray lint, reading an API key from extension preferences, or figuring out why the store PR bounces. Covers the whole path plus the traps that each cost a build/submit round-trip: package.json IS the manifest (a command's name must equal its src/ filename or the command silently doesn't exist), author must be a registered Raycast username, API keys belong in password preferences never in code, raycast-env.d.ts is generated (edit package.json instead), and submission is a PR into the raycast/extensions monorepo — not npm publish. Sibling of the other integration skills (browser-extension, figma-plugin, canva-app, connector-directory-submission). Triggers: 'build a Raycast extension', 'Raycast command', '@raycast/api', 'ray develop', 'ray build fails', 'publish to the Raycast Store', 'Raycast preferences API key', 'raycast/extensions PR rejected'."
---

# Building a Raycast extension

A Raycast extension is **TypeScript + React on `@raycast/api`**: each command is a file in `src/` that default-exports a React component (`List`, `Form`, `Detail`) or a plain async function. Source lives in `integrations/raycast-extension/` as an isolated package that consumes your product's SDK / public REST API like any external consumer. **`package.json` is the manifest** — commands, preferences, categories, author, icon all live there, not in code. Read this before the first file; the command-level playbook is `scripts/raycast-extension/README.md` in the sibling scripts repo. Docs: `developers.raycast.com`.

## The trap that wastes a day: package.json IS the manifest

A command exists only if **the `commands[]` entry's `name` equals its filename**: `"name": "new-post"` requires `src/new-post.tsx` default-exporting the command. Rename the file without touching `package.json` and the command silently vanishes from Raycast; add a file without a manifest entry and it never loads. `ray build`/`ray lint` catch some mismatches — not all.

Corollaries:

- **`raycast-env.d.ts` is generated from the manifest.** Never edit it (the header says so and means it). Change `package.json`, then run `ray develop`/`ray build` to regenerate. It carries the `Preferences.<Command>` types — if those types look stale, the manifest is what you edit.
- **Manifest copy is store copy.** Each command's `title`/`description` (and optional `keywords` for search) is what users see in the store and root search — write it for a stranger, not for yourself.
- **`ray` CLI is local to the package**, invoked via npm scripts (`npm run dev` → `ray develop`, `npm run build` → `ray build`). There is no global install to version-drift against.
- **A stray `prepublishOnly` guard is intentional** — it blocks an accidental `npm publish`. The Raycast Store is NOT npm; keep the guard.

## The other traps that each cost a round-trip

1. **`author` must be a registered Raycast username.** `ray lint` and the store CI reject authors with no Raycast account. Set it to your real Raycast handle before opening the PR, not after the bot complains. Teammates who should open update PRs later go in the manifest's `contributors` (also registered usernames).
2. **The extension `name` is the directory name.** In the monorepo the package lives at `extensions/<name>/` and the bot expects the kebab-case manifest `name` to match the folder. Rename one without the other and CI fails before a human ever looks.
3. **API keys go in `preferences`, never in code.** Declare `{ "name": "apiKey", "type": "password", "required": true, ... }` and read it with `getPreferenceValues<Preferences>()`. A hardcoded key leaks into the public monorepo and gets the PR rejected. Ask for the key alone — if it already scopes a tenant server-side, extra "workspace ID" preferences are dead weight.
4. **Pick the right command `mode`.** `"view"` renders a React UI (List/Form/Detail); `"no-view"` runs a headless async function and returns to the user via toast/hud; `"menu-bar"` lives in the menu bar. A no-view command that tries to render, or a view command with no component, fails at load.
5. **Long API calls need a Toast.** Commands have no implicit progress UI. `await showToast({ style: Toast.Style.Animated, ... })` before the request, then mutate `toast.style`/`toast.title` on completion, and a `Toast.Style.Failure` with the real error message on catch. Silent spinners and swallowed errors are review-bait.
6. **List/Detail/Form are the vocabulary.** Use `List` (+ `List.Item` accessories, `List.EmptyView`) for collections, `Form` (+ `Action.SubmitForm`) for input, `Detail` for read-one. Confirm destructive actions with `confirmAlert`. Don't rebuild these from scratch — the store review expects the native components.
7. **Keep it a thin client.** All business logic stays server-side behind your API; the extension only renders and calls. Reviewers reject extensions that embed secrets, scrape, or duplicate a backend.

## Build path

```bash
cd integrations/raycast-extension
npm install
npm run dev    # ray develop — hot-reloads inside Raycast while you iterate
npm run build  # ray build — type-checks + bundles; must pass before any PR
npm run lint   # ray lint (@raycast/eslint-config)
```

- Scaffold a new extension with `npx create-raycast-extension` or copy the isolated package layout.
- Icon: a 512×512 PNG referenced as `"icon"` (conventionally `assets/command-icon.png`).
- API calls: your product's SDK or public REST endpoint, authenticated with the preference key.
- Data hooks: `@raycast/utils` (`useFetch`, `usePromise`) handles loading/error/revalidate state for lists — use it instead of hand-rolled `useEffect`+`useState` fetch loops.
- Preferences can be extension-wide or scoped to one command (a `preferences[]` entry on the command object) — keep shared config like the API key at the top level so every command inherits it.
- Manifest hygiene: keep `"$schema": "https://www.raycast.com/schemas/extension.json"` at the top so editors validate the manifest; pick `categories` only from the fixed allowed list (an invented category fails the bot).
- UI conventions the review expects: `List.Item` `accessories` for metadata (tags/dates), `List.EmptyView` for the zero state, `ActionPanel` per item with standard shortcuts (`Keyboard.Shortcut.Common.Refresh` etc.), `confirmAlert` before anything destructive.
- Raycast commands run in a Node-flavored runtime with `fetch` available — but not every Node API; keep to the `@raycast/api` surface plus plain `fetch`/stdlib and test under `ray develop`, not bare `node`/`tsx`.

## Submission — Raycast Store

**Submittable: API (PR flow), free.** There is no developer portal upload — the store is the GitHub monorepo `github.com/raycast/extensions` and **a PR is the submission**. `npx @raycast/api@latest publish` (or a `"publish"` script that runs it) is the real submit command: it authenticates with GitHub, forks the monorepo, copies your extension in, and opens the PR for you — you rarely fork by hand.

1. Fork `raycast/extensions`; add the package as `extensions/<extension-name>/`.
2. Set `author` in `package.json` to your registered Raycast username.
3. Run `npm install && npm run build` and `npm run lint` **inside the monorepo layout** — CI reruns both and fails the PR on any error.
4. Open the PR against `raycast/extensions`. A bot checks manifest hygiene (author registered, categories from the fixed allowed list, icon present, README in the extension dir); then a human review follows (days, not minutes). Address review comments by pushing to the same PR.
5. The store page pulls from the extension dir itself: its README becomes the listing, and screenshots live in a `metadata/` folder next to it — PNG, `2000×1250`, named `screenshot-1.png`, `screenshot-2.png`, … (max 6). At least one is required to list. Use Raycast's built-in **Window Capture** to shoot them so the dev-mode icon is stripped.
6. Title the PR the way the monorepo expects — "Add `<name>` extension" for a new listing, "Update `<name>` extension" for changes — so the bot routes it correctly.
7. Updates to an already-listed extension are PRs against the same directory — same flow.

(`npx @raycast/api@latest publish` from the extension dir automates the fork-and-PR dance; it still ends as a human PR review. Run `npm run build` + `npm run lint` clean first — CI reruns both.)

**Silent-rejection gotchas:** command `name` ≠ filename (command missing in review); `author` not a registered username; a hardcoded or committed API key; a README that doesn't tell a fresh reviewer how to get a key (self-serve signup or clear instructions — the reviewer has no account of yours); categories outside the allowed list; icon not a 512×512 PNG; npm-publish leftovers.

## Parity checklist (prove in `ray develop` before opening the PR)

every manifest command loads and renders · authenticate via preferences from a clean state (delete the stored key, paste a fresh one) · each API failure surfaces a Failure toast with the real message · destructive actions confirm · `ray build` and `ray lint` both clean.

## Related skills

- `browser-extension` — another store-reviewed client surface; the "reviewer needs self-serve auth" lesson rhymes.
- `figma-plugin` / `canva-app` — thin-client-over-your-API integrations with their own manifest traps.
- `connector-directory-submission` — the cross-marketplace submission router.
