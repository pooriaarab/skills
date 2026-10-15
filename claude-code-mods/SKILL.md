---
name: claude-code-mods
description: "Use when building, testing, debugging or publishing a Claude Code mod: a plugin whose JavaScript or TypeScript hooks module runs inside Claude Code to draw panes, restyle the spinner or tool rows, guard tool calls, rewrite prompts, or add /commands that run with no Claude turn. Covers mod vs settings hook vs skill vs MCP, the three-file layout, the static-analysis rules that fail validation, the --plugin-dir hot-reload loop, claude plugin validate and claude plugin test, publishing through a marketplace or Anthropic's directory, and the pitfalls that make a mod silently do nothing."
---

# Building and publishing a Claude Code mod

A mod is a Claude Code plugin with a **hooks module**: a `.js` or `.ts` file
that Claude Code loads into its own process. Claude Code calls your functions
on events (a tool call, a submitted prompt, a part of the interface being
drawn). Each function can observe the event, rewrite it, or answer it. Mods
shipped in Claude Code v2.1.287. This skill was verified on v2.1.300.

Official manual: <https://code.claude.com/docs/en/plugins/mods/overview>.
The built-in `plugin-authoring` skill (`/plugin-authoring`) gives Claude the
events and methods of your exact build. Use it together with this skill.

## When to use

- **Triggers:** 'make a mod', 'Claude Code mod', 'add a pane to Claude Code',
  'change the spinner', 'hooks module', 'register.js', 'claude plugin
  validate', 'claude plugin test', 'publish a mod', 'mod does nothing'.
- You want something a settings hook, skill, or MCP server cannot do: draw
  an interface, redraw Claude Code's own rows, hold a tool call while you
  ask the user, or run a `/command` with no model turn.
- Siblings: `git-guardrails-claude-code` (settings-hook guards),
  `claude-code-context-diet` (trim what each request carries),
  `agentic-cli-npm-package` (CLI + MCP companions), `vscode-extension`.

## Pick the right tool first

| You want | Use |
|---|---|
| A pane, a band above the prompt, a toast, a changed spinner or tool row | Mod |
| A `/command` that runs your code at once, even while Claude works | Mod |
| To hold a tool call, ask the user, then allow or deny | Mod (`$.ui.ask`) |
| To block, allow or log an event with a script you already have | Settings hook |
| Instructions you keep pasting into chat | Skill |
| Claude must reach an external system | MCP server |

One plugin can hold a mod, skills, and an MCP server together.

## The layout

```text
my-mod/
├── .claude-plugin/
│   └── plugin.json      # manifest; mods add no required fields
├── hooks/
│   ├── hooks.json       # { "modules": ["./register.js"] }  <- this key makes it a mod
│   └── register.js      # the hooks module; exports register(on, options)
└── tests/
    └── my-mod.test.ts   # run by `claude plugin test`
```

No Node.js, bundler, or build step is needed. Claude Code loads `.js`, `.mjs`,
`.cjs`, `.jsx`, `.ts`, `.mts`, `.cts`, and `.tsx` directly, as ES modules.

A working sample with tests is in [`example/tool-tally/`](example/tool-tally/).
It counts tool calls beside the spinner, adds `/tally`, and refuses force
pushes with a guard that fails closed.

## The hook shape

```javascript
let calls = 0                                 // module state, shared by all hooks

export function register(on) {
  on('tool.call', async ($, e, next) => {     // $ = mods API, e = frozen event
    calls += 1
    $.ui.invalidate('ui.render')              // ask for a redraw
    return next(e)                            // observe: pass on unchanged
  })

  on('ui.render', { component: 'Spinner' }, async ($, e, next) =>
    next({ ...e, props: { ...e.props, suffix: ' · ' + calls }}))   // rewrite: pass a copy

  on('tool.call', { tool: 'Bash' }, async ($, e, next) =>
    /rm -rf \//.test(e.command) ? { deny: 'Refused.' } : next(e))  // answer: no next()
}
```

- **Observe**: do work, `return next(e)`. To act after, `const r = await next(e)`.
- **Rewrite**: `next({ ...e, field })`. `e` is deeply frozen. Assignment throws.
- **Answer**: return a result and skip `next`. Later mods and Claude Code do not run.
- **Matcher**: the second argument to `on`. A field takes a value, an array,
  or a regex: `{ tool: ['Edit', 'Write'] }`, `{ tool: /^mcp__github__/ }`.
- `'*'` matches every event except telemetry. `'classic.*'` matches every
  settings-hook event (`classic.Stop`, `classic.PostToolUse`, ...).

## Events you use most

| Event | Fires when | Return |
|---|---|---|
| `session.start` | Before the first prompt, and after each reload of the mod | `next(e)` |
| `tool.call` | A tool is about to run | `next(e)`, `{ deny }`, or `{ result }` |
| `tool.check` | The allow/ask/deny decision; `next(e)` gives what rules decided | `{ decision, reason }` |
| `prompt.submit` | A prompt is sent | `next({...e, text})`, `next({...e, context})`, `{ drop }` |
| `command.run` | A `/command` runs | `{ text }`, `{}`, or `next(e)` |
| `turn.step` | One model request (async generator) | `yield* next(e)`, `next({...e, model})` |
| `turn.complete` | A turn ends | `next(e)`, or `{ text }` for a line under the answer |
| `ui.render` | A render site is drawn | an element tree, or `next(e)` |
| `ui.press` / `ui.input` / `ui.select` | A control you drew is used | |
| `classic.SessionStart` | After `/clear`, `/resume`, `/branch` too | `next(e)` |

Render sites for `ui.render`: `Pane`, `AbovePrompt` (the band), `Spinner`,
`UserMessage`, `AssistantMessage`, `ToolUse`, `ToolResult`, `ToolGroup`,
`CommandOutput`, `AskUserQuestion`, `ToolProgress`, `TurnDuration`,
`InfoNotice`, `SessionMode`, `PromptHint`. Elements come from
`$.ui.resolve(e)`: `Box`, `Text`, `Button`, `Link`, `Code`, `Markdown`,
`Input`, `Select`, plus `Svg` (Desktop and VS Code only), `Raster` and `Image`
(terminal only), and `Client`.

## Mods API you use most

| Call | Does |
|---|---|
| `$.command.register({ name, description })` | Adds a `/command`. Answer it in a `command.run` hook. |
| `$.ui.open({ id, title, focus: true })` | Opens a pane. Draw it in `ui.render` with `e.requestId === id`. |
| `$.ui.toast(text)` / `$.ui.log(text)` | Toast at top right / dim transcript line Claude does not read |
| `$.ui.log(text, { to: 'debug' })` | Line in the debug log only |
| `$.ui.ask(question, [labels])` | Holds the hook until the user picks. Rejects in `-p`. |
| `$.state` + `atom`, `read`, `update` from `claude-code` | Reactive state that survives a hot reload |
| `$.store.get/set` | JSON key-value store shared by every session on the machine (4 MiB) |
| `$.process.run([...argv])` | Runs a program (30 s default timeout) |
| `$.http.fetch`, `$.fs.read/write`, `$.model.complete` | Network, files (4 MiB), a model call on the user's plan |
| `$.session.usage()` | Context tokens, window, percent, rate limits, cost |

The full reference is the `.d.ts` that Claude Code writes into
`.claude-plugin/types/` when it loads your mod from `--plugin-dir`. Trust it
over any page, this one included.

## Make one

### Ask Claude

In an interactive session, describe the mod: `make a mod that shows the
current git branch above the prompt`. Claude writes it under
`~/.claude/dev-mods/<session-id>/<name>/`. Approve **Enable for this
session** at the hot-reload question. The mod reloads at the end of each turn
that changes it.

That folder is deleted after `cleanupPeriodDays`. To keep the mod, copy it to
a directory of your own, such as `~/mods/git-branch`.

### Write it yourself

1. Create the three files from [The layout](#the-layout).
2. Start a session on the working copy: `claude --plugin-dir ./my-mod`.
3. Edit and save. The transcript prints a reload line with the hook list.
4. Validate: `claude plugin validate --strict ./my-mod`.
5. Test: `cd my-mod && claude plugin test`.
6. Run end to end with no model turn: `claude -p "/tally" --plugin-dir ./my-mod`.

To change an existing mod with Claude, start with `--plugin-dir` pointed at it.
Claude's edits then load in the same session.

## Validate and test

`claude plugin validate` runs the same static analysis Claude Code runs at
load. Read its lines:

```text
  ❯ ./register.js hooks: session.start, tool.call, tool.call{tool=Bash}, command.run{command=tally}, ui.render{component=Spinner}
  ❯ ./register.js answers its own command: command.run{command=tally}
  ❯ ./register.js gating hook without .catch: tool.call
  ❯ ./register.js gating hook with .catch: tool.call{tool=Bash}
  ❯ ./register.js calls: $.command.register, $.ui.invalidate
✔ Validation passed
```

If an event you meant to handle is missing from `hooks:`, Claude Code will not
call that hook either. `calls:` is what a reviewer reads to decide whether to
trust the mod.

`claude plugin test` runs every `*.test.ts` with no session, sign-in, or
network. The test's `$` acts as Claude Code. Its `on` registers stubs that
answer in Claude Code's place:

```typescript
import { expect, test } from 'claude-code/testing'

test('a force push is refused', async ($, on) => {
  on('tool.call', () => ({ result: 'pushed' }))          // stub the real tool
  const out = await $.tool.call({ tool: 'Bash', command: 'git push -f origin main' })
  expect(out.deny).toMatch(/Force pushes are refused/)
})
```

- A stub for a mods API call returns `{ value }`: `on('store.get', () => ({ value: 7 }))`.
- A stub for a Claude Code event returns the event's result: `{ result: 'ok' }`.
- Kit mocks: `mock.clock(on)`, `mock.store(on, {...})`, `mock.env(on, {...})`, `mock.session(on)`.
- Draw a site with `$.ui.mount({...})`, then `press`, `input`, `select`, `find`.
- The command exits 1 on failure, so it works in CI.

[`example/verify.sh`](example/verify.sh) runs validate, the tests, and the
headless `/tally` check in one go.

## Publish

A mod publishes exactly as a plugin does.

1. **Name it for good.** Kebab-case, and never starting with `claude-`,
   `anthropic-`, or `cc-plugin-`. Validation refuses those names. A rename
   breaks every install, so set `displayName` for the label instead.
2. **Version it.** Bump `version` on every release, or omit it in a
   git-hosted marketplace so the commit SHA is the version. If you set it and
   forget to bump it, `claude plugin update` says the user is already current.
3. **Fill the metadata.** `description`, `author`, `homepage`, `repository`,
   and a `README.md` that states the Claude Code version you tested with.
   Events and methods change between releases.
4. **Validate strictly:** `claude plugin validate --strict ./my-mod`.
5. **Pick a route:**

| Audience | Route |
|---|---|
| A few people | Send the folder or a `.zip`. They run `claude --plugin-dir ./my-mod`, or `--plugin-url <zip URL>`. |
| Your team, or anyone | Add `.claude-plugin/marketplace.json` to a git repo (below). |
| Your organization | An admin installs it through managed settings (`prependPlugins` / `appendPlugins`). |
| claude.ai, Cowork, and Claude Code users | Submit at <https://claude.ai/directory/manage> (paid plan). Users get it as `<name>@synced`. |

A marketplace in the plugin's own repo:

```json
{
  "name": "your-marketplace",
  "owner": { "name": "Your Name" },
  "plugins": [{ "name": "my-mod", "source": "./" }]
}
```

Users install it with:

```bash
claude plugin marketplace add your-org/your-repo
claude plugin install my-mod@your-marketplace
# or in a session: /plugin install my-mod --marketplace your-org/your-repo
```

After an install from the shell, run `/reload-plugins` in an open session.
Check what loaded with `/plugin`: a dim line reads `1 mod active · my-mod`.

## Pitfalls

Each of these makes a mod fail or do nothing. Items marked **seen** were
reproduced on v2.1.300 while building `example/tool-tally`.

### Validation failures

- **seen** `const ui = $.ui` fails: `$.ui is used as a value`. Write every
  call in full: `$.ui.toast(...)`. Do not destructure, alias, or index `$`.
  You can pass `$` to a top-level function in the same file.
- **seen** A typo in an event name fails: `"tool.calls" is not an event`.
- **seen** Two `on('session.start', ...)` without a matcher fail:
  `registered twice without a matcher`. Put all start-up work in one hook.
- **seen** `"module"` instead of `"modules"` in `hooks.json` fails with
  `must have hooks ... or modules`.
- **seen** A plugin named `claude-tally` fails: names that pass as
  Anthropic's own are reserved.
- The event name must be a string literal. A loop over names fails.
- Do not shadow `on` inside `register`. Do not use dynamic `import()`.
- Import only relative files inside the plugin, plus `claude-code`.
- Hold each `atom(...)` result in a `const`, not a `let`.

### Passes validation, still breaks

- **seen** `require('fs')` passes `validate` and then fails at load:
  `hooks module did not load: ReferenceError: require is not defined`. Always
  run `claude plugin test` as well. `validate` reads the code; it does not run it.
- A guard with no `.catch` **fails open**. If it throws or times out before
  `next`, Claude Code skips it and the tool runs. `validate` flags this as
  `gating hook without .catch`. Add a `.catch` that returns `{ deny }` when
  `next.called` is false.
- A hook has 10 seconds of its own time (50 ms for `prompt.edit`). Time spent
  in a mods API call does not count. Time awaiting your own promise does. A
  timed-out guard is skipped, so the held command runs.
- A blocking loop crashes the shared hooks worker. Claude Code unloads the
  mod. Three crashes it cannot trace unload every installed mod.

### State

- Module variables reset on every hot reload. Use `$.state` or `$.store`.
- `/clear`, `/resume`, and `/branch` reset `$.state` and do **not** fire
  `session.start` again. Reload saved values in a `classic.SessionStart`
  hook filtered on `{ source: ['clear', 'resume', 'fork'] }`.
- `$.store` get-then-set races between sessions. `$.fs.write` is not atomic.

### Interface

- A pane your mod opens by itself (timer, `turn.start`) appears only in a
  terminal 144 columns wide, 110 after the user has opened it once. Open it
  from a command or button, or check `isPlaced` in the result of `$.ui.open`.
- `focus`, `closeOnEscape`, and `holdToasts` accept only `true`. Passing
  `false` throws. Omit the field instead.
- `borderStyle: 'rounded'` draws nothing. The valid name is `'round'`.
- An invalid tree is replaced by Claude Code's own drawing, with a
  `ui.render (Pane) refused:` line. Check `e.surface` before using
  terminal-only or Desktop-only elements.
- `claude -p` and the Agent SDK run hooks but draw nothing. Fall back to a
  transcript line or a command's text reply.
- Redraws are throttled to 10 a second (30 for the visible pane). Do not call
  `invalidate` in a tight loop.

### Development loop

- Editing an **installed** copy does nothing. Claude Code runs a cached copy
  per version. Develop against `--plugin-dir`.
- Errors in an installed mod appear only in the debug log. Start with
  `claude --debug-file ./mod.log`, then `tail -f ./mod.log | grep my-mod`.
- A save that breaks the module keeps the last working version running, with
  `reload failed, the previous version stays loaded`.
- A mod Claude writes does not load in `claude -p`, `dontAsk` mode, an
  untrusted folder, `--safe-mode`, `--bare`, or with `disableAllHooks`.
- If the hot-reload question times out three times, it stops asking. Copy the
  mod out and use `--plugin-dir`.
- Remove any `CLAUDE_CODE_ENABLE_FUNCTION_HOOKS` left from early access. It is
  ignored now.
- In auto mode, a hook that changes a tool call's input after the classifier
  reviewed it gets the call denied. Rewrite inputs only when you must.

## Security

A mod is not sandboxed. It runs as you: it reads files and secrets, sees every
prompt and tool call, can approve a call before you are asked, and can spend
your usage. It cannot restyle the permission prompt. Before you install
someone else's mod, clone it and read the `hooks:` and `calls:` lines from
`claude plugin validate ./their-mod`. Look hard at `$.process`, `$.http`,
`$.fs.write`, and `tool.check`.

## Ideas worth building

From Ivo Kund's first look
(<https://www.ivokund.com/first-look-at-claude-code-mods-spoiler-yes-use-one-now/>)
and Anthropic's samples:

- A run-board pane that shows workflow steps and escalations while a long job runs.
- Clickable `#1234` issue references in tool output (`ui.render` on `ToolResult`).
- An account rotator (<https://github.com/ivokund/claude-account-rotator>).
- A deploy watcher with a status light in the band above the prompt.
- Prose rules from `AGENTS.md` moved into deterministic `tool.call` checks.
- A queue and lock for parallel browser E2E runs.
- Anthropic samples to read first: `token-weather`, `blast-radius`, and
  `replay-theater` in
  <https://github.com/anthropics/claude-code-playground/tree/main/claude-code/mods>,
  and the built-in `diff` and `sec-default` mods in
  <https://github.com/anthropics/claude-code/tree/main/mods>.
