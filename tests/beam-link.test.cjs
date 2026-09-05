const assert = require("node:assert/strict");
const { test } = require("node:test");
const { game } = require("./helpers/game.cjs");

test("B capsules can drop, fall, and be collected; repeated pickups stop at four cannons", () => {
  const run = game();
  run(`
    const originalRandom = Math.random;
    const dropRolls = [0, 0.99, 0];
    Math.random = () => dropRolls.shift();
    maybeDrop(player.x, PLAYER_Y - 24);
    Math.random = originalRandom;
  `);
  assert.equal(run("powerups[0].type"), "beam");
  run("for (let i = 0; i < 5; i++) updatePlay(0.05)");
  assert.equal(run("powerups.length"), 0);
  assert.equal(run("active.beam"), 2);
  run("collectBeam()");
  assert.equal(run("active.beam"), 4);
  run("collectBeam()");
  assert.equal(run("active.beam"), 4);
  assert.equal(run("popups.at(-1).txt"), "BEAM LINK MAX!");
});

test("linked cannons fire with the main gun without consuming its bullet allowance", () => {
  const run = game();
  run("barriers = []; collectBeam(); shooting = true; updatePlay(0)");
  assert.equal(run("pBullets.filter(p => p.beam).length"), 2);
  assert.equal(run("pBullets.filter(p => !p.beam).length"), 1);
  assert.equal(run("pBullets.filter(p => p.beam).every(p => Math.abs(p.x + p.w / 2 - player.x) === 24)"), true);
  run("for (let i = 0; i < 28; i++) updatePlay(0.01)");
  assert.equal(run("pBullets.filter(p => p.beam).length"), 4);
  assert.equal(run("pBullets.filter(p => !p.beam).length"), 2);
});

test("four cannons work alongside wide shots, rapid fire, and a shield", () => {
  const run = game();
  run(`
    barriers = [];
    collectBeam(); collectBeam();
    applyPU("wide"); applyPU("rapid"); applyPU("shield");
    keys.fire = true;
    updatePlay(0);
  `);
  assert.equal(run("pBullets.length"), 7);
  assert.equal(run("pBullets.filter(p => p.beam).length"), 4);
  assert.equal(run("pBullets.filter(p => !p.beam && p.vx !== 0).length"), 2);
  run("for (let i = 0; i < 13; i++) updatePlay(0.01)");
  assert.equal(run("pBullets.length"), 14);
  assert.equal(run("active.shield"), 1);
});

test("a fired beam destroys an alien and awards points only once", () => {
  const run = game();
  run(`
    barriers = []; collectBeam(); shooting = true; updatePlay(0); shooting = false;
    const beam = pBullets.find(p => p.beam);
    const target = alienRect(aliens[0]);
    beam.x = target.x + 2; beam.y = target.y;
    pBullets = [beam];
    updatePlay(0);
  `);
  assert.equal(run("aliens[0].alive"), false);
  assert.equal(run("aliveN"), 49);
  assert.equal(run("score"), 30);
  assert.equal(run("pBullets.length"), 0);
  run("freezeT = 0; updatePlay(0)");
  assert.equal(run("score"), 30);
});

test("a fired beam destroys a bonus saucer", () => {
  const run = game();
  run(`
    barriers = []; collectBeam(); shooting = true; updatePlay(0); shooting = false;
    const beam = pBullets.find(p => p.beam);
    saucer = { x: beam.x - 8, y: 62, w: 32, h: 14, vx: 0 };
    beam.y = saucer.y;
    pBullets = [beam];
    updatePlay(0);
  `);
  assert.equal(run("saucer"), null);
  assert.ok(run("score >= 50"));
  assert.equal(run("pBullets.length"), 0);
});

test("beams interact with barriers and enemy bullets", () => {
  const run = game();
  run(`
    collectBeam(); shooting = true; updatePlay(0); shooting = false;
    const beam = pBullets.find(p => p.beam);
    const barrier = barriers[0];
    beam.x = barrier.x + 6 * barrier.cell; beam.y = barrier.y;
    pBullets = [beam];
    updatePlay(0);
  `);
  assert.equal(run("pBullets.length"), 0);
  assert.equal(run("barriers[0].g[0][6]"), 0);
  run(`
    barriers = []; player.cool = 0; shooting = true; updatePlay(0); shooting = false;
    const nextBeam = pBullets.find(p => p.beam);
    pBullets = [nextBeam];
    eBullets = [{ x: nextBeam.x, y: nextBeam.y, w: 3, h: 9, vy: 0 }];
    updatePlay(0);
  `);
  assert.equal(run("pBullets.length"), 0);
  assert.equal(run("eBullets.length"), 0);
  assert.equal(run("lives"), 3);
});

test("a shield preserves the links; an unshielded hit and restart remove them", () => {
  const run = game();
  run(`
    collectBeam(); collectBeam(); applyPU("shield");
    function enemyHit() {
      player.inv = 0;
      eBullets = [{ x: player.x, y: PLAYER_Y, w: 3, h: 9, vy: 0 }];
      updatePlay(0);
    }
    enemyHit();
  `);
  assert.equal(run("active.shield"), 0);
  assert.equal(run("active.beam"), 4);
  assert.equal(run("lives"), 3);
  run("enemyHit()");
  assert.equal(run("active.beam"), 0);
  assert.equal(run("state"), "dying");
  assert.equal(run("lives"), 2);
  run("update(1.2); collectBeam(); startGame()");
  assert.equal(run("active.beam"), 0);
  assert.equal(run("pBullets.length"), 0);
});

test("links last beyond timed upgrades and survive the next wave", () => {
  const run = game();
  run(`
    collectBeam(); applyPU("wide");
    for (let i = 0; i < 180; i++) updatePlay(0.05);
  `);
  assert.equal(run("active.wide"), 0);
  assert.equal(run("active.beam"), 2);
  run("aliens.forEach(a => a.alive = false); aliveN = 0; updatePlay(0); update(1.7); chooseUpgrade(0)");
  assert.equal(run("wave"), 2);
  assert.equal(run("active.beam"), 2);
});

test("linked cannons stay on screen when acquired at the edge and with either control mode", () => {
  const run = game();
  run("player.x = mouseX = 0; collectBeam(); collectBeam()");
  assert.equal(run("BEAM_OFFSETS.every(offset => player.x + offset - CANNON_IMG.width / 2 >= 0)"), true);
  run("mouseX = W; updatePlay(0.05)");
  assert.equal(run("BEAM_OFFSETS.every(offset => player.x + offset + CANNON_IMG.width / 2 <= W)"), true);
  run("inputMode = 'keys'; keys.left = true; for (let i = 0; i < 40; i++) updatePlay(0.05)");
  assert.equal(run("BEAM_OFFSETS.every(offset => player.x + offset - CANNON_IMG.width / 2 >= 0)"), true);
});
