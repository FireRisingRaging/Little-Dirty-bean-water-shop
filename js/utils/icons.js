// Shared icon-drawing helpers. These draw simple vector icons onto a Phaser
// Graphics object that's already been positioned with setPosition(), so all
// coordinates here are relative to that object's local (0,0). Reused for the
// shop logo now, and later for things like the bean book or recipe icons.

function dbwDrawIcon(g, type, size, color) {
  g.clear();
  const s = size;

  if (type === 'cup') {
    g.fillStyle(color, 1);
    g.fillRoundedRect(-s * 0.35, -s * 0.25, s * 0.7, s * 0.5, s * 0.08);
    g.lineStyle(Math.max(2, s * 0.06), color, 1);
    g.beginPath();
    g.arc(s * 0.45, 0, s * 0.18, Phaser.Math.DegToRad(-90), Phaser.Math.DegToRad(90), false);
    g.strokePath();
  } else if (type === 'bean') {
    g.fillStyle(color, 1);
    g.fillEllipse(0, 0, s * 0.55, s * 0.85);
    g.lineStyle(Math.max(2, s * 0.05), 0x000000, 0.35);
    g.beginPath();
    g.moveTo(0, -s * 0.4);
    g.quadraticCurveTo(s * 0.12, 0, 0, s * 0.4);
    g.strokePath();
  } else if (type === 'leaf') {
    g.fillStyle(color, 1);
    g.beginPath();
    g.moveTo(0, -s * 0.45);
    g.quadraticCurveTo(s * 0.4, -s * 0.25, 0, s * 0.45);
    g.quadraticCurveTo(-s * 0.4, -s * 0.25, 0, -s * 0.45);
    g.closePath();
    g.fillPath();
    g.lineStyle(Math.max(1, s * 0.04), 0x000000, 0.3);
    g.beginPath();
    g.moveTo(0, -s * 0.4);
    g.lineTo(0, s * 0.4);
    g.strokePath();
  } else if (type === 'star') {
    dbwDrawStar(g, 5, s * 0.5, s * 0.22, color);
  }
}

function dbwDrawStar(g, points, outerRadius, innerRadius, color) {
  const verts = [];
  const step = Math.PI / points;
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerRadius : innerRadius;
    const a = i * step - Math.PI / 2;
    verts.push({ x: Math.cos(a) * r, y: Math.sin(a) * r });
  }
  g.fillStyle(color, 1);
  g.fillPoints(verts, true);
}
