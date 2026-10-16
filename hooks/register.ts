import type { Register, SessionAppendInput } from 'claude-code'

export const VIDEO_URL = 'https://youtu.be/z8B4zNu7JsQ'
export const TRIGGER = '拍板'
// 同一段回覆提到好幾次時，只開一次分頁
export const COOLDOWN_MS = 30_000

const saysTrigger = (message: SessionAppendInput['message']) =>
  message.content.some(
    block => block.type === 'text' && typeof block.text === 'string' && block.text.includes(TRIGGER),
  )

export const register: Register = on => {
  let lastPlayedAt = -Infinity

  on('session.append', { door: 'response' }, async ($, e, next) => {
    const stored = await next(e)
    if (
      stored.deny !== undefined ||
      e.agentId !== undefined ||
      e.origin.kind !== 'model' ||
      !saysTrigger(stored.message)
    ) {
      return stored
    }

    const now = await $.clock.now()
    if (now - lastPlayedAt < COOLDOWN_MS) return stored
    lastPlayedAt = now

    try {
      const { exitCode, stderr } = await $.process.run(['open', VIDEO_URL], { timeoutMs: 10_000 })
      if (exitCode !== 0) $.ui.toast(`${$.plugin.name}: open 失敗 (${exitCode}) ${stderr.trim()}`)
    } catch (error) {
      $.ui.toast(`${$.plugin.name}: 無法播放 ${VIDEO_URL}: ${String(error)}`)
    }
    return stored
  })
}
