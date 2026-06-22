# Dirty Bean Water Shop — prototype

This is a first working piece of the game: the character creator screen.
It's plain HTML/JS + Phaser 3 loaded from a CDN — no build step, no npm install,
nothing to compile. That's intentional, since the whole project is meant to
deploy straight to GitHub Pages.

## Try it locally

Just open `index.html` in a browser. Since there are no external image/audio
files being loaded yet, opening the file directly (double-click it) works fine.

If you add real asset files later (sprite sheets, sound) and double-clicking
stops working, that's a browser security restriction on local file loading —
run a tiny local server instead:

```
npx serve .
```

then open the URL it prints.

## What's in here

```
index.html                        the page Phaser mounts into
js/main.js                        Phaser config — the list of scenes
js/scenes/CharacterCreatorScene.js   the character creator itself
```

The character isn't an image — it's drawn as a handful of colored rectangles
(head, hair, shirt, pants, arms) using a Phaser `Graphics` object. Picking a
swatch just redraws those rectangles in a new color. This is a stand-in for
real pixel art: it proves out the color-picking mechanic and save flow now,
so when you (or an artist) make actual sprite sheets in Aseprite later, you
only need to swap `drawCharacter()` for `this.add.sprite(...)` — the swatch
UI and the save-to-localStorage logic don't need to change.

Your color choice is saved to the browser's `localStorage` under the key
`dbw_character`, and reloads automatically next time you open the page. This
is the same pattern you'll use for the rest of the game's save data (beans,
money, shop name) since GitHub Pages has no backend/database — everything
lives in the player's browser.

## Deploying to GitHub Pages

1. Create a new GitHub repo (or use an existing one).
2. Push these files so `index.html` sits at the repo root (or in a `/docs`
   folder — your choice, just match it in step 3).
3. In the repo, go to **Settings → Pages**, set the source branch to your
   main branch and the folder to `/ (root)` (or `/docs`), then save.
4. GitHub will give you a URL like `https://yourname.github.io/repo-name/` —
   that's your game, live.

## Next steps

- Add a `ShopBrandingScene` (shop name + logo) and have the Continue button
  call `this.scene.start('ShopBranding')` instead of just logging.
- Swap the rectangle character for a real sprite sheet once you have one.
- Add a skin-tone swatch row the same way hair/clothes work, if you want
  that level of customization too.
