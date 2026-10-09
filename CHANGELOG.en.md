# Changelog

*[日本語版はこちら / Japanese version](CHANGELOG.md)*

This project follows [Semantic Versioning](https://semver.org/).
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added

- A link to the game’s website (https://hnakada123.github.io/astro-defender/) now sits below the control hints under the game screen. The screen is drawn slightly smaller to make room, so everything still fits in one window
- The game guide pages (Japanese and English) have a link in the header for posting on X
- The game page has a link for posting on X next to the website link. It shares the game’s own URL (game.html), with the post text in the current display language
- Share card images (Japanese and English, 1200 × 630) in assets/social/ now appear when the game guide pages are posted on X and similar sites, with Open Graph and X card tags on those pages
- game.html has a page description and card tags too, so posting the game’s own URL shows the Japanese card image
- The source code guide (Japanese and English) explains the website and X post links in chapter 01 and the post link’s language switching in chapter 19, with every code excerpt’s line numbers updated. The English whole-page screenshot was retaken

### Changed

- Letters, digits and symbols on the game screen are now a 5 × 7 pixel font drawn for this game (they used to be Courier New, which looked rough on some systems). Lines that contain Japanese are drawn entirely in the system font so their characters match in size, preferring a clean monospace font for the Latin letters
- The buttons and control hints below the screen also switched from Courier New to a clean monospace font
- The source code guide (Japanese and English) now explains how the pixel font is built and drawn, with every code excerpt’s line numbers updated. Every screenshot that shows text was retaken
- Further refactoring for lower browser load (visuals, controls and rules are unchanged)
  - On 120Hz, 144Hz and similar displays, frames are skipped so play runs at about 60fps (the title and game-over screens at 30fps). 90Hz and 100Hz displays are not throttled
  - Each barrier is cached as an image and redrawn only when it erodes (about 400 fills per frame become 4 image draws)
  - The light lines from the linked cannons during the link laser are pre-rendered once per cannon count, removing the last per-frame `shadowBlur` drawing
  - When a bomb or the laser destroys many enemies at once, the kill sound plays at most once every 40ms, avoiding clipping and a burst of audio nodes
  - On-screen particles are capped at 400 so mass kills don't spike the drawing cost. Explosion debris stops 24 short of the cap, so the ship's exhaust and muzzle flash never vanish against it
  - The full-screen clear each frame is skipped unless the screen is shaking (the opaque sky image already covers the canvas)
- The source code guide (Japanese and English) now explains frame skipping on fast displays, barrier redraws, the kill-sound throttle, the particle cap and the pre-rendered laser lines, with every code excerpt’s line numbers updated
- The game guide and the source code guide (Japanese and English) now share the game’s dark space and neon colors
  - Body text sits in white cards with dark text; neon colors and the Silkscreen pixel font are kept for headings, labels and numbers
  - Code excerpts show their original line numbers with syntax colors
  - The chapter list sits beside the article on wide screens and folds away on narrow ones

### Fixed

- Hiding the tab right after a miss while the bonus saucer was on screen left the saucer’s hum playing indefinitely. The hum now stops during the miss sequence and resumes when play continues (this also fixes the saucer flying silently after pausing and resuming during a miss)
- The source code guide (Japanese and English) now explains this fix, with code excerpt line numbers and the test count updated

## [3.0.0] - 2026-10-09

The link laser, combos and linked cannons were strong enough to flatten the late game. This release reins them in and adds new attacks as the waves and bosses advance. Weapons and enemy attacks change how the game plays, so the major version goes up.

### Added

- From wave 6, some formation shots fly diagonally at your ship (shown in red; the share grows to 50% by wave 20)
- From wave 11, diving enemies fire one aimed shot on the way down
- From wave 16, formations occasionally fire a 3-way volley
- The wave-clear screen shows a line announcing each new attack just before it starts
- Bosses now have levels (wave 5 is Lv.1, wave 10 is Lv.2, and so on), shown at the top of the screen
  - Lv.2: every other attack boxes you in with two lasers, one on each side (hold still to stay between them)
  - Lv.3: when the warning ends, the center of the hull fires an aimed fan of five shots
  - Lv.4–6: each level shortens the time between attacks by 0.15 seconds
- Picking up an S capsule while shielded, or a B capsule with all four cannons linked, now scores 500 points instead of doing nothing
- The source code guide (Japanese and English) now covers boss levels, later-wave enemy fire, the laser slowdown and more, with every code excerpt’s line numbers updated. A screenshot of the twin lasers was added, and the title, boss and wave-start screenshots were retaken

### Changed

- While the link laser fires, the recoil limits your ship to 70px per second (sweeping the mouse used to wipe out the whole formation and end the wave in one shot)
- Each combo tier needs a longer chain than the last (×2 at 3 kills, ×3 at 7 … ×8 at 42). It used to rise every 4 kills and hit ×8 early in every wave
- The combo now starts over each wave (the first kill of the next wave used to continue the chain, so ×8 never ran out)
- Each linked cannon can have one beam on screen at a time (they fired every volley outside the main bullet cap, so four cannons kept outpacing the late-game enemies)
- Enemy fire keeps speeding up past wave 13 until around wave 30, and the cap on enemy bullets grows from 7 at wave 5 by one every 4 waves, up to 12
- The formation's base speed stops growing at wave 13 (any faster and constant edge bounces drop it to the ground before bullets matter)
- Boss durability stops growing at Lv.4 (wave 20), where later boss fights used to just get longer

### Fixed

- “LASER READY! [Z]” overlapped the barriers and the “COMBO ×n” text around the ship, making both hard to read. It now appears just above the barriers
- From wave 6 on, the “WAVE n” banner at the start of a wave overlapped the formation. It now appears between the formation and the barriers

## [2.0.0] - 2026-10-09

This release removes the between-wave upgrade pick and reworks rules such as barriers and boss fights. Because the way you play changes, the major version goes up.

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

[3.0.0]: https://github.com/hnakada123/astro-defender/releases/tag/v3.0.0
[2.0.0]: https://github.com/hnakada123/astro-defender/releases/tag/v2.0.0
[1.0.1]: https://github.com/hnakada123/astro-defender/releases/tag/v1.0.1
[1.0.0]: https://github.com/hnakada123/astro-defender/releases/tag/v1.0.0
