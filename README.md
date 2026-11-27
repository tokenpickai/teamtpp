# teamtpp

民眾黨民代做了什麼，用實際成果說話。網站：https://teamtpp.com

## 結構

- `data/people/<slug>.json`：每位民代一個資料檔（事蹟、推薦句、議會提案、還在追的）
- `data/piyao/<slug>.json`：闢謠，一則一檔
- `data/site.json`：首頁「最近更新」日期
- `public/`：圖片、`site.css`、`app.js`
- `build.mjs`：無相依套件，`node build.mjs` 產生 `dist/`

## 部署

Cloudflare Workers 連到這個 repo（`wrangler.jsonc` 指定靜態檔在 `dist/`）：
- Build command：`node build.mjs`
- Deploy command：`npx wrangler deploy`

推到 `main` 就自動上線。

## 更新

每天更新一次：新成果直接加進該民代的 JSON，進度更新併入原本那一筆（改 `when`、`status`、`after`），頁首日期改 `person.updated`。

闢謠（`/lies/`）：每則一個 `data/piyao/<slug>.json`，原貼文截圖放 `public/img/piyao/<slug>/rumor.jpg`。

首頁「最近更新」讀 `data/site.json` 的 `updated`，每天更新跑完就改成當天日期（台灣時間，格式 `2026.11.27`）。

發文文案：`node build.mjs` 同時產生 `social/posts.md`（/lies/ 每則一篇＋當天新增的議員事蹟，標「今天新增」），`social/seen.json` 記錄每則第一次出現的日期，避免重複。每日更新跑完 build 後，把 `social/` 一起 commit。

自動發文：token 放 `.env`（不 commit）。`node social/publish.mjs` 只印出今天要發的（dry run），加 `--send` 才真的發到 FB 粉專和 Threads；`--setup` 第一次把 FB token 換成永久專頁 token。發過的記在 `social/published.json`。

### 每晚 9:47 更新的最後一步：自動發文（2026-11-27 起啟用）

1. 資料更新完、`data/site.json` 改成當天日期後，跑 `node build.mjs`
2. commit（含 `social/`）並 push 到 `main`，等 teamtpp.com 部署完成（新頁面上線，FB 預覽卡才抓得到圖）
3. 跑 `node social/publish.mjs --send`：只發 `social/today.json` 裡「今天新增」的貼文到 FB 粉專「民眾隊」和 Threads @teamtppcom，發過的不會重發
4. 把更新後的 `social/published.json` commit 並 push
5. 回報：發了哪幾則、各自連結；有 `[fail …]` 就回報錯誤訊息（多半是 token 過期，請 J 重拿 token 放 `.env`）
