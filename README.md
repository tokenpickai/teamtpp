# teamtpp

民眾黨民代做了什麼，用實際成果說話。網站：https://teamtpp.com

## 結構

- `data/people/<slug>.json`：每位民代一個資料檔（事蹟、推薦句、議會提案、還在追的）
- `public/`：圖片、`site.css`、`app.js`
- `build.mjs`：無相依套件，`node build.mjs` 產生 `dist/`

## 部署

Cloudflare Pages 連到這個 repo：
- Build command：`node build.mjs`
- Build output directory：`dist`

推到 `main` 就自動上線。

## 更新

每天更新一次：新成果直接加進該民代的 JSON，進度更新併入原本那一筆（改 `when`、`status`、`after`），頁首日期改 `person.updated`。
