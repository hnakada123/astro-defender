<p align="center"><img src="assets/icons/icon-192.png" width="128" height="128" alt="ASTRO DEFENDER icon"></p>

# ASTRO DEFENDER — NEON ARCADE EDITION

*[日本語版はこちら / Japanese version](README.md)*

| Page | URL |
| --- | --- |
| ▶ **Play now** | <https://hnakada123.github.io/astro-defender/game.html> |
| 🎮 **Game guide** | <https://hnakada123.github.io/astro-defender/doc/index.en.html> |
| 📖 **Source code guide** (beginner-friendly, 23 chapters) | <https://hnakada123.github.io/astro-defender/doc/source.en.html> |
| 🌐 **ゲーム紹介・遊び方 (Japanese)** | <https://hnakada123.github.io/astro-defender/> |
| 🌐 **ソースコード解説 (Japanese)** | <https://hnakada123.github.io/astro-defender/doc/source.html> |

Current version: **v3.1.0** ([changelog](CHANGELOG.en.md))

A neo-retro fixed-screen shooter you play in the browser with the mouse.
In-game graphics and audio are generated from code, and the game runs from a single `game.html` file without external libraries.

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
- Rendering: **Canvas 2D API** (the pixel-art sprites and the pixel font for letters and digits are generated from code at runtime)
- Sound: **Web Audio API** (sound effects and music synthesized live — no audio files)
- High score: **localStorage**

## Running it

Just open `game.html` in a browser (Chrome / Firefox / Edge, …).

To serve it over a local server instead:

```sh
python3 -m http.server 8000
# → open http://localhost:8000/game.html
```

## Controls

| Input | Action |
| --- | --- |
| Move the mouse | Move your ship |
| Click (hold to auto-fire) | Shoot |
| Z / right-click / the laser button below the screen | Link laser (when the gauge is full) |
| X / the bomb button below the screen | Emergency bomb |
| P / Esc | Pause |
| M | Sound on / off |
| ← → + Space | Full keyboard control |

## Rules

- Wipe out the enemy formation to move straight on to the next wave
- Every 5th wave brings a battleship. Destroy the turrets on both sides, then the central core
- Enemy bullets and diving enemies cost you a life. It is game over at 0 lives, or if the formation reaches the ground
- Shoot the bonus saucer that crosses the top of the screen for 50–300 points
- The green barriers block enemy bullets and erode with every hit. Your own shots pass straight through them
- You gain an extra life at 10,000 points and every 20,000 points after that (up to 5)
- The high score is saved in the browser's localStorage

## Modern arcade features

- **Combo multiplier** — chain kills within about 2 seconds to raise the multiplier, up to ×8.
  Each tier needs a longer chain: ×2 at 3 kills, ×3 at 7, and ×8 at 42 kills in a row.
  Taking a hit, running out of time, or moving on to the next wave resets it
- **Power-ups** — enemies occasionally drop a capsule; pick it up to activate it
  - `W` 3-way shot (8s) / `R` rapid fire (8s) / `S` shield (absorbs one hit)
  - `B` beam link — each pickup adds one cannon, alternating between the sides of your ship (up to 4).
    They fire alongside your main gun and stack with `W`, `R` and `S`.
    Each cannon can have one beam on screen at a time and fires again once it is gone.
    There is no timer and they carry over into the next wave, but a miss costs you two of them
    (a shield-blocked hit keeps them). The link count is shown at the bottom of the screen
  - An `S` while shielded, or a `B` with all four cannons linked, scores 500 points instead
- **Perfect bonus** — clear a wave without taking damage for bonus points
- **Presentation** — neon glow, bullet trails, particle explosions, shockwave rings,
  hit-stop, screen shake, and a parallax starfield with nebulae
- **Music** — a synthwave loop generated live with Web Audio

## Combat systems

- **Link laser** — killing enemies and hitting the boss with normal shots charges the gauge;
  at full charge you fire a 1.2 second piercing laser. It clears every enemy and enemy bullet
  in its path and leaves the barriers intact. More linked beam cannons make it wider and stronger,
  and it works with no linked cannons at all. While it fires, the recoil slows your ship
  to 70px per second. Firing it does not consume your cannons,
  and kills made by the laser do not recharge the gauge
- **Battleship boss fights** — turrets on either side protect the central core.
  Alongside their spread shots, the boss fires a laser that telegraphs its impact point
  1.1 seconds ahead with a red zone. The marked spot is fixed, so you can step out of it to dodge,
  and the boss holds still while it telegraphs and fires. During boss fights you can have five
  main shots on screen instead of three. Beating the boss restocks one bomb.
  Each battleship is one level higher than the last (wave 5 is Lv.1, wave 10 is Lv.2, and so on)
  - Lv.2: every other attack boxes you in with two lasers, one on each side. Hold still to stay between them
  - Lv.3: when it fires, the center of the hull also sends an aimed fan of five shots
  - Lv.4 and up: attacks come faster (up to Lv.6). Durability stops growing at Lv.4
- **Diving enemies** — from wave 2 on, enemies telegraph and then dive, zigzag, or sweep in
  from the side. Any that get past you rejoin the formation, and the wave continues until they are destroyed
- **New attacks in later waves** — red shots aimed at your ship join in from wave 6,
  diving enemies fire once on the way down from wave 11, and formations fire 3-way volleys from wave 16.
  Enemy fire rate and the cap on enemy bullets keep rising until around wave 30 (the formation's base speed
  stops growing at wave 13). The wave-clear screen announces each new attack just before it starts
- **Emergency bomb** — you start with 2, up to a maximum of 3. It erases every enemy bullet on
  screen and destroys enemies within 240px of your ship. It also damages every boss part and
  interrupts the boss's telegraphed or firing laser. You are invincible for 1.6 seconds afterwards.
  It leaves the barriers intact, and a miss does not restock it

## Source code guide

A beginner-friendly guide walks through `game.html` in 23 chapters: the game loop, the state machine,
sprite generation, collision detection, sound synthesis with Web Audio, and more, with line-numbered
excerpts from the real source and interactive labs that run in the browser.
The English guide puts all 23 chapters on one page; the Japanese guide lists them in four parts, one page per chapter.

- English: <https://hnakada123.github.io/astro-defender/doc/source.en.html> ([doc/source.en.html](doc/source.en.html))
- 日本語: <https://hnakada123.github.io/astro-defender/doc/source.html> ([doc/source.html](doc/source.html))

## Files

| Path | Contents |
| --- | --- |
| `game.html` | The game itself (HTML, CSS and JavaScript in one file). Add `?lang=en` or `?lang=ja` to open it in that language |
| `game.en.html` | An entry page for sharing in English. It shows the English card image and moves straight on to the game in English |
| `index.html` | The Japanese game guide, the top page of the site (`doc/index.html` has the same content) |
| `doc/` | The English game guide (`index.en.html`), the source code guides (`source.en.html`, `source.html`, `guide/`), and their shared CSS, JavaScript and images |
| `favicon.ico`, `assets/icons/` | Browser icons |
| `assets/fonts/` | The Silkscreen font used for labels on the guide pages |
| `assets/social/` | Card images shown when the game guide is shared on X and similar sites (`generation.txt` explains how to rebuild them) |
| `screenshots/` | Screenshots for this README |
| `promo/` | Trailer videos (v1.0.0, English and Japanese) |
| `tests/` | Tests for the game logic |

When you change the CSS or JavaScript of the guide pages, also bump the `?v=20261009-4` number that each page adds to those files,
so browsers don't pair a new page with an old cached file.

## Tests

Node.js's built-in test runner covers the linked cannons, the special attacks, the boss,
the diving enemies, later-wave enemy fire, combos and extra lives, input handling, the dot font,
the particle cap, and what happens on a miss or a wave transition (no extra packages required).

```sh
node --test tests/*.test.cjs
```

## Versioning

Releases follow [Semantic Versioning](https://semver.org/) and are recorded as `vX.Y.Z` git tags.
The current version is **v3.1.0**. It is also shown in the bottom-right corner of the title screen, and the changes are listed in [CHANGELOG.en.md](CHANGELOG.en.md).

- X (major): changes that affect how the game plays, such as new controls or rules
- Y (minor): new features, enemies or effects
- Z (patch): bug fixes and small balance tweaks

To bump the version, update the `VERSION` constant at the top of `game.html`, this README and `CHANGELOG.en.md`,
then run `git tag vX.Y.Z` and `git push --tags`.

## Rights

This is an original work built on the conventions of the fixed-screen formation-shooter genre.
It uses no copyrighted material from any existing commercial game.

- The name and logo are original to this project
- Every sprite, enemies included, and the pixel font used for on-screen letters and digits were newly designed for this project
- All sound effects and music are synthesized live with the Web Audio API (no sampled material)

## License

[CC0 1.0 Universal](LICENSE) (effectively public domain).
No credit and no permission required — anyone may use, modify, redistribute,
or sell this work freely.

The one exception is the Silkscreen font ([assets/fonts/](assets/fonts/)) used for labels on the guide pages.
It is the work of The Silkscreen Project Authors and is distributed under the
[SIL Open Font License 1.1](assets/fonts/OFL.txt), not CC0. The game itself (`game.html`) does not use it.
