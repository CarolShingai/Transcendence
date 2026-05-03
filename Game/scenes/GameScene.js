// Cena principal: seu Tyrannus se movendo e desviando de harpias.

class GameScene extends Phaser.Scene {

  constructor() { super('GameScene'); }

  // ── Ciclo de vida ─────────────────────────────────────────────────────────

  preload() {
    // Carrega as imagens do Tyrannus
    this.load.image('tyrannus', 'assets/images/tyrannus1.png');
    this.load.image('tyrannus2', 'assets/images/tyrannus2.png');
    
    // Carrega a imagem da harpia
    this.load.image('harpia', 'assets/images/harpia.png');
    
    // Carrega a imagem do carcará
    this.load.image('carcara', 'assets/images/carcara.png');
    
    // Carrega a imagem da libelula (power-up de escudo)
    this.load.image('libelula', 'assets/images/libelula.png');
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    // Cria o Tyrannus no centro da tela
    this._tyrannus = new Tyrannus(this, W / 2, H / 2);
    
    // Cria o grupo de harpias
    this._harpias = new HarpiaGroup(this);
    this._harpias.setTarget(this._tyrannus); // Harpias rastreiam o Tyrannus
    
    // Cria o grupo de carcarás
    this._carcaras = new CarcaraGroup(this);
    
    // Cria o grupo de libelulas (power-ups de escudo)
    this._libelulas = new LibelulaGroup(this);

    // Ativa o personagem (permite movimento)
    this._tyrannus.activate();

    // Fundo simples com cor
    this.cameras.main.setBackgroundColor('#1a3a2a');

    // ── HUD ──────────────────────────────────────────────────────────────

    this._lives = 3;
    this._score = 0;

    this._lifeText = this.add.text(16, 16, `❤️ Vidas: ${this._lives}`, {
      fontSize: '18px',
      fill: '#fff'
    }).setDepth(100);

    this._scoreText = this.add.text(W - 200, 16, `Quilômetros: ${this._score}`, {
      fontSize: '18px',
      fill: '#fff'
    }).setDepth(100);

    this._magnetText = this.add.text(W / 2 - 50, 16, `🧲 Ímã: OFF`, {
      fontSize: '18px',
      fill: '#fff'
    }).setDepth(100);

    // ── Controle de ímã ───────────────────────────────────────────────────────

    this.input.keyboard.on('keydown-M', () => {
      this._tyrannus.magnetActive = !this._tyrannus.magnetActive;
      this._magnetText.setText(`🧲 Ímã: ${this._tyrannus.magnetActive ? 'ON' : 'OFF'}`);
    });

    // ── Colisões ─────────────────────────────────────────────────────────

    this.physics.add.overlap(
      this._tyrannus.sprite,
      this._harpias.getGroup(),
      this._hitByHarpia,
      null,
      this
    );

    this.physics.add.overlap(
      this._tyrannus.sprite,
      this._carcaras.getGroup(),
      this._hitByCarcara,
      null,
      this
    );

    this.physics.add.overlap(
      this._tyrannus.sprite,
      this._libelulas.getGroup(),
      this._collectLibelula,
      null,
      this
    );
  }

  update(_time, delta) {
    // Atualiza o Tyrannus a cada frame
    this._tyrannus.update(delta);

    // Atualiza as harpias
    this._harpias.update(delta, this.scale.height);

    // Atualiza os carcarás
    this._carcaras.update(delta, this.scale.height);

    // Atualiza as libelulas (passa Tyrannus para aplicar ímã)
    this._libelulas.update(delta, this.scale.width, this.scale.height, this._tyrannus);

    // Aumenta pontos (1 ponto a cada frame enquanto vivo)
    if (this._tyrannus.alive) {
      this._score += 1;
      this._scoreText.setText(`Quilômetros: ${Math.floor(this._score / 60)}`); // Converte para segundos
    }
  }

  // ── Colisão com harpia ───────────────────────────────────────────────────

  _hitByHarpia(tyrannus, harpia) {
    harpia.destroy(); // Remove a harpia
    
    // Se o escudo está ativo, não causa dano
    if (this._tyrannus.shieldActive) {
      return;
    }

    this._lives--;
    this._lifeText.setText(`❤️ Vidas: ${this._lives}`);

    // Flash no Tyrannus quando bate
    this._tyrannus.sprite.setTint(0xff0000);
    this.time.delayedCall(100, () => {
      this._tyrannus.sprite.clearTint();
    });

    if (this._lives <= 0) {
      this._gameOver();
    }
  }

  // ── Colisão com carcará ──────────────────────────────────────────────────

  _hitByCarcara(tyrannus, carcara) {
    carcara.destroy(); // Remove o carcará
    
    // Se o escudo está ativo, não causa dano
    if (this._tyrannus.shieldActive) {
      return;
    }

    this._lives--;
    this._lifeText.setText(`❤️ Vidas: ${this._lives}`);

    // Flash no Tyrannus quando bate
    this._tyrannus.sprite.setTint(0xff0000);
    this.time.delayedCall(100, () => {
      this._tyrannus.sprite.clearTint();
    });

    if (this._lives <= 0) {
      this._gameOver();
    }
  }

  // ── Coleta de Libelula (power-up de escudo) ────────────────────────────────

  _collectLibelula(tyrannus, libelulaSprite) {
    const powerup = this._libelulas.collect(libelulaSprite);
    
    // Ativa o escudo no Tyrannus
    this._tyrannus.activateShield(powerup.duration);
    
    // Efeito visual: pisca o Tyrannus
    this._tyrannus.sprite.setTint(0x00ccff);
    this.time.delayedCall(100, () => {
      this._tyrannus.sprite.clearTint();
    });
  }

  _gameOver() {
    this._tyrannus.alive = false;
    this._tyrannus.sprite.setVelocity(0, 0);
    this._harpias.stop();
    this._carcaras.stop();
    this._libelulas.stop();

    const gameOverText = this.add.text(
      this.scale.width / 2,
      this.scale.height / 2 - 50,
      'GAME OVER',
      {
        fontSize: '64px',
        fill: '#ff0000',
        fontStyle: 'bold'
      }
    ).setOrigin(0.5).setDepth(200);

    this.add.text(
      this.scale.width / 2,
      this.scale.height / 2 + 50,
      `Quilômetros: ${Math.floor(this._score / 60)}`,
      {
        fontSize: '32px',
        fill: '#fff'
      }
    ).setOrigin(0.5).setDepth(200);

    // Botão de restart
    const restartButton = this.add.text(
      this.scale.width / 2,
      this.scale.height / 2 + 120,
      'PRESSIONE ESPAÇO PARA REINICIAR',
      {
        fontSize: '20px',
        fill: '#ffff00',
        fontStyle: 'bold'
      }
    ).setOrigin(0.5).setDepth(200);

    // Fazer piscante
    this.tweens.add({
      targets: [restartButton],
      alpha: 0.3,
      duration: 600,
      yoyo: true,
      repeat: -1
    });

    // Listener para reiniciar
    this.input.keyboard.on('keydown-SPACE', () => {
      this.scene.restart();
    });
  }
}