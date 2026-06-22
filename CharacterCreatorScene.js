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
    // The character is drawn inside a 120x180 box; charX/charY is its top-left corner.
    this.charX = 180;
    this.charY = 50;
    this.charGraphics = this.add.graphics();
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

  // Draws the character with the currently selected colors.
  // Coordinates are hand-picked to look roughly like a simple front-facing
  // chibi figure: hair, head, eyes, shirt, arms, pants, shoes.
  drawCharacter() {
    const g = this.charGraphics;
    const ox = this.charX;
    const oy = this.charY;
    const skin = 0xf1c6a0;
    const dark = 0x231d28;
    const pantsColor = this.shadeColor(this.clothesColor, -0.25);

    g.clear();

    // hair (top + side flaps, drawn first so the head can sit on top of it)
    g.fillStyle(this.hairColor, 1);
    g.fillRect(ox + 12, oy + 0, 96, 28);
    g.fillRect(ox + 12, oy + 16, 16, 48);
    g.fillRect(ox + 92, oy + 16, 16, 48);

    // head/face
    g.fillStyle(skin, 1);
    g.fillRect(ox + 28, oy + 16, 64, 56);

    // eyes
    g.fillStyle(dark, 1);
    g.fillRect(ox + 40, oy + 40, 12, 12);
    g.fillRect(ox + 68, oy + 40, 12, 12);

    // shirt/apron
    g.fillStyle(this.clothesColor, 1);
    g.fillRect(ox + 16, oy + 72, 88, 56);

    // arms
    g.fillStyle(skin, 1);
    g.fillRect(ox + 0, oy + 76, 16, 44);
    g.fillRect(ox + 104, oy + 76, 16, 44);

    // pants (a darker shade of the clothes color, so one choice still reads as an outfit)
    g.fillStyle(pantsColor, 1);
    g.fillRect(ox + 28, oy + 128, 64, 40);

    // shoes
    g.fillStyle(dark, 1);
    g.fillRect(ox + 28, oy + 168, 32, 12);
    g.fillRect(ox + 60, oy + 168, 32, 12);
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

  // Darkens (negative amount) or lightens (positive amount) a hex color.
  // amount is a fraction, e.g. -0.25 darkens by 25%.
  shadeColor(hex, amount) {
    const r = (hex >> 16) & 0xff;
    const g = (hex >> 8) & 0xff;
    const b = hex & 0xff;
    const adjust = (c) => Phaser.Math.Clamp(Math.round(c * (1 + amount)), 0, 255);
    return (adjust(r) << 16) | (adjust(g) << 8) | adjust(b);
  }

  confirmCharacter() {
    const data = { hairColor: this.hairColor, clothesColor: this.clothesColor };
    try {
      localStorage.setItem('dbw_character', JSON.stringify(data));
      this.confirmText.setText('Saved!');
      this.time.delayedCall(1200, () => this.confirmText.setText(''));
    } catch (e) {
      this.confirmText.setText('Could not save :(');
    }

    // Next step in the flow would be the shop branding/naming screen:
    // this.scene.start('ShopBranding');
    console.log('Character created:', data);
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
