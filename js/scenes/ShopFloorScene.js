// ShopFloorScene
//
// The shop's interior. # = wall, C = counter (solid), D = door to the
// backyard, . = floor. Walk into the door to go outside; stand next to the
// counter and press E for a placeholder order popup (the real ordering
// system comes later).

class ShopFloorScene extends Phaser.Scene {
  constructor() {
    super('ShopFloor');
  }

  init(data) {
    this.spawnFrom = (data && data.spawn) || null;
  }

  create() {
    const rows = [
      '###############',
      '#.............#',
      '#.............#',
      '#....CCCC.....#',
      '#.............#',
      '#.............#',
      '#.............#',
      '#.............#',
      '#.............#',
      '#.............#',
      '######D########'
    ];
    this.map = dbwBuildMapFromRows(rows, ['#', 'C']);

    dbwDrawTileMap(this, this.map, (ch) => {
      if (ch === '#') return 0x2a2230;
      if (ch === 'C') return 0x6b4f3a;
      if (ch === 'D') return 0x4a3d2a;
      return 0x4a4258; // floor
    });

    const character = this.loadCharacter();
    const spawn = this.spawnFrom === 'fromBackyard'
      ? { x: 7 * DBW_TILE_SIZE + 16, y: 8 * DBW_TILE_SIZE + 16 }
      : { x: 7 * DBW_TILE_SIZE + 16, y: 5 * DBW_TILE_SIZE + 16 };

    this.player = dbwCreateTopDownPlayer(this, spawn.x, spawn.y, character.hairColor, character.clothesColor);
    dbwSetupMovementKeys(this);

    this.doorRect = dbwFindTileRect(this.map, 'D');
    this.counterZone = dbwBuildAdjacentZone(this.map, 'C');

    this.hintText = this.add.text(8, 336, '', { fontSize: '11px', color: '#cbb8d6' });
    this.popup = this.add.text(240, 16, '', {
      fontSize: '12px',
      color: '#f2ece4',
      backgroundColor: '#1f1a26cc',
      padding: { x: 8, y: 4 }
    }).setOrigin(0.5, 0).setVisible(false);
  }

  update() {
    dbwMovePlayer(this, this.player, this.map.walls, 110);

    const feet = {
      x: this.player.x - this.player.hitW / 2,
      y: this.player.y - this.player.hitH / 2,
      w: this.player.hitW,
      h: this.player.hitH
    };

    if (dbwRectsOverlap(feet, this.doorRect)) {
      this.scene.start('Backyard', { spawn: 'fromShop' });
      return;
    }

    const nearCounter = dbwRectsOverlap(feet, this.counterZone);
    this.hintText.setText(nearCounter ? 'Press E at the counter' : '');

    if (nearCounter && Phaser.Input.Keyboard.JustDown(this.dbwInteractKey)) {
      this.showPopup('No orders yet — the customer system is coming soon!');
    }
  }

  showPopup(msg) {
    this.popup.setText(msg).setVisible(true);
    if (this.popupTimer) this.popupTimer.remove();
    this.popupTimer = this.time.delayedCall(1800, () => this.popup.setVisible(false));
  }

  loadCharacter() {
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
