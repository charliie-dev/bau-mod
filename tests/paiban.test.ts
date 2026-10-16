import type { On } from 'claude-code'
import { expect, mock, test } from 'claude-code/testing'
import { COOLDOWN_MS, VIDEO_URL } from '../hooks/register'

const reply = (...content: { type: string; [field: string]: unknown }[]) => ({
  message: { type: 'assistant' as const, role: 'assistant' as const, content },
  door: 'response' as const,
  origin: { kind: 'model' as const, model: 'claude-opus-5-5' },
  uuid: crypto.randomUUID(),
})

const recordOpens = (on: On) => {
  const opened: (readonly string[])[] = []
  on('process.run', (_$, e) => {
    opened.push(e.argv)
    return {
      value: { exitCode: 0, stdout: '', stderr: '', isStdoutTruncated: false, isStderrTruncated: false },
    }
  })
  return opened
}

test('回覆含「拍板」就開啟影片', async ($, on) => {
  mock.clock(on, { now: 1_000_000 })
  const opened = recordOpens(on)

  await $.session.append(reply({ type: 'text', text: '好，這件事就這麼拍板了。' }))

  expect(opened).toEqual([['open', VIDEO_URL]])
})

test('沒有「拍板」或只出現在 thinking 時不播放', async ($, on) => {
  mock.clock(on, { now: 1_000_000 })
  const opened = recordOpens(on)

  await $.session.append(reply({ type: 'text', text: '還在討論，尚未決定。' }))
  await $.session.append(
    reply({ type: 'thinking', thinking: '要不要拍板？', signature: 'sig' }, { type: 'text', text: '再想想。' }),
  )

  expect(opened).toEqual([])
})

test('冷卻時間內只播一次，過了再播', async ($, on) => {
  const clock = mock.clock(on, { now: 1_000_000 })
  const opened = recordOpens(on)

  await $.session.append(reply({ type: 'text', text: '拍板！' }))
  await $.session.append(reply({ type: 'text', text: '再拍板一次' }))
  expect(opened.length).toBe(1)

  await clock.advance(COOLDOWN_MS)
  await $.session.append(reply({ type: 'text', text: '正式拍板' }))
  expect(opened.length).toBe(2)
})
