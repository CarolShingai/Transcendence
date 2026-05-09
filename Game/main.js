// main.js
// Configuração do Phaser e inicialização do jogo.

const GAME_CONFIG = {
  type: Phaser.AUTO,
  width: 900,
  height: 700,
  parent: 'game-container',
  pixelArt: true,
  antialias: false,
  backgroundColor: '#1a3a2a',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false,  // mude para true para ver hitboxes
    },
  },
  scene: [MenuScene, SettingsScene, GameScene, AmazonasScene, CerradoScene, MataatlanticaScene],  // Menu como primeira cena
};

new Phaser.Game(GAME_CONFIG);