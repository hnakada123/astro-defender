# ASTRO DEFENDER — NEON ARCADE EDITION

*[日本語版はこちら / Japanese version](README.md)*

**▶ Play now: <https://hnakada123.github.io/astro-defender/>**
**📖 Source code guide: <https://hnakada123.github.io/astro-defender/doc/index.en.html>** (beginner-friendly, 23 chapters)

Current version: **v1.0.1** ([changelog](CHANGELOG.en.md))

A neo-retro fixed-screen shooter you play in the browser with the mouse.
No external libraries and no external assets — everything lives in the single `index.html` file.

Built on classic formation-shooter gameplay, with a modern arcade layer on top:
neon glow effects, a combo multiplier, power-ups and a synthwave soundtrack.

The game ships in both English and Japanese. It picks a language from your browser
settings on the first visit, and the buttons under the play field switch it at any time
(your choice is remembered in `localStorage`).

## Screenshots

| Title screen | Gameplay |
| :---: | :---: |
| ![Title screen](screenshots/title.png) | ![Gameplay](screenshots/gameplay.png) |

## Built with

- **HTML / CSS / JavaScript** (vanilla JS — no framework, no library, no build step)
- Rendering: **Canvas 2D API** (the pixel-art sprites are generated from code at runtime)
- Sound: **Web Audio API** (sound effects and music synthesized live — no audio files)
- High score: **localStorage**

## Running it

Just open `index.html` in a browser (Chrome / Firefox / Edge, …).

To serve it over a local server instead:

```sh
python3 -m http.server 8000
# → open http://localhost:8000
```

## Controls

| Input | Action |
| --- | --- |
| Move the mouse | Move your ship |
| Click (hold to auto-fire) | Shoot |
| Z / right-click / the laser button below the screen | Link laser (when the gauge is full) |
| X / the bomb button below the screen | Emergency bomb |
| 1 / 2 / 3, or click a card | Pick an upgrade after a wave (↑↓ + Enter also work) |
| P / Esc | Pause |
| M | Sound on / off |
| ← → + Space | Full keyboard control |

## Rules

- Wipe out the enemy formation, pick one upgrade, and move on to the next wave
- Every 5th wave brings a battleship. Destroy the turrets on both sides, then the central core
- Enemy bullets and diving enemies cost you a life. It is game over at 0 lives, or if the formation reaches the ground
- Shoot the bonus saucer that crosses the top of the screen for 50–300 points
- The green barriers block bullets, but they erode with every hit
- You gain an extra life every 5000 points (up to 5)
- The high score is saved in the browser's localStorage

## Modern arcade features

- **Combo multiplier** — chain kills within about 2 seconds to raise the multiplier, up to ×8.
  Taking a hit or running out of time resets it
- **Power-ups** — enemies occasionally drop a capsule; pick it up to activate it
  - `W` 3-way shot (8s) / `R` rapid fire (8s) / `S` shield (absorbs one hit)
  - `B` beam link — each pickup adds one cannon to each side of your ship (up to 4).
    They fire alongside your main gun and stack with `W`, `R` and `S`.
    There is no timer and they carry over into the next wave, but a miss removes them
    (a shield-blocked hit keeps them). The link count is shown at the bottom of the screen
- **Perfect bonus** — clear a wave without taking damage for bonus points
- **Presentation** — neon glow, bullet trails, particle explosions, shockwave rings,
  hit-stop, screen shake, and a parallax starfield with nebulae
- **Music** — a synthwave loop generated live with Web Audio

## Combat and upgrade systems

- **Link laser** — killing enemies and hitting the boss with normal shots charges the gauge;
  at full charge you fire a 1.2 second piercing laser. It clears every enemy and enemy bullet
  in its path and leaves the barriers intact. More linked beam cannons make it wider and stronger,
  and it works with no linked cannons at all. Firing it does not consume your cannons,
  and kills made by the laser do not recharge the gauge
- **Battleship boss fights** — turrets on either side protect the central core.
  Alongside their spread shots, the boss fires a laser that telegraphs its impact point
  1.1 seconds ahead with a red zone. The marked spot is fixed, so you can step out of it to dodge.
  Beating the boss restocks one bomb
- **Three-card upgrades** — every wave offers three random picks from the list below. Combat is
  paused until you choose. Beam, engine and magnet upgrades cap at Lv.5, survive a miss,
  and reset when you start a new game
  - Beam upgrade: more pierce and anti-boss damage on the linked beams; a wider, stronger link laser
  - Engine upgrade: move speed +15% (mouse and keyboard alike)
  - Magnet field: widens the range that pulls nearby capsules toward you
  - Emergency repair: life +1 (max 5, or 1000 points if you are already full)
  - Defense supply: bomb +1 (max 3), a shield, and 300 points
  - Energy charge: fills the laser gauge, and 300 points
- **Diving enemies** — from wave 2 on, enemies telegraph and then dive, zigzag, or sweep in
  from the side. Any that get past you rejoin the formation, and the wave continues until they are destroyed
- **Emergency bomb** — you start with 2, up to a maximum of 3. It erases every enemy bullet on
  screen and destroys enemies within 240px of your ship. It also damages every boss part and
  interrupts the boss's telegraphed or firing laser. You are invincible for 1.6 seconds afterwards.
  It leaves the barriers intact, and a miss does not restock it

## Source code guide

A beginner-friendly guide walks through `index.html` in 23 chapters: the game loop, the state machine,
sprite generation, collision detection, sound synthesis with Web Audio, and more, with line-numbered
excerpts from the real source and interactive labs that run in the browser.

- English: <https://hnakada123.github.io/astro-defender/doc/index.en.html> ([doc/index.en.html](doc/index.en.html))
- 日本語: <https://hnakada123.github.io/astro-defender/doc/> ([doc/index.html](doc/index.html))

## Tests

Node.js's built-in test runner covers the linked cannons, the special attacks, the boss,
the upgrade picker, the diving enemies, input handling, and what happens on a miss or a
wave transition (no extra packages required).

```sh
node --test tests/*.test.cjs
```

## Versioning

Releases follow [Semantic Versioning](https://semver.org/) and are recorded as `vX.Y.Z` git tags.
The current version is **v1.0.1**. It is also shown in the bottom-right corner of the title screen, and the changes are listed in [CHANGELOG.en.md](CHANGELOG.en.md).

- X (major): changes that affect how the game plays, such as new controls or rules
- Y (minor): new features, enemies or effects
- Z (patch): bug fixes and small balance tweaks

To bump the version, update the `VERSION` constant at the top of `index.html`, this README and `CHANGELOG.en.md`,
then run `git tag vX.Y.Z` and `git push --tags`.

## Rights

This is an original work built on the conventions of the fixed-screen formation-shooter genre.
It uses no copyrighted material from any existing commercial game.

- The name and logo are original to this project
- Every sprite, enemies included, was newly designed for this project
- All sound effects and music are synthesized live with the Web Audio API (no sampled material)

## License

[CC0 1.0 Universal](LICENSE) (effectively public domain).
No credit and no permission required — anyone may use, modify, redistribute,
or sell this work freely.
