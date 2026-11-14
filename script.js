// TREVI 特萊薇美學診所
// 2026 年終慶幸運轉盤

// 獎項及機率（僅供內部程式使用）
const prizes = [
  { name: "外泌體面膜\n3片", weight: 28 },
  { name: "肌潤點滴\n1堂", weight: 27 },
  { name: "外泌體面膜\n5片", weight: 4 },
  { name: "速升媞外泌體\n導入1堂", weight: 27 },
  { name: "精華安瓶\n10ml", weight: 6 },
  { name: "美國755皮秒\n雷射1堂", weight: 8 }
];

const canvas = document.getElementById("wheel");
const ctx = canvas.getContext("2d");
const spinBtn = document.getElementById("spinBtn");

const countDisplay = document.getElementById("spinCount");
const historyDisplay = document.getElementById("history");

const STORAGE_KEY = "trevi_wheel_history_2026";

let history = [];

try {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
  history = Array.isArray(saved) ? saved : [];
} catch (e) {
  history = [];
}

let rotation = 0;
let spinning = false;

const colors = [
  "#fff1d6",
  "#951d43",
  "#fff1d6",
  "#951d43",
  "#fff1d6",
  "#951d43"
];

const size = canvas.width;
const center = size / 2;
const radius = center - 8;

const slice = (Math.PI * 2) / prizes.length;

// 繪製轉盤
function drawWheel() {
  ctx.clearRect(0, 0, size, size);

  prizes.forEach((prize, index) => {
    const start = -Math.PI / 2 - slice / 2 + index * slice;
    const end = start + slice;

    ctx.beginPath();
    ctx.moveTo(center, center);
    ctx.arc(center, center, radius, start, end);
    ctx.closePath();

    ctx.fillStyle = colors[index];
    ctx.fill();

    ctx.strokeStyle = "#e9c77e";
    ctx.lineWidth = 3;
    ctx.stroke();

    // 讓每個獎項文字位於自己的扇形中央
    const angle = start + slice / 2;
    const textRadius = radius * 0.68;

    const x = center + Math.cos(angle) * textRadius;
    const y = center + Math.sin(angle) * textRadius;

    ctx.save();
    ctx.translate(x, y);

    ctx.fillStyle =
      colors[index] === "#951d43"
        ? "#fff4dc"
        : "#65152f";

    ctx.font = "bold 23px Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const lines = prize.name.split("\n");
    const lineHeight = 30;

    lines.forEach((line, i) => {
      const offset = (i - (lines.length - 1) / 2) * lineHeight;
      ctx.fillText(line, 0, offset, 155);
    });

    ctx.restore();
  });
}

// 依照設定機率選出獎項
function choosePrize() {
  const total = prizes.reduce((sum, p) => sum + p.weight, 0);

  const random = Math.random() * total;

  let accumulated = 0;

  for (let i = 0; i < prizes.length; i++) {
    accumulated += prizes[i].weight;

    if (random < accumulated) {
      return i;
    }
  }

  return prizes.length - 1;
}

// 更新抽獎紀錄
function updateHistory() {
  countDisplay.textContent = history.length;

  if (history.length === 0) {
    historyDisplay.textContent = "尚無抽獎紀錄";
    return;
  }

  historyDisplay.innerHTML = "";

  history.forEach((item, index) => {
    const row = document.createElement("div");
    row.style.padding = "8px 0";
    row.style.borderBottom = "1px solid #ead8b3";

    row.textContent =
      `第 ${index + 1} 次｜${item}`;

    historyDisplay.appendChild(row);
  });
}

// 開始抽獎
function spinWheel() {
  if (spinning) return;

  spinning = true;
  spinBtn.disabled = true;
  spinBtn.textContent = "幸運轉盤旋轉中…";

  const selectedIndex = choosePrize();

  // 每個獎項的中心角度
  const targetAngle = -selectedIndex * (360 / prizes.length);

  // 轉動 6～8 圈
  const extraTurns = 6 + Math.floor(Math.random() * 3);

  const currentAngle = ((rotation % 360) + 360) % 360;

  const adjustment =
    ((targetAngle - currentAngle) % 360 + 360) % 360;

  const finalRotation =
    rotation + extraTurns * 360 + adjustment;

  const duration = 4800;

  const startRotation = rotation;
  const change = finalRotation - startRotation;
  const startTime = performance.now();

  function animate(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // 慢慢減速
    const eased = 1 - Math.pow(1 - progress, 4);

    const currentRotation =
      startRotation + change * eased;

    canvas.style.transform =
      `rotate(${currentRotation}deg)`;

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      rotation = finalRotation;

      const result = prizes[selectedIndex].name.replace(/\n/g, " ");

      history.push(result);

      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(history)
        );
      } catch (e) {
        console.warn("無法儲存抽獎紀錄", e);
      }

      updateHistory();

      spinning = false;
      spinBtn.disabled = false;
      spinBtn.textContent = "點擊開始抽獎";

      setTimeout(() => {
        alert("🎉 恭喜獲得：\n" + result);
      }, 300);
    }
  }

  requestAnimationFrame(animate);
}

// 初始化
drawWheel();
updateHistory();
// 下一位客人：清除目前抽獎紀錄
function resetWheel() {
  if (spinning) {
    alert("轉盤旋轉中，請稍候！");
    return;
  }

  const confirmed = confirm(
    "確定要結束這位客人的抽獎，開始下一位客人嗎？\n\n目前的中獎紀錄將會清除。"
  );

  if (!confirmed) return;

  history = [];

  localStorage.removeItem(STORAGE_KEY);

  rotation = 0;
  canvas.style.transform = "rotate(0deg)";

  updateHistory();

  alert("已重新開始，可以讓下一位客人抽獎囉！");
}
