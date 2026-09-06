const { readFileSync } = require("node:fs");
const { join } = require("node:path");
const vm = require("node:vm");

const html = readFileSync(join(__dirname, "..", "..", "index.html"), "utf8");
const source = html.match(/<script>([\s\S]*?)<\/script>/)[1];

// 本番コードを実行し、ブラウザの描画・音声・タイマーだけを置き換える。
function game() {
  const noop = () => {};
  const gradient = { addColorStop: noop };
  const ctx = new Proxy({ createLinearGradient: () => gradient, createRadialGradient: () => gradient },
    { get: (target, key) => target[key] ?? noop });
  const listeners = new Map();
  const listen = (type, fn) => {
    if (!listeners.has(type)) listeners.set(type, []);
    listeners.get(type).push(fn);
  };
  const canvas = () => ({ getContext: () => ctx, style: {}, addEventListener: listen,
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 480, height: 640 }) });
  const mainCanvas = canvas();
  const element = () => ({ addEventListener: noop, setAttribute: noop });
  const elements = { laserButton: element(), bombButton: element(), langJa: element(), langEn: element(), hint: element() };
  const context = vm.createContext({
    document: { getElementById: id => elements[id] || mainCanvas, createElement: canvas, addEventListener: listen,
      documentElement: {} },
    window: { addEventListener: listen, AudioContext: class { state = "running"; } },
    localStorage: { getItem: key => key.endsWith("muted") ? "1" : null, setItem: noop },
    navigator: { language: "ja" },
    performance: { now: () => 0 },
    requestAnimationFrame: noop,
  });
  vm.runInContext(source, context);
  const run = code => vm.runInContext(code, context);
  run.event = (type, event = {}) => {
    for (const fn of listeners.get(type) || []) fn({ preventDefault: noop, repeat: false, target: mainCanvas, button: 0, ...event });
  };
  run(`
    startGame(); player.inv = 0; bannerT = 0; fireT = saucerT = flightT = Infinity;
    function collectBeam() {
      powerups.push({ x: player.x, y: PLAYER_Y, type: "beam", ph: 0 }); updatePlay(0);
    }
  `);
  return run;
}

module.exports = { game };
