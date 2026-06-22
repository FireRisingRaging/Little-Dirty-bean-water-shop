// BackyardScene
//
// The planting yard out back. P = soil plot (walkable, future planting
// spots), D = door back into the shop. Standing on a plot and pressing E
// shows a placeholder for now — the seed/growing system comes later.

class BackyardScene extends Phaser.Scene {
  constructor() {
    super('Backyard');
  }

  init(data) {
    this.spawnFrom = (data && data.spawn) || null;
  }

  create() {
    const rows = [
      '###############',
      '#.............#',
      '#..PPP..PPP...#',
      '#..PPP..PPP...#',
      '#..PPP..PPP...#',
      '#.............#',
      '#.............#',
      '#.............#',
      '#.............#',
      '#.............#',
      '######D########'
    ];
    this.map = dbwBuildMapFromRows(rows, ['#']);

    dbwDrawTileMap(this, this.map, (ch) => {
      if (ch === '#') return 0x1f2a1f;
      if (ch === 'P') return 0x4a3324;
      if (ch === 'D') return 0x4a3d2a;
      return 0x3a5a3a; // grass
    });

    const character = this.loadCharacter();
    const spawn = this.spawnFrom === 'fromShop'
      ? { x: 7 * DBW_TILE_SIZE + 16, y: 1 * DBW_TILE_SIZE + 16 }
      : { x: 7 * DBW_TILE_SIZE + 16, y: 5 * DBW_TILE_SIZE + 16 };

    this.player = dbwCreateTopDownPlayer(this, spawn.x, spawn.y, character.hairColor, character.clothesColor);
    dbwSetupMovementKeys(this);

    this.doorRect = dbwFindTileRect(this.map, 'D');

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
      this.scene.start('ShopFloor', { spawn: 'fromBackyard' });
      return;
    }

    const col = Math.floor(this.player.x / DBW_TILE_SIZE);
    const row = Math.floor(this.player.y / DBW_TILE_SIZE);
    const onPlot = this.map.tiles[row] && this.map.tiles[row][col] === 'P';
    this.hintText.setText(onPlot ? 'Press E to check this plot' : '');

    if (onPlot && Phaser.Input.Keyboard.JustDown(this.dbwInteractKey)) {
      this.showPopup('Empty plot — planting system coming soon!');
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
