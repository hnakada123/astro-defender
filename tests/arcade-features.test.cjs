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

test("linked cannons and beam upgrades strengthen the laser without being consumed", () => {
  const run = game();
  run("special.charge = 100; activateLaser(); const baseWidth = special.laserW, basePower = special.laserDps; special.laserT = 0");
  run("collectBeam(); collectBeam(); upgrades.beam = 2; special.charge = 100; activateLaser()");
  assert.ok(run("special.laserW > baseWidth && special.laserDps > basePower"));
  assert.equal(run("active.beam"), 4);
  assert.equal(run("activateLaser()"), false);
});

test("specials reject empty gauges, empty stocks, non-play states, and pause", () => {
  const run = game();
  assert.equal(run("activateLaser()"), false);
  run("special.charge = 100; special.bombs = 0");
  assert.equal(run("activateBomb()"), false);
  for (const state of ["title", "clear", "upgrade", "dying", "gameover"]) {
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
  assert.equal(run("boss.parts[0].hp"), 8);
  assert.equal(run("boss.parts[2].hp"), 56);
  assert.ok(run("boss.attackT >= 2"));
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

test("wave clear waits for one of three upgrades; number-key selection advances exactly once", () => {
  const run = game();
  run("aliens.forEach(a => a.alive = false); aliveN = 0; keys.fire = true; updatePlay(0); update(1.7)");
  assert.equal(run("state"), "upgrade");
  assert.equal(run("new Set(upgradeChoices).size"), 3);
  run("update(30)");
  assert.equal(run("wave"), 1);
  run("upgradeChoices = ['beam', 'speed', 'magnet']");
  run.event("keydown", { key: "2" });
  assert.equal(run("upgrades.speed"), 1);
  assert.equal(run("wave"), 2);
  assert.equal(run("keys.fire"), false);
  assert.equal(run("chooseUpgrade(0)"), false);
});

test("upgrade cards support pointer selection and capped builds still offer three useful choices", () => {
  const run = game();
  run("upgrades.beam = upgrades.speed = upgrades.magnet = 5; openUpgrades()");
  assert.equal(run("upgradeChoices.every(k => !UPGRADE_DEFS[k].max)"), true);
  assert.equal(run("new Set(upgradeChoices).size"), 3);
  run("upgradeChoices = ['beam', 'supply', 'charge']; special.bombs = 0");
  run.event("pointerdown", { clientX: 80, clientY: 355 });
  assert.equal(run("wave"), 2);
  assert.equal(run("special.bombs"), 1);
  assert.equal(run("active.shield"), 1);
});

test("beam upgrades pierce enemies; speed upgrades affect both inputs; magnet upgrades attract capsules", () => {
  const run = game();
  run(`
    collectBeam(); upgrades.beam = 1; shooting = true; updatePlay(0); shooting = false;
    const p = pBullets.find(b => b.beam); p.x = alienRect(aliens[0]).x; p.y = alienRect(aliens[0]).y;
    pBullets = [p]; updatePlay(0);
  `);
  assert.equal(run("pBullets.length"), 1);
  run("freezeT = 0; p.y = alienRect(aliens[10]).y; updatePlay(0)");
  assert.equal(run("pBullets.length"), 0);
  run("freezeT = 0; inputMode = 'keys'; keys.right = true; player.x = 200; updatePlay(0.05); const baseDistance = player.x - 200; player.x = 200; upgrades.speed = 1; updatePlay(0.05)");
  assert.ok(run("player.x - 200 > baseDistance"));
  run("inputMode = 'mouse'; player.x = 200; mouseX = 400; upgrades.speed = 0; updatePlay(0.05); const mouseDistance = player.x - 200; player.x = 200; upgrades.speed = 1; updatePlay(0.05)");
  assert.ok(run("player.x - 200 > mouseDistance"));
  run("player.x = mouseX = 240; upgrades.magnet = 1; powerups = [{x: 290, y: PLAYER_Y - 20, type: 'shield', ph: 0}]; updatePlay(0.05)");
  assert.ok(run("powerups[0].x < 290"));
  run("for (let i = 0; i < 20; i++) updatePlay(0.01)");
  assert.equal(run("active.shield"), 1);
});

test("permanent upgrades survive death, while restarting resets upgrades and special resources", () => {
  const run = game();
  run("upgrades.beam = 2; upgrades.speed = 1; upgrades.magnet = 3; special.bombs = 1; special.charge = 80; hitPlayer(); update(1.2)");
  assert.equal(run("upgrades.beam + upgrades.speed + upgrades.magnet"), 6);
  assert.equal(run("special.bombs"), 1);
  run("startGame()");
  assert.equal(run("upgrades.beam + upgrades.speed + upgrades.magnet + special.charge"), 0);
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
  for (let wave = 1; wave <= 10; wave++) {
    assert.equal(run("wave"), wave);
    assert.equal(run("!!boss"), wave % 5 === 0);
    run(`
      bannerT = 0;
      if (boss) { for (const part of boss.parts) damageBossPart(part, 10000); }
      else { for (const a of aliens) killAlien(a, alienRect(a)); }
      freezeT = 0; updatePlay(0); update(1.7);
    `);
    assert.equal(run("state"), "upgrade");
    assert.equal(run("upgradeChoices.length"), 3);
    run(`upgradeChoices = ['beam', 'speed', 'magnet']; chooseUpgrade(${(wave - 1) % 3})`);
    assert.equal(run("state"), "play");
  }
  assert.equal(run("wave"), 11);
  assert.equal(run("aliens.length"), 50);
  assert.equal(run("upgrades.beam + upgrades.speed + upgrades.magnet"), 10);
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
