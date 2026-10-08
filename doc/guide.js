"use strict";

// 本文とページ間の移動は JavaScript なしでも利用できる。
const chapterMenu = document.querySelector(".sidebar");
if (chapterMenu) {
  const compact = matchMedia("(max-width: 720px)");
  const syncMenu = () => { chapterMenu.open = !compact.matches; };
  syncMenu();
  compact.addEventListener("change", syncMenu);
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
    g.fillStyle = "#e8d1aa";
    g.fillRect(b.x, b.y, b.w, b.h);
    g.strokeStyle = "#86622e";
    g.strokeRect(b.x, b.y, b.w, b.h);
    g.fillStyle = "#315c4570";
    g.fillRect(a.x, a.y, a.w, a.h);
    g.strokeStyle = "#315c45";
    g.strokeRect(a.x, a.y, a.w, a.h);
    g.font = "bold 16px sans-serif";
    g.fillStyle = "#26332b";
    g.fillText("A", a.x + 25, a.y + 38);
    g.fillText("B", b.x + 32, b.y + 38);
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
