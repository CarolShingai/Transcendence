// /home/babischa/Transcendence/Game/scenes/GameScene.js
// Cena principal: seu Tyrannus se movendo pela tela.

class GameScene extends Phaser.Scene {

  constructor() { super('GameScene'); }

  // ── Ciclo de vida ─────────────────────────────────────────────────────────

  preload() {
    // Carrega as imagens do Tyrannus
    this.load.image('tyrannus', 'assets/images/tyrannus1.png');
    this.load.image('tyrannus2', 'assets/images/tyrannus2.png');
  }
  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    // Cria o Tyrannus no centro da tela
    this._tyrannus = new Tyrannus(this, W / 2, H / 2);
    
    // Ativa o personagem (permite movimento)
    this._tyrannus.activate();

    // Fundo simples com cor
    this.cameras.main.setBackgroundColor('#1a3a2a');
  }

  update(_time, delta) {
    // Atualiza o Tyrannus a cada frame
    this._tyrannus.update(delta);
  }
}