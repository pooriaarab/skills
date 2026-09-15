# Driving a form without believing your own output

Picking the right browser is the first half. This is the second: getting a form
submitted and knowing whether it worked.

Everything here comes from one session that added seventeen domains to Google
Postmaster Tools. It should have taken ten minutes. Every delay had the same
shape — the automation reported success and nothing had happened.

## The sequence that works

```sh
zsh -ic 'browser-personal open "<url>"'
zsh -ic 'browser-personal snapshot'            # binds refs — not optional
zsh -ic 'browser-personal fill "@e10" "value"'
zsh -ic 'browser-personal snapshot'            # confirm the submit is enabled
zsh -ic 'browser-personal click "@e6"'
```

Then check the application's own list. Not the exit code, not the `✓ Done`.

## Refs bind only after a snapshot

`fill "@e10"` on a ref that no snapshot has bound prints `✓ Done` and does
nothing. A React-controlled input keeps its old value, its `onChange` never
fires, and the form's state never updates.

The submit button then stays `disabled` — and **clicking a disabled button also
prints `✓ Done`**. A three-step sequence produces three success messages and
zero effect.

Selecting by accessible name (`textbox "Domain"`) has the same problem in a
React app: it finds the element and sets the DOM value without the events the
framework listens for. Refs after a snapshot are what worked.

Refs are invalidated by navigation. Re-snapshot after every page load.

## Assert the submit button is enabled

The cheapest possible guard, and it catches the whole class:

```sh
state=$(browser-personal snapshot | grep 'button "Create"')
case "$state" in *disabled*) echo "SKIP: form did not take the value"; continue ;; esac
```

Without it, a loop clicks a disabled button once per item and reports a clean run.

## Never let a loop narrate its own success

```sh
# Wrong. Prints "submitted" whatever happens, including against a 404.
browser-personal click 'button "Create"' >/dev/null 2>&1
echo "  submitted $d"
```

That exact loop ran fifteen times against a URL that did not exist. Fifteen
lines of "submitted", nothing added, no error anywhere.

Capture a before and after from the application and diff them:

```sh
before=$(list_from_the_app)
...do the work...
after=$(list_from_the_app)
comm -13 <(echo "$before") <(echo "$after")   # what actually changed
```

An empty diff means nothing happened, whatever the loop said.

## Tables paginate, and page one looks like the whole table

A domain table rendered ten rows. Scrolling added none. The list read as
complete twice before the pagination control turned up at the bottom —
`Rows per page` and `Go to next page`.

Two ways through, and the second is usually less work:

- Set rows-per-page high, then **re-count after the change lands**. Reading the
  row count in the same breath as setting the page size gets the old value.
- **Reverse the sort.** Clicking the column header puts the tail of the list on
  page one, so two passes over page one cover everything without touching the
  pagination at all.

## The rule underneath all of it

Automation output describes what the tool attempted. The application's own state
is the only evidence of what happened. Where the two disagree the tool is wrong,
and it will disagree silently, because none of these failures raise.
