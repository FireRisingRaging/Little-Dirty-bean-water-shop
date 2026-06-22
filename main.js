// Phaser game configuration.
// As you build more screens (shop branding, the shop floor, the backyard plot),
// create a new Scene class per screen and add it to the `scene` array below.
// Phaser will only run the first scene on boot; others start via scene.start('Key').

const config = {
  type: Phaser.AUTO,
  width: 480,
  height: 360,
  parent: 'game-container',
  backgroundColor: '#2b2230',
  pixelArt: true, // keeps edges crisp/blocky instead of blurry — important once you add real sprite art
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: [CharacterCreatorScene]
};

const game = new Phaser.Game(config);
