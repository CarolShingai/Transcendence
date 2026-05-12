// Cena Amazonas: seu Tyrannus se movendo e desviando de carcarás e libelulas (sem harpias).

class AmazonasScene extends Phaser.Scene {

  constructor() { super('AmazonasScene'); }

  // ── Ciclo de vida ─────────────────────────────────────────────────────────

  preload() {
    // Carrega as imagens do Tyrannus para as duas variações de cor
    this.load.image('tyrannus-green', 'assets/images/tyrannus1.png');
    this.load.image('tyrannus2-green', 'assets/images/tyrannus2.png');
    this.load.image('tyrannus-red', 'assets/images/tyrannus1-red.png');
    this.load.image('tyrannus2-red', 'assets/images/tyrannus2-red.png');
    
    // Carrega a imagem do carcará
    this.load.image('carcara', 'assets/images/carcara.png');
    
    // Carrega a imagem da libelula (power-up de escudo)
    this.load.image('libelula', 'assets/images/libelula.png');

    // Carrega a imagem de fundo da Amazônia
    this.load.image('amazonia_bg', 'assets/images/amazonia.png');
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    // ── Sistema de mapa em movimento (scrolling) ──────────────────────────

    // Cria dois fundos empilhados para criar efeito de loop infinito
    this._bg1 = this.add.image(W / 2, 0, 'amazonia_bg')
      .setDisplaySize(W, H)
      .setOrigin(0.5, 0)
      .setDepth(-1);

    this._bg2 = this.add.image(W / 2, -H, 'amazonia_bg')
      .setDisplaySize(W, H)
      .setOrigin(0.5, 0)
      .setDepth(-1);

    this._mapSpeed = 150; // Velocidade do mapa em pixels por segundo

    const selectedSkin = localStorage.getItem('selectedTyrannus') || 'green';
    const tyrannusTexture = selectedSkin === 'red' ? 'tyrannus-red' : 'tyrannus-green';
    const tyrannusTexture2 = selectedSkin === 'red' ? 'tyrannus2-red' : 'tyrannus2-green';

    // Cria o Tyrannus no centro da tela
    this._tyrannus = new Tyrannus(this, W / 2, H / 2, tyrannusTexture, tyrannusTexture2);
    
    // Cria o grupo de carcarás
    this._carcaras = new CarcaraGroup(this);
    
    // Cria o grupo de libelulas (power-ups de escudo)
    this._libelulas = new LibelulaGroup(this);
    
    // Passa as referências para o Tyrannus (para o magnetismo funcionar)
    this._tyrannus.libelulas = this._libelulas;
    
    // Cria o grupo de imãs (power-ups de magnetismo)
    this._imans = new MagnetGroup(this);

    // Ativa o personagem (permite movimento)
    this._tyrannus.activate();

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

    // Texto do nome da fase
    this.add.text(W / 2, H - 20, 'FASE: AMAZONAS', {
      fontSize: '14px',
      fill: '#90EE90'
    }).setOrigin(0.5).setDepth(100);

    // ── Colisões ─────────────────────────────────────────────────────────

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

    // Colisão com imã
    this.physics.add.overlap(
      this._tyrannus.sprite,
      this._imans.getGroup(),
      this._collectMagnet,
      null,
      this
    );
  }

  update(_time, delta) {
    // ── Atualização do mapa em movimento ──────────────────────────────────

    const H = this.scale.height;
    const mapDeltaY = (this._mapSpeed * delta) / 1000; // Converte delta de ms para s

    // Move ambos os fundos para baixo
    this._bg1.y += mapDeltaY;
    this._bg2.y += mapDeltaY;

    // Reseta a posição quando o fundo sair completamente da tela
    if (this._bg1.y >= H) {
      this._bg1.y = this._bg2.y - H;
    }
    if (this._bg2.y >= H) {
      this._bg2.y = this._bg1.y - H;
    }

    // Atualiza o Tyrannus a cada frame
    this._tyrannus.update(delta);

    // Atualiza os carcarás
    this._carcaras.update(delta, this.scale.height);

    // Atualiza as libelulas (passa Tyrannus e magnetGroup para aplicar atração)
    this._libelulas.update(delta, this.scale.width, this.scale.height, this._tyrannus, this._imans);

    // Atualiza os imãs (passa Tyrannus para aplicar efeito de atração)
    this._imans.update(delta, this.scale.width, this.scale.height, this._tyrannus);

    // Aumenta pontos (1 ponto a cada frame enquanto vivo)
    if (this._tyrannus.alive) {
      this._score += 1;
      this._scoreText.setText(`Quilômetros: ${Math.floor(this._score / 60)}`); // Converte para segundos
    }

    // Atualiza HUD de magnetismo
    if (this._tyrannus.magnetActive) {
      const remainingTime = Math.ceil((this._tyrannus.magnetDuration - this._tyrannus.magnetTimer) / 1000);
      this._magnetText.setText(`🧲 Ímã: ${remainingTime}s`);
      this._magnetText.setFill('#ffcc00'); // Amarelo quando ativo
    } else {
      this._magnetText.setText(`🧲 Ímã: OFF`);
      this._magnetText.setFill('#fff');
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

  // ── Coleta de Imã (power-up de magnetismo) ──────────────────────────────────

  _collectMagnet(tyrannus, imanSprite) {
    const powerup = this._imans.collect(imanSprite);
    
    // Ativa o magnetismo no Tyrannus
    this._tyrannus.activateMagnet(powerup.duration);
    
    // Efeito visual: pisca o Tyrannus em amarelo
    this._tyrannus.sprite.setTint(0xffcc00);
    this.time.delayedCall(100, () => {
      this._tyrannus.sprite.clearTint();
    });
  }

  _gameOver() {
    // Para o movimento do mapa
    this._mapSpeed = 0;

    this._tyrannus.alive = false;
    this._tyrannus.sprite.setVelocity(0, 0);
    this._carcaras.stop();
    this._libelulas.stop();
    this._imans.stop();

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


    const durationSeconds = Math.max(1, Math.floor((Date.now() - this._startedAt) / 1000));
    const finalKilometers = Math.floor(this._score / 60);

    window.MatchReporter?.postMatch({
      mapId: 1,
      score: finalKilometers,
      durationSeconds,
      metadata: {
        sceneKey: this.scene.key,
        mapName: 'AMAZONAS'
      }
    });

    // Retorna para o menu após 3 segundos
    this.time.delayedCall(3000, () => {
      this.scene.start('MenuScene');
    });
  }
}