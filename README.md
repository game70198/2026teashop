# 十二韻班級飲料團購

依據十二韻飲料菜單製作的班級點餐網站，包含點餐頁及訂單檢視頁。

## 網站功能

- 點餐首頁：[index.html](./index.html)：完整顯示菜單圖片、按分類挑選飲品、輸入姓名並即時計算總價。
- 訂單頁：[orders.html](./orders.html)：檢視訂單、飲品總數及金額統計。
- Google Apps Script 程式位於 [apps-script/Code.gs](./apps-script/Code.gs)，首次執行 `setup()` 會建立 `2026手搖飲點餐記錄` 試算表和標題列。

## Google Sheet 同步

點餐網站已連接至 [2026手搖飲點餐記錄 Google 試算表](https://docs.google.com/spreadsheets/d/1CGuLBdN43Sfm6WdpMGdfVhBksiKvce8jA7KSW0l_Huw/edit) 及 [Google Apps Script 網頁應用程式](https://script.google.com/macros/s/AKfycbyEnUNgHLGubBeI4S9Cruse5EmfHA3v-Kp7d0ce8_sxg_v76ffaGgZdZ8SHJuIceKUzXA/exec)。Apps Script 專案執行 `setup()` 後會建立標題列；網站送出的姓名、飲品、數量和總額會寫入試算表，訂單頁則讀取雲端訂單。

如需重新部署，登入 [Google Apps Script](https://script.google.com/)，使用 `apps-script/Code.gs`，以自己的帳戶執行並授權 `setup()`，然後將網頁應用程式設為「執行身分：我」及「誰可以存取：所有人」。若重新建立部署，請同步更新 [app.js](./app.js) 中的 `SHEET_SCRIPT_URL`。

## 本機預覽

使用任一靜態網站伺服器以專案根目錄為網站根目錄啟動，然後開啟 `index.html`。菜單圖片需與頁面檔案放在同一目錄。

## GitHub Pages

網站網址：[https://game70198.github.io/2026teashop/](https://game70198.github.io/2026teashop/)
