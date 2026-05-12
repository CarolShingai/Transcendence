class SettingsScene extends Phaser.Scene {

  constructor() { super('SettingsScene'); }

  preload() {
    this.load.image('tyrannus-green', 'assets/images/tyrannus1.png');
    this.load.image('tyrannus-red',   'assets/images/tyrannus1-red.png');
  }

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

    // Subtítulo
    this.add.text(W / 2, 150, 'SELECIONE SEU PERSONAGEM', {
      fontSize: '24px',
      fill: '#fff'
    }).setOrigin(0.5);

    let currentSkin = localStorage.getItem('selectedTyrannus') || 'green';

    const btnGreen = this.add.image(W / 2 - 110, H / 2, 'tyrannus-green')
      .setDisplaySize(168, 168)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => btnGreen.setAlpha(0.75))
      .on('pointerout',  () => btnGreen.setAlpha(1))
      .on('pointerdown', () => {
        localStorage.setItem('selectedTyrannus', 'green');
        currentSkin = 'green';
        updateSelection();
        console.log('Tyrannus Verde selecionado');
      });

    const btnGreenText = this.add.text(W / 2 - 110, H / 2 + 100, 'Verde', {
      fontSize: '18px',
      fill: '#90EE90'
    }).setOrigin(0.5);

    const btnRed = this.add.image(W / 2 + 110, H / 2, 'tyrannus-red')
      .setDisplaySize(168, 168)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => btnRed.setAlpha(0.75))
      .on('pointerout',  () => btnRed.setAlpha(1))
      .on('pointerdown', () => {
        localStorage.setItem('selectedTyrannus', 'red');
        currentSkin = 'red';
        updateSelection();
        console.log('Tyrannus Vermelho selecionado');
      });

    const btnRedText = this.add.text(W / 2 + 110, H / 2 + 100, 'Vermelho', {
      fontSize: '18px',
      fill: '#ff6666'
    }).setOrigin(0.5);

    const selectionText = this.add.text(W / 2, H / 2 + 170, '', {
      fontSize: '20px',
      fill: '#ffff88',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const updateSelection = () => {
      btnGreen.clearTint();
      btnRed.clearTint();
      btnGreen.setAlpha(1);
      btnRed.setAlpha(1);

      if (currentSkin === 'green') {
        btnGreen.setTint(0x88ff88);
        selectionText.setText('Personagem selecionado: VERDE');
      } else {
        btnRed.setTint(0xff8888);
        selectionText.setText('Personagem selecionado: VERMELHO');
      }
    };

    updateSelection();

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