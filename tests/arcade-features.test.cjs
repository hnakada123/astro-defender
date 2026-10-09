const assert = require("node:assert/strict");
const { test } = require("node:test");
const { game } = require("./helpers/game.cjs");

test("kills fill a capped laser gauge; laser kills pierce a column without recharging or eroding cover", () => {
  const run = game();
  run("for (const a of aliens.slice(0, 17)) killAlien(a, alienRect(a))");
  assert.equal(run("special.charge"), 100);
  run(`
    freezeT = 0; form.ox = 200; player.x = mouseX = 218;
    aliens = [{r: 0, c: 0, type: 'c', alive: true}, {r: 1, c: 0, type: 'c', alive: true}, {r: 0, c: 4, type: 'c', alive: true}];
    aliveN = 3;
    eBullets = [{x: 218, y: 350, w: 3, h: 9, vy: 0}, {x: 20, y: 350, w: 3, h: 9, vy: 0}];
    const cover = JSON.stringify(barriers);
  `);
  assert.equal(run("activateLaser()"), true);
  run("updatePlay(0.01)");
  assert.equal(run("aliveN"), 1);
  assert.equal(run("eBullets.length"), 1);
  assert.equal(run("special.charge"), 0);
  assert.equal(run("JSON.stringify(barriers) === cover"), true);
  run("for (let i = 0; i < 130; i++) updatePlay(0.01)");
  assert.equal(run("special.laserT"), 0);
});

test("linked cannons strengthen the laser without being consumed", () => {
  const run = game();
  run("special.charge = 100; activateLaser(); const baseWidth = special.laserW, basePower = special.laserDps; special.laserT = 0");
  run("collectBeam(4); special.charge = 100; activateLaser()");
  assert.ok(run("special.laserW > baseWidth && special.laserDps > basePower"));
  assert.equal(run("active.beam"), 4);
  assert.equal(run("activateLaser()"), false);
});

test("specials reject empty gauges, empty stocks, non-play states, and pause", () => {
  const run = game();
  assert.equal(run("activateLaser()"), false);
  run("special.charge = 100; special.bombs = 0");
  assert.equal(run("activateBomb()"), false);
  for (const state of ["title", "clear", "dying", "gameover"]) {
    run(`setState('${state}'); special.bombs = 2`);
    assert.equal(run("activateLaser() || activateBomb()"), false);
    assert.equal(run("special.charge"), 100);
    assert.equal(run("special.bombs"), 2);
  }
  run("setState('play'); setPaused(true)");
  assert.equal(run("activateLaser() || activateBomb()"), false);
});

test("a bomb clears bullets, destroys nearby enemies, preserves distant enemies and cover, and grants invulnerability", () => {
  const run = game();
  run(`
    aliens[0].flight = { x: player.x, y: PLAYER_Y - 80 };
    const cover = JSON.stringify(barriers);
    eBullets = [{ x: player.x, y: PLAYER_Y, w: 3, h: 9, vy: 0 }];
  `);
  assert.equal(run("activateBomb()"), true);
  assert.equal(run("special.bombs"), 1);
  assert.equal(run("eBullets.length"), 0);
  assert.equal(run("aliens[0].alive"), false);
  assert.equal(run("aliens[1].alive"), true);
  assert.equal(run("JSON.stringify(barriers) === cover"), true);
  assert.ok(run("player.inv > 1"));
  assert.equal(run("activateBomb()"), false);
});

test("every fifth wave is a boss encounter; turrets protect the core and must be destroyed first", () => {
  const run = game();
  run(`
    wave = 5; makeWave(); bannerT = 0; updatePlay(0);
    function shootPart(index) {
      const r = bossPartRect(boss.parts[index]);
      pBullets = [{x: r.x + 10, y: r.y + 12, w: 2, h: 10}]; updatePlay(0);
    }
    const coreHp = boss.parts[2].hp;
  `);
  assert.equal(run("aliens.length"), 0);
  assert.equal(run("state"), "play");
  run("shootPart(2)");
  assert.equal(run("boss.parts[2].hp === coreHp"), true);
  run("for (let i = 0; i < 18; i++) shootPart(0)");
  assert.equal(run("coreExposed()"), false);
  run("for (let i = 0; i < 18; i++) shootPart(1)");
  assert.equal(run("coreExposed()"), true);
  run("for (let i = 0; i < coreHp; i++) shootPart(2)");
  assert.equal(run("boss"), null);
  assert.equal(run("state"), "clear");
  assert.equal(run("special.bombs"), 3);
  assert.ok(run("score >= 1900"));
});

test("boss attacks lock a visible warning position before firing, and bombs cancel the attack", () => {
  const run = game();
  run("wave = 5; makeWave(); bannerT = 0; player.inv = 0; boss.attackT = 0; updateBoss(0.01)");
  assert.ok(run("boss.warning > 1"));
  assert.equal(run("boss.laserT"), 0);
  run("const target = boss.targetX; player.x = 30; updateBoss(0.5)");
  assert.equal(run("boss.targetX === target"), true);
  assert.equal(run("boss.laserT"), 0);
  run("updateBoss(0.61); updateBoss(0.01)");
  assert.ok(run("boss.laserT > 0"));
  assert.equal(run("lives"), 3);
  run("activateBomb()");
  assert.equal(run("boss.laserT + boss.warning"), 0);
  assert.equal(run("boss.parts[0].hp"), 4);
  assert.equal(run("boss.parts[2].hp"), 28);
  assert.ok(run("boss.attackT >= 2"));
});

test("the boss pauses in place while attacking and resumes smoothly without jumping", () => {
  const run = game();
  run(`
    wave = 5; makeWave(); bannerT = 0; player.inv = 1e9;
    let prev = boss.x, maxStep = 0, stoppedMoves = 0;
    for (let i = 0; i < 60 * 30; i++) {
      const attacking = boss.warning > 0 || boss.laserT > 0;
      updateBoss(1 / 60);
      const step = Math.abs(boss.x - prev);
      if (attacking && boss.warning + boss.laserT > 0 && step > 0) stoppedMoves++;
      maxStep = Math.max(maxStep, step); prev = boss.x;
    }
  `);
  assert.equal(run("stoppedMoves"), 0);
  assert.ok(run("maxStep < 2"), `boss moved ${run("maxStep")}px in one frame`);
});

test("boss fights allow five main shots on screen instead of three", () => {
  const run = game();
  run(`
    // 発射間隔を毎フレーム 0 に戻し、画面内の弾数上限だけで発射が止まるようにする。
    function volley() {
      pBullets = []; keys.fire = true;
      for (let i = 0; i < 30; i++) { player.cool = 0; updatePlay(0.01); }
      return pBullets.length;
    }
  `);
  assert.equal(run("volley()"), 3);
  run("wave = 5; makeWave(); bannerT = 0");
  assert.equal(run("volley()"), 5);
});

test("boss laser damages a player in the warned lane and respects shield invulnerability", () => {
  const run = game();
  run("wave = 5; makeWave(); bannerT = 0; player.inv = 0; active.shield = 1; boss.targetX = player.x; boss.laserT = 0.6; updateBoss(0.01)");
  assert.equal(run("active.shield"), 0);
  assert.equal(run("lives"), 3);
  run("updateBoss(0.01)");
  assert.equal(run("lives"), 3);
  run("player.inv = 0; updateBoss(0.01)");
  assert.equal(run("state"), "dying");
  assert.equal(run("lives"), 2);
});

test("wave clear advances to the next wave on its own and keeps held controls", () => {
  const run = game();
  run("aliens.forEach(a => a.alive = false); aliveN = 0; keys.fire = true; shooting = true; keys.right = true; updatePlay(0)");
  assert.equal(run("state"), "clear");
  run("update(1.5)");
  assert.equal(run("state"), "clear");
  assert.equal(run("wave"), 1);
  run("update(0.2)");
  assert.equal(run("state"), "play");
  assert.equal(run("wave"), 2);
  assert.equal(run("aliveN"), 50);
  assert.equal(run("keys.fire && shooting && keys.right"), true);
  run("update(0.01)");
  assert.equal(run("wave"), 2);
});

test("a click during the wave-clear banner starts firing in the next wave", () => {
  const run = game();
  run("aliens.forEach(a => a.alive = false); aliveN = 0; shooting = false; updatePlay(0)");
  run.event("pointerdown", { clientX: 240, clientY: 580 });
  assert.equal(run("state"), "clear");
  assert.equal(run("shooting"), true);
  run("update(1.7); bannerT = 0; player.cool = 0; updatePlay(0)");
  assert.equal(run("pBullets.length"), 1);
});

test("a miss keeps bombs and laser charge, while restarting resets special resources", () => {
  const run = game();
  run("special.bombs = 1; special.charge = 80; hitPlayer(); update(1.2)");
  assert.equal(run("special.charge"), 80);
  assert.equal(run("special.bombs"), 1);
  run("startGame()");
  assert.equal(run("special.charge"), 0);
  assert.equal(run("special.bombs"), 2);
});

test("divers, zigzags, and flankers warn before moving and return without ending the wave", () => {
  for (const mode of ["dive", "zigzag", "flank"]) {
    const run = game();
    run(`wave = 2; flightT = Infinity; launchFlight(aliens[0], '${mode}'); const origin = alienRect(aliens[0]); updateFlights(0.1)`);
    assert.equal(run("alienRect(aliens[0]).x === origin.x && alienRect(aliens[0]).y === origin.y"), true);
    run("player.inv = 100; for (let i = 0; i < 600; i++) updateFlights(0.02)");
    assert.equal(run("aliens[0].flight"), null);
    assert.equal(run("aliveN"), 50);
    assert.equal(run("state"), "play");
  }
});

test("flight scheduling starts in wave two; a diver contact costs a life instead of an invasion game over", () => {
  const run = game();
  run("flightT = 0; updateFlights(0.01)");
  assert.equal(run("aliens.some(a => a.flight)"), false);
  run("wave = 2; updateFlights(0.01)");
  assert.equal(run("aliens.some(a => a.flight)"), true);
  run("launchFlight(aliens[0], 'dive'); Object.assign(aliens[0].flight, {x: player.x, y: PLAYER_Y, warning: 0}); updateFlights(0.01)");
  assert.equal(run("state"), "dying");
  assert.equal(run("lives"), 2);
});

test("keyboard and right-click trigger specials; pausing freezes boss and weapon timers and releases fire", () => {
  const run = game();
  run("special.charge = 100");
  run.event("pointerdown", { button: 2, clientX: 240, clientY: 580 });
  assert.ok(run("special.laserT > 0"));
  assert.equal(run("shooting"), false);
  run.event("keydown", { key: "x" });
  assert.equal(run("special.bombs"), 1);
  run("wave = 5; makeWave(); bannerT = 0; special.charge = 100");
  run.event("keydown", { key: "z" });
  run("keys.fire = true");
  run.event("keydown", { key: "p" });
  run("const snapshot = JSON.stringify({boss, special}); frame(last + 50)");
  assert.equal(run("JSON.stringify({boss, special}) === snapshot"), true);
  assert.equal(run("keys.fire"), false);
});

test("ten consecutive clears cross both boss encounters and return to formation combat without losing the build", () => {
  const run = game();
  run("collectBeam()");
  for (let wave = 1; wave <= 10; wave++) {
    assert.equal(run("wave"), wave);
    assert.equal(run("!!boss"), wave % 5 === 0);
    run(`
      bannerT = 0;
      if (boss) { for (const part of boss.parts) damageBossPart(part, 10000); }
      else { for (const a of aliens) killAlien(a, alienRect(a)); }
      freezeT = 0; updatePlay(0); update(1.7);
    `);
    assert.equal(run("state"), "play");
  }
  assert.equal(run("wave"), 11);
  assert.equal(run("aliens.length"), 50);
  assert.equal(run("active.beam"), 1);
  assert.equal(run("special.bombs"), 3);
});

test("the last airborne enemy keeps a wave active and can still be hit by a laser", () => {
  const run = game();
  run(`
    wave = 2; aliens = [aliens[0]]; aliveN = 1; flightT = Infinity;
    launchFlight(aliens[0], 'dive');
    Object.assign(aliens[0].flight, {x: player.x - 10, y: 350, warning: 0, vx: 0});
    updatePlay(0.01);
  `);
  assert.equal(run("state"), "play");
  run("special.charge = 100; activateLaser(); updatePlay(0.01)");
  assert.equal(run("state"), "clear");
  assert.equal(run("aliveN"), 0);
});

test("right-clicking during pause does not restart music or consume the laser gauge", () => {
  const run = game();
  run("special.charge = 100; setPaused(true); let musicStarts = 0; musicStart = () => musicStarts++");
  run.event("pointerdown", { button: 2, clientX: 240, clientY: 400 });
  assert.equal(run("musicStarts"), 0);
  assert.equal(run("special.charge"), 100);
  assert.equal(run("paused"), true);
});

test("extra lives arrive at 10,000 points and then every 20,000 points, up to five", () => {
  const run = game();
  run("addScore(9999)");
  assert.equal(run("lives"), 3);
  run("addScore(1)");
  assert.equal(run("lives"), 4);
  run("addScore(19999)");
  assert.equal(run("lives"), 4);
  run("addScore(1)");
  assert.equal(run("lives"), 5);
  run("addScore(20000)");
  assert.equal(run("lives"), 5);
  assert.equal(run("nextLife"), 70000);
  run("startGame()");
  assert.equal(run("nextLife"), 10000);
});

test("a fast main shot cannot skip past an alien even at the lowest frame rate", () => {
  const run = game();
  // dt の上限 0.05 秒で 1 フレームに進む距離ずつ、弾と敵の位置関係をずらして確かめる。
  for (let i = 0; i < 10; i++) {
    const offset = 1 + i * 3;
    run(`
      freezeT = 0;
      const r${i} = alienRect(aliens[${40 + i}]);
      pBullets = [{ x: r${i}.x + r${i}.w / 2 - 1, y: r${i}.y + r${i}.h + ${offset}, w: 2, h: SHOT_H, vx: 0 }];
      updatePlay(0.05);
    `);
    assert.equal(run(`aliens[${40 + i}].alive`), false, `offset ${offset}px`);
  }
});

test("the 1UP popup stays clear of the centered wave-clear text", () => {
  const run = game();
  // パーフェクトボーナス 600 点で 10,000 点を越え、WAVE CLEAR! と同時に 1UP する。
  run("score = 9900; aliens.forEach(a => a.alive = false); aliveN = 0; updatePlay(0)");
  assert.equal(run("state"), "clear");
  assert.equal(run("lives"), 4);
  // 寿命いっぱい上昇したときの文字の上端が、中央の文字の最下行 NEXT: WAVE (y=356) より下にある。
  assert.ok(run(`(() => {
    const p = popups.find(p => p.txt === "1UP!");
    return p.y - 22 * (p.life / 0.9) - p.size > 360;
  })()`));
});

test("holding the mouse button through a miss keeps firing after respawn, like the keyboard", () => {
  const run = game();
  run.event("pointerdown", { clientX: 240, clientY: 580 });
  run("hitPlayer()");
  assert.equal(run("state"), "dying");
  assert.equal(run("shooting"), true);
  run("update(1.2); bannerT = 0; player.cool = 0; pBullets = []; updatePlay(0)");
  assert.equal(run("state"), "play");
  assert.equal(run("pBullets.length"), 1);
  run("shooting = false; hitPlayer()");
  run.event("pointerdown", { clientX: 240, clientY: 580 });
  assert.equal(run("shooting"), true, "a press during the respawn wait counts too");
  run.event("pointerup");
  assert.equal(run("shooting"), false);
});
