# Changelog

*[日本語版はこちら / Japanese version](CHANGELOG.md)*

This project follows [Semantic Versioning](https://semver.org/).
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

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

[1.0.1]: https://github.com/hnakada123/astro-defender/releases/tag/v1.0.1
[1.0.0]: https://github.com/hnakada123/astro-defender/releases/tag/v1.0.0
