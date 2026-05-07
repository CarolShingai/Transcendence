// Cena do Menu: permite escolher entre as fases disponíveis

class MenuScene extends Phaser.Scene {

  constructor() { super('MenuScene'); }

  preload() {
    // Carrega as imagens do Tyrannus para o menu
    this.load.image('tyrannus', 'assets/images/tyrannus1.png');
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    // Fundo
    this.cameras.main.setBackgroundColor('#1a3a2a');

    // Título
    this.add.text(W / 2, 80, 'Aves Migratórias', {
      fontSize: '48px',
      fill: '#90EE90',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(W / 2, 150, 'SELECIONE UMA FASE', {
      fontSize: '24px',
      fill: '#fff'
    }).setOrigin(0.5);

    // Botão Fase 1 (AmazonasScene)
    const btn1 = this.add.rectangle(W / 2 - 150, 300, 200, 60, 0x2a5a3a)
      .setInteractive()
      .on('pointerover', () => {
        btn1.setFillStyle(0x3a7a4a);
        textBtn1.setFill('#ffff00');
      })
      .on('pointerout', () => {
        btn1.setFillStyle(0x2a5a3a);
        textBtn1.setFill('#fff');
      })
      .on('pointerdown', () => {
        this.scene.start('AmazonasScene');
      });

    const textBtn1 = this.add.text(W / 2 - 150, 300, 'FASE 1:\nAMAZONAS', {
      fontSize: '20px',
      fill: '#fff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Botão Fase 2 (CerradoScene)
    const btn2 = this.add.rectangle(W / 2 + 150, 300, 200, 60, 0xc9a961)
      .setInteractive()
      .on('pointerover', () => {
        btn2.setFillStyle(0xd9b971);
        textBtn2.setFill('#000');
      })
      .on('pointerout', () => {
        btn2.setFillStyle(0xc9a961);
        textBtn2.setFill('#fff');
      })
      .on('pointerdown', () => {
        this.scene.start('CerradoScene');
      });

    const textBtn2 = this.add.text(W / 2 + 150, 300, 'FASE 2:\nCERRADO', {
      fontSize: '20px',
      fill: '#fff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Botão Fase 3 (GameScene - Mata Atlântica)
    const btn3 = this.add.rectangle(W / 2, 380, 200, 60, 0x419169)
      .setInteractive()
      .on('pointerover', () => {
        btn3.setFillStyle(0x52a876);
        textBtn3.setFill('#ffff00');
      })
      .on('pointerout', () => {
        btn3.setFillStyle(0x419169);
        textBtn3.setFill('#fff');
      })
      .on('pointerdown', () => {
        this.scene.start('GameScene');
      });

    const textBtn3 = this.add.text(W / 2, 380, 'FASE 3:\nMATA ATLÂNTICA', {
      fontSize: '20px',
      fill: '#fff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Texto de instruções
    this.add.text(W / 2, H - 50, 'Use o mouse para selecionar a fase', {
      fontSize: '14px',
      fill: '#aaa'
    }).setOrigin(0.5);
  }
}
