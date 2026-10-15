import { expect, test } from 'claude-code/testing'

test('/tally counts the tool calls the mod saw', async ($, on) => {
  on('tool.call', () => ({ result: 'ok' }))

  await $.tool.call({ tool: 'Bash', command: 'ls' })
  await $.tool.call({ tool: 'Read', file_path: 'README.md' })

  const answer = await $.command.run({ command: 'tally', args: '' })
  expect(answer.text).toBe('Claude has made 2 tool calls since this mod loaded')
})

test('a force push is refused and never reaches the tool', async ($, on) => {
  let ran = false
  on('tool.call', () => {
    ran = true
    return { result: 'pushed' }
  })

  const out = await $.tool.call({ tool: 'Bash', command: 'git push -f origin main' })
  expect(out.deny).toMatch(/Force pushes are refused/)
  expect(ran).toBe(false)
})

test('a normal push goes through', async ($, on) => {
  on('tool.call', () => ({ result: 'pushed' }))
  const out = await $.tool.call({ tool: 'Bash', command: 'git push origin feature' })
  expect(out).toEqual({ result: 'pushed' })
})
