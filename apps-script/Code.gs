const SHEET_NAME = "2026手搖飲點餐記錄";
const HEADERS = ["訂單編號", "送出時間", "姓名", "飲品明細", "訂單金額"];
const MENU_PRICES = {
  "綜合嫩仙草": 55, "葡萄柚果粒綠": 55, "土鳳梨青茶": 55, "台灣柳橙綠茶": 55,
  "埔里紅甘蔗青茶": 55, "百香綠茶": 55, "富士蘋果熟成紅": 49, "水蜜桃茶花綠": 55,
  "芭樂鳳梨綠茶": 59, "芭樂百香綠茶": 55, "芭樂檸檬冰沙": 49, "日月潭鮮奶茶": 59,
  "鐵觀音鮮奶茶": 60, "珍珠鮮奶茶": 59, "焙炒蕎麥鮮奶茶": 70, "芋頭純鮮奶": 80,
  "蜂蜜翡翠檸檬": 60, "蜂蜜檸檬汁": 60, "蜂蜜檸檬粉粿": 55, "日月潭奶茶": 50,
  "鐵觀音奶茶": 50, "黃金蕎麥奶茶": 55, "水蜜桃氣泡飲": 59, "巨峰葡萄氣泡飲": 59,
  "台灣自選綠茶": 30, "台灣香韻青茶": 30, "日月潭紅茶": 30, "碳焙鐵觀音－台灣": 30,
  "鐵觀音綠／青－台灣": 30, "油切茶花綠茶": 30, "黃金焙炒蕎麥": 40, "焙炒蕎麥冬瓜": 45,
  "仙草甘茶": 30, "手熬冬瓜茶／冬瓜青": 35, "手熬冬瓜檸檬": 45, "蜜桃養樂多綠茶": 59,
  "養樂多多綠茶": 49, "珍珠奶茶／鐵奶": 49, "百香Q果綠": 55, "巨峰葡萄吸凍飲": 59,
  "桂花檸檬粉粿": 55, "蜜桃檸檬冰沙": 55, "粉珍珠奶茶": 55, "粉珍珠蕎麥奶茶": 70,
  "仙草Q奶": 49, "嫩仙草奶茶": 60, "魔法紫芋波波": 49, "黑糖粉粿奶茶": 55,
  "黑糖薑母茶": 50, "薑汁奶茶": 55, "薑汁鮮奶茶": 65, "玫瑰美妍冰茶": 65,
  "玫瑰舒暢奶茶": 70, "荔枝粉角紅茶": 45, "荔枝輕檸椰果": 45, "荔枝纖檸冰茶": 45,
  "粉角檸檬綠": 45, "桂花鐵觀音": 45, "嫩仙草奶茶（初鹿鮮乳升級）": 60,
  "玫瑰美妍茶包": 360, "黃金焙炒蕎麥茶包": 250, "超值完妝組合": 648, "超值舒研組合": 549
};

function setup() {
  const properties = PropertiesService.getScriptProperties();
  let spreadsheetId = properties.getProperty("SPREADSHEET_ID");
  let spreadsheet;
  if (spreadsheetId) {
    spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  } else {
    spreadsheet = SpreadsheetApp.create(SHEET_NAME);
    properties.setProperty("SPREADSHEET_ID", spreadsheet.getId());
  }
  spreadsheet.rename(SHEET_NAME);
  const sheet = spreadsheet.getSheets()[0];
  sheet.setName("訂單");
  sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  sheet.setFrozenRows(1);
  sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold").setBackground("#f5d45f");
  return spreadsheet.getUrl();
}

function doPost(event) {
  try {
    const order = JSON.parse(event.parameter.order || "{}");
    validateOrder_(order);
    const spreadsheetId = PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID");
    if (!spreadsheetId) throw new Error("尚未建立試算表，請先執行 setup()。");
    const sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName("訂單");
    const details = order.items.map(item => `${item.name} × ${item.quantity}（$${item.price}）`).join("、");
    sheet.appendRow([order.id, new Date(), safeText_(order.name), details, Number(order.total)]);
    return jsonOutput_({ ok: true, id: order.id });
  } catch (error) {
    console.error(error);
    return jsonOutput_({ error: error.message });
  }
}

function doGet(event) {
  try {
    const spreadsheetId = PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID");
    if (!spreadsheetId) throw new Error("尚未建立試算表，請先執行 setup()。");
    const sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName("訂單");
    const rows = sheet.getDataRange().getValues();
    const orders = rows.slice(1).filter(row => row[0]).map(row => ({
      id: String(row[0]),
      createdAt: new Date(row[1]).toISOString(),
      name: String(row[2]),
      items: parseDetails_(String(row[3])),
      total: Number(row[4])
    }));
    return jsonOutput_({ orders }, event.parameter.callback);
  } catch (error) {
    console.error(error);
    return jsonOutput_({ error: error.message }, event.parameter.callback);
  }
}

function validateOrder_(order) {
  if (!order || typeof order.id !== "string" || !order.id || order.id.length > 100 ||
      typeof order.name !== "string" || !order.name.trim() || order.name.length > 60) {
    throw new Error("訂單編號及姓名為必填欄位。");
  }
  if (!Array.isArray(order.items) || !order.items.length) throw new Error("至少需要一項飲品。");
  const calculated = order.items.reduce((sum, item) => {
    if (typeof item.name !== "string" || !Object.prototype.hasOwnProperty.call(MENU_PRICES, item.name) ||
        !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 99 ||
        Number(item.price) !== MENU_PRICES[item.name]) {
      throw new Error("飲品或數量格式不正確。");
    }
    return sum + item.quantity * MENU_PRICES[item.name];
  }, 0);
  if (!Number.isSafeInteger(Number(order.total)) || calculated !== Number(order.total)) throw new Error("訂單價格與品項金額不符。");
}

function parseDetails_(details) {
  return details.split("、").map(detail => {
    const match = detail.match(/^(.*?) × (\d+)（\$(\d+)）$/);
    if (!match) return { name: detail, quantity: 1, price: 0 };
    return { name: match[1], quantity: Number(match[2]), price: Number(match[3]) };
  });
}

function safeText_(value) {
  return value.replace(/^[=+\-@]/, "'$&");
}

function jsonOutput_(data, callback) {
  const json = JSON.stringify(data);
  if (callback && /^[A-Za-z_$][\w$]*$/.test(callback)) {
    return ContentService.createTextOutput(`${callback}(${json})`).setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);
}
