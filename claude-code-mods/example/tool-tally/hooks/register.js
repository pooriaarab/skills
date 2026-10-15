// Shared by every hook below. Resets to 0 on each hot reload.
let calls = 0

const FORCE_PUSH = /\bgit\s+push\b.*(--force\b|--force-with-lease\b|\s-f\b)/

async function guard($, e, next) {
  if (FORCE_PUSH.test(e.command)) {
    return { deny: 'Force pushes are refused by tool-tally. Push to a new branch instead.' }
  }
  return next(e)
}

export function register(on) {
  // One session.start hook per module: a second one without a matcher fails the load.
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'tally', description: 'Show how many tool calls Claude made' })
    return next(e)
  })

  // Count every tool call, then let it run.
  on('tool.call', async ($, e, next) => {
    calls += 1
    $.ui.invalidate('ui.render')
    return next(e)
  })

  // Guard Bash. The .catch makes the guard fail closed instead of open.
  on('tool.call', { tool: 'Bash' }, guard).catch(async ($, e, next) => {
    if (next.called) return next(e)
    return { deny: 'The tool-tally guard failed, so this command did not run: ' + next.error.kind }
  })

  // Answer /tally with no Claude turn.
  on('command.run', { command: 'tally' }, async () => {
    return { text: 'Claude has made ' + calls + ' tool calls since this mod loaded' }
  })

  // Keep the spinner, add the count after its word.
  on('ui.render', { component: 'Spinner' }, async ($, e, next) => {
    return next({ ...e, props: { ...e.props, suffix: ' · tool calls: ' + calls + '…' } })
  })
}
