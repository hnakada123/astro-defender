# Changelog

*[日本語版はこちら / Japanese version](CHANGELOG.md)*

This project follows [Semantic Versioning](https://semver.org/).
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Changed

- All of your shots (main gun, 3-way shots and linked beams) now pass straight through your own barriers, which only block enemy fire (your shots used to chip away at them, so you ended up wrecking your own cover)
- Clearing a wave now leads straight into the next one without an upgrade screen. Held fire and movement controls carry over into the next wave
- Beam link (B) now adds one cannon per pickup, alternating sides, and a miss costs two cannons instead of all of them
- Shorter boss fights
  - Turret and core durability halved (turrets 14 + 4×tier → 7 + 2×tier, core 40 + 16×tier → 20 + 8×tier). Bomb damage to the boss is halved to match (10 → 5)
  - Slower side-to-side sway (top speed about 85px/s → about 59px/s)
  - Five main shots can be on screen during boss fights instead of three
- Extra lives now come at 10,000 points and every 20,000 points after that, instead of every 5,000 (combos earned about 6,000 points per wave, so lives hit the cap early)
- Updated the source-code guide (Japanese and English) to match the new code. Chapter 14 is rewritten as "Wave clear and the next wave", and screenshots that showed the old screens were retaken
- Faster player shots (470 → 600px/s) to shorten the chase after the last few fast enemies. Main shots are also longer (10px → 14px) so they cannot skip past an enemy on a dropped frame

### Fixed

- The boss jumped up to about 140px right after finishing a telegraphed laser attack
- The "1UP!" popup overlapped "WAVE CLEAR!" and the wave-start banner in the middle of the screen
- Holding the mouse button through a miss stopped your fire after respawning until you clicked again (the keyboard kept firing). A press made while waiting to respawn now carries over too

### Removed

- The three-card upgrade pick after each wave (beam, engine and magnet upgrade levels; emergency repair, defense supply and energy charge)

## [1.0.1] - 2026-09-07

### Changed

- Refactored for lower browser load and faster processing (visuals, controls and rules are unchanged)
  - The title logo, GAME OVER text, boss hull and link-laser glow are pre-rendered once instead of drawing with `shadowBlur` every frame
  - The formation's sprites and glow are batched into one layer each and redrawn only when the roster or animation frame changes
  - The render loop stops while paused, and the title and game-over screens run at 30fps
  - The laser / bomb buttons below the canvas update the DOM only when their content changes
  - Fewer per-frame allocations and array operations (collision rectangles, barrier checks, particle removal)
  - The explosion sound reuses the shared noise buffer instead of generating one per sound
  - The canvas is opaque (`alpha: false`) to reduce page compositing cost

## [1.0.0] - 2026-09-06

First official release.

### Added

- The core mouse-controlled fixed-screen shooter (formation, barriers, bonus saucer, lives, saved hi-score)
- Neon arcade presentation (glow, particles, shockwave rings, hit stop, screen shake, parallax stars and nebulae)
- Combo multiplier (up to ×8), power-ups (3-way, rapid fire, shield, beam link) and the perfect bonus
- Sound effects and a synthwave soundtrack synthesized in real time with Web Audio
- Link laser, emergency bomb, a battleship boss every five waves, a three-card upgrade pick after each wave, and diving enemies
- Japanese / English display switching
- Automated tests on Node.js's built-in test runner
- A beginner-friendly source code guide (Japanese / English)
- Version number in the bottom-right corner of the title screen

[Unreleased]: https://github.com/hnakada123/astro-defender/compare/v1.0.1...HEAD
[1.0.1]: https://github.com/hnakada123/astro-defender/releases/tag/v1.0.1
[1.0.0]: https://github.com/hnakada123/astro-defender/releases/tag/v1.0.0
