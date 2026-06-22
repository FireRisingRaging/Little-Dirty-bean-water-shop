// CharacterCreatorScene
//
// How this works:
// The character isn't a sprite image — it's a handful of plain rectangles drawn
// with a Phaser Graphics object. That's the same trick old games used with
// palette swapping: redraw the same shapes in different colors instead of
// needing a separate art asset per hair/clothes combo. Once you have real
// pixel-art sprites, you'd swap drawCharacter() for `this.add.sprite(...)`
// and recolor via a shader or pre-baked frames instead — but the UI flow
// below (palette -> selection -> save) stays the same.

class CharacterCreatorScene extends Phaser.Scene {
  constructor() {
    super('CharacterCreator');
  }

  create() {
    // ---- state -------------------------------------------------------
    const saved = this.loadSavedCharacter();
    this.hairColor = saved.hairColor;
    this.clothesColor = saved.clothesColor;

    this.hairPalette = [
      0x2b1b0e, // brown
      0x141414, // black
      0xc94f4f, // red
      0xf2d54e, // blonde
      0x4f7fc9, // blue
      0x8c4fc9, // purple
      0x4fc98c, // green
      0xe8e8e8  // gray/white
    ];

    this.clothesPalette = [
      0x6b4f3a, // brown apron
      0x3a6b6b, // teal
      0x6b3a3a, // maroon
      0x3a3a6b, // navy
      0x6b6b3a, // olive
      0x3a6b3a, // green
      0x222222, // black
      0xc97a4f  // orange
    ];

    // ---- title --------------------------------------------------------
    this.add.text(240, 24, 'Create your barista', {
      fontSize: '20px',
      fontFamily: 'sans-serif',
      color: '#f2ece4'
    }).setOrigin(0.5);

    // ---- character preview ---------------------------------------------
    // dbwDrawCharacterArt draws centered on local (0,0), so position the
    // graphics object at the center of where the preview should appear.
    this.charGraphics = this.add.graphics().setPosition(240, 140);
    this.drawCharacter();

    // ---- swatches -------------------------------------------------------
    this.add.text(40, 250, 'Hair', { fontSize: '14px', color: '#cbb8d6' });
    this.hairSelector = this.createSwatchRow(this.hairPalette, 40, 270, (color) => {
      this.hairColor = color;
      this.drawCharacter();
    }, this.hairColor);

    this.add.text(40, 305, 'Clothes', { fontSize: '14px', color: '#cbb8d6' });
    this.clothesSelector = this.createSwatchRow(this.clothesPalette, 40, 325, (color) => {
      this.clothesColor = color;
      this.drawCharacter();
    }, this.clothesColor);

    // ---- continue button --------------------------------------------------
    const button = this.add.rectangle(420, 326, 80, 32, 0x5dcaa5).setInteractive({ useHandCursor: true });
    this.add.text(420, 326, 'Continue', { fontSize: '13px', color: '#0a2b22' }).setOrigin(0.5);

    this.confirmText = this.add.text(420, 348, '', { fontSize: '11px', color: '#9fe1cb' }).setOrigin(0.5);

    button.on('pointerdown', () => this.confirmCharacter());
  }

  // Draws the character with the currently selected colors. The actual
  // shape-drawing lives in js/utils/character.js so it can be reused for
  // the walking player sprite later.
  drawCharacter() {
    dbwDrawCharacterArt(this.charGraphics, this.hairColor, this.clothesColor);
  }

  // Creates a row of clickable color swatches starting at (x, y).
  // Returns an object with a method to move the selection highlight.
  createSwatchRow(palette, x, y, onSelect, currentColor) {
    const size = 24;
    const gap = 6;
    const swatchRects = [];

    const highlight = this.add.rectangle(0, 0, size + 6, size + 6)
      .setStrokeStyle(2, 0xf2ece4)
      .setFillStyle(0x000000, 0)
      .setVisible(false);

    palette.forEach((color, i) => {
      const sx = x + i * (size + gap) + size / 2;
      const sy = y + size / 2;
      const rect = this.add.rectangle(sx, sy, size, size, color)
        .setStrokeStyle(1, 0x000000, 0.3)
        .setInteractive({ useHandCursor: true });

      rect.on('pointerdown', () => {
        onSelect(color);
        highlight.setPosition(sx, sy).setVisible(true);
      });

      swatchRects.push({ rect, color, sx, sy });

      if (color === currentColor) {
        highlight.setPosition(sx, sy).setVisible(true);
      }
    });

    return { swatchRects, highlight };
  }

  // (pants-shading logic now lives in js/utils/character.js as dbwShadeColor,
  // shared with the walking player sprite)


  confirmCharacter() {
    const data = { hairColor: this.hairColor, clothesColor: this.clothesColor };
    try {
      localStorage.setItem('dbw_character', JSON.stringify(data));
      this.confirmText.setText('Saved!');
      this.time.delayedCall(1200, () => this.confirmText.setText(''));
    } catch (e) {
      this.confirmText.setText('Could not save :(');
    }

    console.log('Character created:', data);
    this.time.delayedCall(500, () => this.scene.start('ShopBranding'));
  }

  loadSavedCharacter() {
    const defaults = { hairColor: 0x2b1b0e, clothesColor: 0x6b4f3a };
    try {
      const raw = localStorage.getItem('dbw_character');
      if (!raw) return defaults;
      const parsed = JSON.parse(raw);
      return {
        hairColor: parsed.hairColor ?? defaults.hairColor,
        clothesColor: parsed.clothesColor ?? defaults.clothesColor
      };
    } catch (e) {
      return defaults;
    }
  }
}