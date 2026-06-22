// ShopBrandingScene
//
// Second onboarding screen: name the shop and pick a logo (a preset symbol
// + a color, same palette-swap idea as the character creator). The name
// field is a real HTML <input> layered over the canvas via Phaser's DOM
// support, since drawing a working text field by hand in canvas isn't worth
// the effort when the browser already has one.

class ShopBrandingScene extends Phaser.Scene {
  constructor() {
    super('ShopBranding');
  }

  create() {
    const saved = this.loadSavedShop();
    this.shopName = saved.name;
    this.logoType = saved.logoType;
    this.logoColor = saved.logoColor;

    this.logoPalette = [
      0x6b4f3a, // coffee brown
      0xc9a24f, // gold
      0xc94f4f, // red
      0x3a6b6b, // teal
      0x3a6b3a, // green
      0x3a3a6b, // navy
      0x222222, // black
      0xf2ece4  // cream
    ];
    this.iconTypes = ['cup', 'bean', 'leaf', 'star'];

    // ---- back button --------------------------------------------------
    const back = this.add.rectangle(50, 22, 56, 24, 0x3a2e4a)
      .setStrokeStyle(1, 0x000000, 0.3)
      .setInteractive({ useHandCursor: true });
    this.add.text(50, 22, '< Back', { fontSize: '11px', color: '#cbb8d6' }).setOrigin(0.5);
    back.on('pointerdown', () => this.scene.start('CharacterCreator'));

    this.add.text(240, 22, 'Name your shop', {
      fontSize: '18px',
      fontFamily: 'sans-serif',
      color: '#f2ece4'
    }).setOrigin(0.5);

    // ---- live logo preview --------------------------------------------
    this.previewGraphics = this.add.graphics().setPosition(240, 72);
    this.nameLiveText = this.add.text(240, 112, '', {
      fontSize: '14px',
      fontFamily: 'sans-serif',
      color: '#f2d54e',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.updatePreview();

    // ---- shop name field (a real DOM <input>) ---------------------------
    this.nameInputElement = document.createElement('input');
    this.nameInputElement.type = 'text';
    this.nameInputElement.maxLength = 24;
    this.nameInputElement.placeholder = 'e.g. The Dirty Bean';
    this.nameInputElement.value = this.shopName;
    this.nameInputElement.style.cssText =
      'width:220px; padding:7px; font-size:13px; text-align:center; ' +
      'border-radius:6px; border:1px solid #555; background:#1f1a26; color:#f2ece4;';
    this.add.dom(240, 142, this.nameInputElement);
    this.nameInputElement.addEventListener('input', () => {
      this.shopName = this.nameInputElement.value;
      this.updatePreview();
    });

    // ---- symbol picker --------------------------------------------------
    this.add.text(40, 168, 'Symbol', { fontSize: '13px', color: '#cbb8d6' });
    this.iconHighlight = this.add.rectangle(0, 0, 44, 44)
      .setStrokeStyle(2, 0xf2ece4)
      .setFillStyle(0x000000, 0)
      .setVisible(false);

    const iconStartX = 165;
    this.iconTypes.forEach((type, i) => {
      const x = iconStartX + i * 50;
      const y = 190;
      const bg = this.add.rectangle(x, y, 36, 36, 0x3a2e4a)
        .setStrokeStyle(1, 0x000000, 0.3)
        .setInteractive({ useHandCursor: true });
      const icon = this.add.graphics().setPosition(x, y);
      dbwDrawIcon(icon, type, 28, 0xcbb8d6);

      bg.on('pointerdown', () => {
        this.logoType = type;
        this.iconHighlight.setPosition(x, y).setVisible(true);
        this.updatePreview();
      });

      if (type === this.logoType) {
        this.iconHighlight.setPosition(x, y).setVisible(true);
      }
    });

    // ---- color picker -----------------------------------------------
    this.add.text(40, 222, 'Color', { fontSize: '13px', color: '#cbb8d6' });
    this.createColorSwatchRow(this.logoPalette, 40, 240, (color) => {
      this.logoColor = color;
      this.updatePreview();
    }, this.logoColor);

    // ---- continue button ------------------------------------------------
    const button = this.add.rectangle(420, 300, 80, 32, 0x5dcaa5).setInteractive({ useHandCursor: true });
    this.add.text(420, 300, 'Continue', { fontSize: '13px', color: '#0a2b22' }).setOrigin(0.5);
    this.confirmText = this.add.text(420, 322, '', { fontSize: '11px', color: '#9fe1cb' }).setOrigin(0.5);
    button.on('pointerdown', () => this.confirmShop());

    // The DOM input lives outside Phaser's normal display list cleanup, so
    // remove it by hand when leaving this scene.
    this.events.on('shutdown', () => {
      if (this.nameInputElement && this.nameInputElement.parentNode) {
        this.nameInputElement.parentNode.removeChild(this.nameInputElement);
      }
    });
  }

  updatePreview() {
    dbwDrawIcon(this.previewGraphics, this.logoType, 64, this.logoColor);
    this.nameLiveText.setText(this.shopName || 'Your Shop Name');
  }

  createColorSwatchRow(palette, x, y, onSelect, currentColor) {
    const size = 24;
    const gap = 6;
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

      if (color === currentColor) {
        highlight.setPosition(sx, sy).setVisible(true);
      }
    });
  }

  confirmShop() {
    const name = (this.shopName || '').trim() || 'My Coffee Shop';
    const data = { name, logoType: this.logoType, logoColor: this.logoColor };

    try {
      localStorage.setItem('dbw_shop', JSON.stringify(data));
      this.confirmText.setText('Saved!');
    } catch (e) {
      this.confirmText.setText('Could not save :(');
    }

    console.log('Shop created:', data);
    this.time.delayedCall(500, () => this.scene.start('ShopFloor'));
  }

  loadSavedShop() {
    const defaults = { name: '', logoType: 'cup', logoColor: 0xc9a24f };
    try {
      const raw = localStorage.getItem('dbw_shop');
      if (!raw) return defaults;
      const parsed = JSON.parse(raw);
      return {
        name: parsed.name ?? defaults.name,
        logoType: parsed.logoType ?? defaults.logoType,
        logoColor: parsed.logoColor ?? defaults.logoColor
      };
    } catch (e) {
      return defaults;
    }
  }
}
