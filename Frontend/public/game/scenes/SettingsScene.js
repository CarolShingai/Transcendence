class SettingsScene extends Phaser.Scene {

  constructor() { super('SettingsScene'); }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    // Fundo
    this.cameras.main.setBackgroundColor('#1a3a2a');

    // Título
    this.add.text(W / 2, 80, 'Configurações', {
      fontSize: '48px',
      fill: '#90EE90',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // --- Adicione suas configurações aqui ---

    // Botão Voltar (canto inferior esquerdo)
    const btnVoltar = this.add.rectangle(80, H - 40, 140, 50, 0x2a5a3a)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => {
        btnVoltar.setFillStyle(0x3a7a4a);
        textVoltar.setFill('#ffff00');
      })
      .on('pointerout', () => {
        btnVoltar.setFillStyle(0x2a5a3a);
        textVoltar.setFill('#fff');
      })
      .on('pointerdown', () => {
        this.scene.start('MenuScene');
      });

    const textVoltar = this.add.text(80, H - 40, '← VOLTAR', {
      fontSize: '20px',
      fill: '#fff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
  }
}