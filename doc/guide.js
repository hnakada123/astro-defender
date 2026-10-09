"use strict";

// 本文とページ間の移動は JavaScript なしでも利用できる。
// 目次は広い画面では本文の左に並べ、本文の上に積む幅では折りたたむ。
const chapterMenu = document.querySelector(".chapter-toc");
if (chapterMenu) {
  const compact = matchMedia("(max-width: 960px)");
  const syncMenu = () => { chapterMenu.open = !compact.matches; };
  syncMenu();
  compact.addEventListener("change", syncMenu);
}

// コード枠に元の行番号と色分けを付ける。表示するテキストそのものは変えない。
const KEYWORDS = new Set(("async await break case catch class const continue default delete do else extends false finally for " +
  "function if in instanceof let new null of return static super switch this throw true try typeof undefined var void while").split(" "));
const TOKEN = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|`(?:\\.|[^`\\])*`)|(\b0x[\da-f]+\b|\b\d[\d_]*(?:\.\d+)?(?:e[+-]?\d+)?\b)|([A-Za-z_$][\w$]*)/gi;

function tokenize(text) {
  const tokens = [];
  let last = 0;
  for (const m of text.matchAll(TOKEN)) {
    if (m.index > last) tokens.push(["", text.slice(last, m.index)]);
    const end = m.index + m[0].length;
    let cls = "";
    if (m[1]) cls = "tok-c";
    else if (m[2]) cls = "tok-s";
    else if (m[3]) cls = "tok-n";
    else if (KEYWORDS.has(m[4])) cls = "tok-k";
    else if (/^\s*\(/.test(text.slice(end, end + 20))) cls = "tok-f";
    tokens.push([cls, m[0]]);
    last = end;
  }
  if (last < text.length) tokens.push(["", text.slice(last)]);
  return tokens;
}

for (const pre of document.querySelectorAll(".code-block pre[aria-label]")) {
  const start = Number(/ · L(\d+)/.exec(pre.getAttribute("aria-label"))?.[1]);
  const code = pre.querySelector("code");
  if (!start || !code || code.children.length) continue;
  const lines = [];
  let line = [];
  for (const [cls, text] of tokenize(code.textContent.replace(/\n$/, ""))) {
    text.split("\n").forEach((part, i) => {
      if (i > 0) { lines.push(line); line = []; }
      if (!part) return;
      if (!cls) { line.push(part); return; }
      const span = document.createElement("span");
      span.className = cls;
      span.textContent = part;
      line.push(span);
    });
  }
  lines.push(line);
  code.replaceChildren(...lines.map(parts => {
    const row = document.createElement("span");
    row.className = "code-line";
    row.append(...parts);
    return row;
  }));
  pre.classList.add("has-lines");
  pre.style.counterReset = `line ${start - 1}`;
}

// 解説用の独立したデモ。本編の状態や保存データには触れない。
const spriteLab = document.querySelector("[data-lab='sprite']");
if (spriteLab) {
  const rowsInput = spriteLab.querySelector("textarea");
  const colorInput = spriteLab.querySelector("input");
  const canvas = spriteLab.querySelector("canvas");
  const g = canvas.getContext("2d");
  const output = spriteLab.querySelector("output");
  const render = () => {
    const rows = rowsInput.value.trim().split(/\r?\n/).map(row => row.trim());
    const width = rows[0].length;
    if (!width || width > 24 || rows.length > 16 || rows.some(row => row.length !== width || /[^X.]/.test(row))) {
      output.textContent = "X と . で、各行を同じ長さにしてください（最大 24 列 × 16 行）。";
      g.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }
    const scale = Math.min(18, Math.floor(300 / width), Math.floor(180 / rows.length));
    const left = (canvas.width - width * scale) / 2;
    const top = (canvas.height - rows.length * scale) / 2;
    g.clearRect(0, 0, canvas.width, canvas.height);
    g.fillStyle = colorInput.value;
    rows.forEach((row, y) => [...row].forEach((pixel, x) => {
      if (pixel === "X") g.fillRect(left + x * scale, top + y * scale, scale, scale);
    }));
    output.textContent = `${width} 列 × ${rows.length} 行。X の位置だけを塗っています。`;
  };
  rowsInput.addEventListener("input", render);
  colorInput.addEventListener("input", render);
  render();
}

const hitLab = document.querySelector("[data-lab='hit']");
if (hitLab) {
  const slider = hitLab.querySelector("input");
  const canvas = hitLab.querySelector("canvas");
  const g = canvas.getContext("2d");
  const output = hitLab.querySelector("output");
  const render = () => {
    const a = { x: Number(slider.value), y: 55, w: 64, h: 64 };
    const b = { x: 190, y: 75, w: 80, h: 64 };
    const hit = a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
    g.clearRect(0, 0, canvas.width, canvas.height);
    // ゲーム画面に合わせた暗い方眼に、Aを水色、Bをピンク（重なったら黄色）で描く。
    g.fillStyle = "rgba(143, 160, 216, .09)";
    for (let x = 20; x < canvas.width; x += 20) g.fillRect(x, 0, 1, canvas.height);
    for (let y = 20; y < canvas.height; y += 20) g.fillRect(0, y, canvas.width, 1);
    const bColor = hit ? "#ffe066" : "#ff6ad5";
    g.lineWidth = 2;
    g.fillStyle = "rgba(255, 106, 213, .14)";
    g.fillRect(b.x, b.y, b.w, b.h);
    g.strokeStyle = bColor;
    g.strokeRect(b.x, b.y, b.w, b.h);
    g.fillStyle = "rgba(125, 249, 255, .18)";
    g.fillRect(a.x, a.y, a.w, a.h);
    g.strokeStyle = "#7df9ff";
    g.strokeRect(a.x, a.y, a.w, a.h);
    g.font = "bold 16px Silkscreen, monospace";
    g.fillStyle = "#7df9ff";
    g.fillText("A", a.x + 25, a.y + 38);
    g.fillStyle = bColor;
    g.fillText("B", b.x + 32, b.y + 38);
    if (hit) g.fillText("HIT!", canvas.width - 60, 26);
    output.textContent = `A.x = ${a.x} ／ ${hit ? "重なっています：hit = true" : "重なっていません：hit = false"}`;
  };
  slider.addEventListener("input", render);
  render();
}

const speedLab = document.querySelector("[data-lab='speed']");
if (speedLab) {
  const slider = speedLab.querySelector("input");
  const render = () => {
    const fps = Number(slider.value);
    speedLab.querySelector("output").textContent = `${fps} fps：dt = ${(1 / fps).toFixed(4)} 秒、1 フレームで ${(120 / fps).toFixed(2)} px。1 秒間の移動量は 120 px。`;
  };
  slider.addEventListener("input", render);
  render();
}
