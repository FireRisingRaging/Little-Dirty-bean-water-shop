// Shared top-down movement & tile-map helpers, used by ShopFloorScene and
// BackyardScene (and any future room). Maps are defined as arrays of equal-
// length strings — one character per tile — which is the simplest thing
// that works for a hand-placed prototype layout. If you later build real
// maps in Tiled, you'd replace dbwBuildMapFromRows's input with parsed
// Tiled JSON; everything downstream (collision, rendering, player
// movement) only cares about the { tiles, walls, cols, rows } shape this
// returns, so the rest of the code wouldn't need to change.

const DBW_TILE_SIZE = 32;

// wallChars: which characters in the map should block movement.
function dbwBuildMapFromRows(rows, wallChars = ['#']) {
  const tiles = rows.map((r) => r.split(''));
  const walls = [];

  for (let row = 0; row < tiles.length; row++) {
    for (let col = 0; col < tiles[row].length; col++) {
      if (wallChars.includes(tiles[row][col])) {
        walls.push({
          x: col * DBW_TILE_SIZE,
          y: row * DBW_TILE_SIZE,
          w: DBW_TILE_SIZE,
          h: DBW_TILE_SIZE
        });
      }
    }
  }

  return { tiles, walls, cols: tiles[0].length, rows: tiles.length };
}

function dbwRectsOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

// Draws every tile as a flat-colored square. colorForChar(ch) -> hex color.
function dbwDrawTileMap(scene, map, colorForChar) {
  const g = scene.add.graphics();
  for (let row = 0; row < map.rows; row++) {
    for (let col = 0; col < map.cols; col++) {
      g.fillStyle(colorForChar(map.tiles[row][col]), 1);
      g.fillRect(col * DBW_TILE_SIZE, row * DBW_TILE_SIZE, DBW_TILE_SIZE, DBW_TILE_SIZE);
    }
  }
  return g;
}

// Finds the pixel rect of the first tile matching targetChar (used for doors).
function dbwFindTileRect(map, targetChar) {
  for (let row = 0; row < map.rows; row++) {
    for (let col = 0; col < map.cols; col++) {
      if (map.tiles[row][col] === targetChar) {
        return {
          x: col * DBW_TILE_SIZE,
          y: row * DBW_TILE_SIZE,
          w: DBW_TILE_SIZE,
          h: DBW_TILE_SIZE
        };
      }
    }
  }
  return { x: -1000, y: -1000, w: 1, h: 1 }; // far offscreen if not found
}

// Builds a bounding rect covering the walkable tiles directly below every
// occurrence of targetChar — used for "stand in front of the counter" zones.
function dbwBuildAdjacentZone(map, targetChar) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  for (let row = 0; row < map.rows; row++) {
    for (let col = 0; col < map.cols; col++) {
      if (map.tiles[row][col] !== targetChar) continue;
      const belowRow = row + 1;
      if (map.tiles[belowRow] && map.tiles[belowRow][col] !== '#') {
        minX = Math.min(minX, col * DBW_TILE_SIZE);
        maxX = Math.max(maxX, (col + 1) * DBW_TILE_SIZE);
        minY = Math.min(minY, belowRow * DBW_TILE_SIZE);
        maxY = Math.max(maxY, (belowRow + 1) * DBW_TILE_SIZE);
      }
    }
  }

  if (minX === Infinity) return { x: -1000, y: -1000, w: 1, h: 1 };
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}

// Creates a walking player: a small container holding the shared character
// art, positioned so (x, y) is the character's feet — that's the point used
// for tile placement and collision, so the sprite's head/shoulders can
// visually overlap things above without affecting movement.
function dbwCreateTopDownPlayer(scene, x, y, hairColor, clothesColor) {
  const container = scene.add.container(x, y);
  const art = scene.add.graphics();
  const scale = 0.27;

  dbwDrawCharacterArt(art, hairColor, clothesColor);
  art.setScale(scale);
  art.setY(-90 * scale); // shift up so the character's feet sit at local y=0

  container.add(art);
  container.hitW = 18; // collision box is much smaller than the sprite —
  container.hitH = 12; // a "feet" hitbox, the standard top-down RPG trick
  return container;
}

// Registers arrow keys + WASD + E (interact) on the scene as scene.dbwKeys
// and scene.dbwInteractKey.
function dbwSetupMovementKeys(scene) {
  const cursors = scene.input.keyboard.createCursorKeys();
  const wasd = scene.input.keyboard.addKeys('W,A,S,D');
  scene.dbwKeys = {
    left: cursors.left, right: cursors.right, up: cursors.up, down: cursors.down,
    a: wasd.A, d: wasd.D, w: wasd.W, s: wasd.S
  };
  scene.dbwInteractKey = scene.input.keyboard.addKey('E');
}

// Moves the player according to scene.dbwKeys, sliding along walls instead
// of stopping dead when only one axis is blocked.
function dbwMovePlayer(scene, player, walls, speed) {
  const dt = scene.game.loop.delta / 1000;
  const k = scene.dbwKeys;
  let dx = 0, dy = 0;

  if (k.left.isDown || k.a.isDown) dx -= 1;
  if (k.right.isDown || k.d.isDown) dx += 1;
  if (k.up.isDown || k.w.isDown) dy -= 1;
  if (k.down.isDown || k.s.isDown) dy += 1;

  if (dx !== 0 && dy !== 0) {
    dx *= 0.7071;
    dy *= 0.7071;
  }

  const dist = speed * dt;
  const newX = player.x + dx * dist;
  const newY = player.y + dy * dist;

  const hitBoxAt = (x, y) => ({
    x: x - player.hitW / 2,
    y: y - player.hitH / 2,
    w: player.hitW,
    h: player.hitH
  });
  const blocked = (box) => walls.some((wall) => dbwRectsOverlap(box, wall));

  if (!blocked(hitBoxAt(newX, player.y))) player.x = newX;
  if (!blocked(hitBoxAt(player.x, newY))) player.y = newY;
}
