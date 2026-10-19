# 十二韻班級飲料團購

依據十二韻飲料菜單製作的班級點餐網站，包含點餐頁及訂單檢視頁。

## 網站功能

- 點餐首頁：[index.html](./index.html)：完整顯示菜單圖片、按分類挑選飲品、輸入姓名並即時計算總價。
- 訂單頁：[orders.html](./orders.html)：檢視訂單、飲品總數及金額統計。
- Google Apps Script 程式位於 [apps-script/Code.gs](./apps-script/Code.gs)，首次執行 `setup()` 會建立 `2026手搖飲點餐記錄` 試算表和標題列。

## 啟用 Google Sheet 同步

1. 登入 [Google Apps Script](https://script.google.com/)，新增專案並貼上 `apps-script/Code.gs` 內容。
2. 在 Apps Script 編輯器選擇 `setup` 並執行一次，授權建立試算表。執行記錄會顯示試算表網址。
3. 選擇「部署」→「新增部署作業」→「網頁應用程式」，執行身分選「我」，存取權選「所有人」，部署並複製 `/exec` 網址。
4. 將該網址填入 [app.js](./app.js) 最前面的 `SHEET_SCRIPT_URL`，例如 `const SHEET_SCRIPT_URL = "https://script.google.com/macros/s/.../exec";`，再將更新推送至 GitHub。

未設定 Apps Script 時，點餐仍可在目前裝置預覽及儲存；跨裝置雲端同步須完成上述設定。

## 本機預覽

使用任一靜態網站伺服器以專案根目錄為網站根目錄啟動，然後開啟 `index.html`。菜單圖片需與頁面檔案放在同一目錄。

## GitHub Pages

網站網址：[https://game70198.github.io/2026teashop/](https://game70198.github.io/2026teashop/)
