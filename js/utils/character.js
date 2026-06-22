// Shared character art. Draws a simple block-built figure — hair, head,
// eyes, shirt, arms, pants, shoes — centered on local (0,0), spanning
// roughly x: -60..60, y: -90..90. Used by the character creator preview
// and by the walking player sprite in the shop/backyard scenes.
//
// This is a stand-in for real pixel art. When you have a sprite sheet,
// every caller of dbwDrawCharacterArt swaps to `scene.add.sprite(...)`
// instead — nothing else in those scenes needs to change.

function dbwDrawCharacterArt(g, hairColor, clothesColor) {
  const skin = 0xf1c6a0;
  const dark = 0x231d28;
  const pantsColor = dbwShadeColor(clothesColor, -0.25);

  g.clear();

  // hair (top + side flaps, drawn first so the head can sit on top of it)
  g.fillStyle(hairColor, 1);
  g.fillRect(-48, -90, 96, 28);
  g.fillRect(-48, -74, 16, 48);
  g.fillRect(32, -74, 16, 48);

  // head/face
  g.fillStyle(skin, 1);
  g.fillRect(-32, -74, 64, 56);

  // eyes
  g.fillStyle(dark, 1);
  g.fillRect(-20, -50, 12, 12);
  g.fillRect(8, -50, 12, 12);

  // shirt/apron
  g.fillStyle(clothesColor, 1);
  g.fillRect(-44, -18, 88, 56);

  // arms
  g.fillStyle(skin, 1);
  g.fillRect(-60, -14, 16, 44);
  g.fillRect(44, -14, 16, 44);

  // pants (a darker shade of the clothes color, so one choice still reads as an outfit)
  g.fillStyle(pantsColor, 1);
  g.fillRect(-32, 38, 64, 40);

  // shoes
  g.fillStyle(dark, 1);
  g.fillRect(-32, 78, 32, 12);
  g.fillRect(0, 78, 32, 12);
}

// Darkens (negative amount) or lightens (positive amount) a hex color.
// amount is a fraction, e.g. -0.25 darkens by 25%.
function dbwShadeColor(hex, amount) {
  const r = (hex >> 16) & 0xff;
  const g = (hex >> 8) & 0xff;
  const b = hex & 0xff;
  const adjust = (c) => Phaser.Math.Clamp(Math.round(c * (1 + amount)), 0, 255);
  return (adjust(r) << 16) | (adjust(g) << 8) | adjust(b);
}
