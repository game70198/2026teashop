const SHEET_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyEnUNgHLGubBeI4S9Cruse5EmfHA3v-Kp7d0ce8_sxg_v76ffaGgZdZ8SHJuIceKUzXA/exec";

const MENU = [
  { category: "推薦人氣", items: [
    ["綜合嫩仙草", 55], ["葡萄柚果粒綠", 55], ["土鳳梨青茶", 55], ["台灣柳橙綠茶", 55],
    ["埔里紅甘蔗青茶", 55], ["百香綠茶", 55], ["富士蘋果熟成紅", 49], ["水蜜桃茶花綠", 55],
    ["芭樂鳳梨綠茶", 59], ["芭樂百香綠茶", 55], ["芭樂檸檬冰沙", 49], ["日月潭鮮奶茶", 59],
    ["鐵觀音鮮奶茶", 60], ["珍珠鮮奶茶", 59], ["焙炒蕎麥鮮奶茶", 70], ["芋頭純鮮奶", 80],
    ["蜂蜜翡翠檸檬", 60], ["蜂蜜檸檬汁", 60], ["蜂蜜檸檬粉粿", 55], ["日月潭奶茶", 50],
    ["鐵觀音奶茶", 50], ["黃金蕎麥奶茶", 55], ["水蜜桃氣泡飲", 59], ["巨峰葡萄氣泡飲", 59]
  ] },
  { category: "台灣好茶", items: [
    ["台灣自選綠茶", 30], ["台灣香韻青茶", 30], ["日月潭紅茶", 30], ["碳焙鐵觀音－台灣", 30],
    ["鐵觀音綠／青－台灣", 30], ["油切茶花綠茶", 30], ["黃金焙炒蕎麥", 40], ["焙炒蕎麥冬瓜", 45],
    ["仙草甘茶", 30], ["手熬冬瓜茶／冬瓜青", 35], ["手熬冬瓜檸檬", 45], ["蜜桃養樂多綠茶", 59],
    ["養樂多多綠茶", 49]
  ] },
  { category: "嚼感茶", items: [
    ["珍珠奶茶／鐵奶", 49], ["百香Q果綠", 55], ["巨峰葡萄吸凍飲", 59], ["桂花檸檬粉粿", 55],
    ["蜜桃檸檬冰沙", 55], ["粉珍珠奶茶", 55], ["粉珍珠蕎麥奶茶", 70], ["仙草Q奶", 49],
    ["嫩仙草奶茶", 60], ["魔法紫芋波波", 49], ["黑糖粉粿奶茶", 55]
  ] },
  { category: "冬季限定", items: [
    ["黑糖薑母茶", 50], ["薑汁奶茶", 55], ["薑汁鮮奶茶", 65], ["玫瑰美妍冰茶", 65], ["玫瑰舒暢奶茶", 70]
  ] },
  { category: "荔枝系列", items: [
    ["荔枝粉角紅茶", 45], ["荔枝輕檸椰果", 45], ["荔枝纖檸冰茶", 45], ["粉角檸檬綠", 45],
    ["桂花鐵觀音", 45], ["嫩仙草奶茶（初鹿鮮乳升級）", 60]
  ] },
  { category: "茶包禮盒", items: [
    ["玫瑰美妍茶包", 360], ["黃金焙炒蕎麥茶包", 250], ["超值完妝組合", 648], ["超值舒研組合", 549]
  ] }
];

const quantities = new Map();
const productByName = new Map(MENU.flatMap(group => group.items.map(([name, price]) => [name, { name, price, category: group.category }])));
let activeCategory = "全部";

function money(amount) {
  return `$${Number(amount || 0).toLocaleString("zh-TW")}`;
}

function selectedItems() {
  return [...quantities.entries()].filter(([, quantity]) => quantity > 0).map(([name, quantity]) => {
    const product = productByName.get(name);
    return { name, quantity, price: product.price, subtotal: product.price * quantity };
  });
}

function totalPrice() {
  return selectedItems().reduce((sum, item) => sum + item.subtotal, 0);
}

function renderProducts() {
  const categoryBar = document.querySelector("#category-bar");
  const productList = document.querySelector("#product-list");
  if (!categoryBar || !productList) return;

  const categories = ["全部", ...MENU.map(group => group.category)];
  categoryBar.innerHTML = categories.map(category =>
    `<button type="button" class="category-chip${category === activeCategory ? " active" : ""}" data-category="${category}">${category}</button>`
  ).join("");

  const groups = activeCategory === "全部" ? MENU : MENU.filter(group => group.category === activeCategory);
  productList.innerHTML = groups.flatMap(group => group.items.map(([name, price]) => {
    const quantity = quantities.get(name) || 0;
    return `<article class="product-card">
      <div class="product-meta"><span class="product-name">${name}</span><span class="product-price">${money(price)}／杯</span></div>
      <div class="quantity-control" aria-label="${name}數量">
        <button class="qty-button" type="button" data-action="decrease" data-name="${name}" aria-label="減少${name}">−</button>
        <span class="qty-value" aria-live="polite">${quantity}</span>
        <button class="qty-button" type="button" data-action="increase" data-name="${name}" aria-label="增加${name}">＋</button>
      </div>
    </article>`;
  })).join("");
  renderSummary();
}

function renderSummary() {
  const items = selectedItems();
  const total = totalPrice();
  const summary = document.querySelector("#summary-list");
  const empty = document.querySelector("#summary-empty");
  if (summary) {
    summary.innerHTML = items.map(item => `<li class="summary-item"><span>${item.name} × ${item.quantity}</span><span>${money(item.subtotal)}</span></li>`).join("");
    empty.hidden = items.length > 0;
    document.querySelector("#total-price").textContent = money(total);
  }
  const mobile = document.querySelector("#mobile-total");
  if (mobile) mobile.innerHTML = `<span>目前合計</span><strong>${money(total)}</strong>`;
}

function showFormMessage(text, isError) {
  const message = document.querySelector("#form-message");
  message.textContent = text;
  message.classList.toggle("error", Boolean(isError));
}

async function submitOrder(event) {
  event.preventDefault();
  const form = event.currentTarget;
  if (form.dataset.submitting === "true") return;
  const name = form.elements.name.value.trim();
  const items = selectedItems();
  if (!name) {
    showFormMessage("請先填寫姓名。", true);
    form.elements.name.focus();
    return;
  }
  if (!items.length) {
    showFormMessage("請至少選擇一項飲品再送出。", true);
    return;
  }

  form.dataset.submitting = "true";
  form.setAttribute("aria-busy", "true");
  form.querySelectorAll("button, input").forEach(control => { control.disabled = true; });
  try {
    const order = { id: crypto.randomUUID(), name, items, total: items.reduce((sum, item) => sum + item.subtotal, 0), createdAt: new Date().toISOString() };
    const saved = JSON.parse(localStorage.getItem("tea-orders") || "[]");
    saved.unshift(order);
    localStorage.setItem("tea-orders", JSON.stringify(saved));

    if (SHEET_SCRIPT_URL) {
      const body = new URLSearchParams({ order: JSON.stringify(order) });
      try {
        await fetch(SHEET_SCRIPT_URL, { method: "POST", mode: "no-cors", body });
      } catch (error) {
        showFormMessage("訂單已留在本機，但傳送到 Google Sheet 失敗，請檢查 Apps Script 部署網址後重試。", true);
        return;
      }
      showFormMessage("已送出雲端同步請求，請至「查看訂單」確認是否成功同步。");
    } else {
      showFormMessage("訂單已保存在這台裝置。設定 Google Sheet 後即可同步全班訂單。");
    }
    quantities.clear();
    form.reset();
    renderProducts();
  } finally {
    form.dataset.submitting = "false";
    form.removeAttribute("aria-busy");
    form.querySelectorAll("button, input").forEach(control => { control.disabled = false; });
  }
}

function initOrderPage() {
  renderProducts();
  document.querySelector("#category-bar").addEventListener("click", event => {
    const button = event.target.closest("[data-category]");
    if (!button) return;
    activeCategory = button.dataset.category;
    renderProducts();
  });
  document.querySelector("#product-list").addEventListener("click", event => {
    const button = event.target.closest("[data-action]");
    if (!button) return;
    const current = quantities.get(button.dataset.name) || 0;
    quantities.set(button.dataset.name, Math.max(0, current + (button.dataset.action === "increase" ? 1 : -1)));
    renderProducts();
  });
  document.querySelector("#order-form").addEventListener("submit", submitOrder);
}

function fetchRemoteOrders() {
  return new Promise((resolve, reject) => {
    if (!SHEET_SCRIPT_URL) {
      reject(new Error("Google Sheet 尚未設定，以下僅顯示本機訂單。"));
      return;
    }
    const callback = `receiveOrders_${Date.now()}`;
    const script = document.createElement("script");
    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error("連線逾時，請確認 Apps Script 部署網址與存取權限。"));
    }, 10000);
    function cleanup() {
      clearTimeout(timeout);
      delete window[callback];
      script.remove();
    }
    window[callback] = data => {
      cleanup();
      if (data && data.error) reject(new Error(data.error));
      else resolve(data.orders || []);
    };
    script.onerror = () => {
      cleanup();
      reject(new Error("無法讀取 Google Sheet，請檢查 Apps Script 部署狀態。"));
    };
    script.src = `${SHEET_SCRIPT_URL}${SHEET_SCRIPT_URL.includes("?") ? "&" : "?"}callback=${callback}`;
    document.head.append(script);
  });
}

function renderOrders(orders, message, isError) {
  const list = document.querySelector("#orders-list");
  const itemCount = orders.reduce((sum, order) => sum + order.items.reduce((subtotal, item) => subtotal + Number(item.quantity || 0), 0), 0);
  document.querySelector("#order-count").textContent = String(orders.length);
  document.querySelector("#drink-count").textContent = String(itemCount);
  document.querySelector("#orders-total").textContent = money(orders.reduce((sum, order) => sum + Number(order.total || 0), 0));
  document.querySelector("#orders-message").textContent = message;
  document.querySelector("#orders-message").classList.toggle("error", Boolean(isError));
  list.innerHTML = orders.length ? orders.map(order => {
    const date = order.createdAt ? new Date(order.createdAt).toLocaleString("zh-TW", { dateStyle: "short", timeStyle: "short" }) : "";
    const items = order.items.map(item => `<span>${item.name} × ${item.quantity}</span>`).join("");
    return `<article class="order-card"><div class="order-card-head"><div class="order-customer">${order.name}<span class="order-date">${date}</span></div><strong class="order-amount">${money(order.total)}</strong></div><div class="order-card-items">${items}</div></article>`;
  }).join("") : `<div class="orders-empty">目前還沒有訂單，成為第一位點餐的人吧！</div>`;
}

async function loadOrders() {
  const local = JSON.parse(localStorage.getItem("tea-orders") || "[]");
  try {
    const remote = await fetchRemoteOrders();
    const merged = new Map(remote.map(order => [order.id, order]));
    local.forEach(order => { if (!merged.has(order.id)) merged.set(order.id, order); });
    const orders = [...merged.values()].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    renderOrders(orders, `已同步 Google Sheet・${new Date().toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit" })} 更新`);
  } catch (error) {
    renderOrders(local, `${error.message} 本機訂單 ${local.length} 筆。`, true);
  }
}

if (document.body.dataset.page === "order") initOrderPage();
if (document.body.dataset.page === "orders") {
  document.querySelector("#refresh-orders").addEventListener("click", loadOrders);
  loadOrders();
}
