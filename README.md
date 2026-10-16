# bau-mod

A cc mod plays 「鐵面無私包青天」when the models says 「拍板」

Claude Code 的 mod（外掛名稱 `paiban`）：主對話裡模型回覆的文字一出現「拍板」，就用預設瀏覽器開啟
[鐵面無私包青天](https://youtu.be/z8B4zNu7JsQ)。

- 只看模型回覆的文字；使用者輸入、thinking、subagent 輸出與工具參數都不會觸發
- 30 秒冷卻，同一段回覆講好幾次只開一個分頁
- 目前僅支援 macOS（透過 `open` 開啟網址）

## 安裝

在 Claude Code 終端機的提示列輸入：

```text
/plugin install paiban --marketplace charliie-dev/bau-mod
```

出現 `Add marketplace?` 時按 `y`，再選安裝範圍（預設 user）。

或從 shell：

```sh
claude plugin install paiban --marketplace charliie-dev/bau-mod
```

桌面版（不支援 `/plugin`）：點提示框旁的 **+** → **Plugins** → **Add marketplace** 輸入
`charliie-dev/bau-mod` → **Add plugin**。

## 開發

```sh
claude --plugin-dir .          # 以此資料夾載入 mod 啟動 session
claude plugin validate .       # 檢查 manifest 與 hooks 模組
claude plugin test .           # 執行 tests/*.test.ts
```
