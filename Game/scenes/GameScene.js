// Cena principal: seu Tyrannus se movendo e desviando de harpias.

class GameScene extends Phaser.Scene {

  // Fases disponíveis com nomes
  static PHASES = {
    savana: { name: 'SAVANA', id: 'savana' },
    cerrado: { name: 'CERRADO', id: 'cerrado' },
    mataatlantica: { name: 'MATA ATLÂNTICA', id: 'mataatlantica' },
    amazonas: { name: 'AMAZONAS', id: 'amazonas' }
  };

  constructor() { 
    super('GameScene');
    this._currentPhase = GameScene.PHASES.savana; // Fase padrão
  }

  // ── Gerenciamento de dados de fase ────────────────────────────────────

  static getPhaseData(phaseId) {
    const key = `phase_${phaseId}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : { maxKilometers: 0, attempts: 0 };
  }

  static savePhaseData(phaseId, maxKilometers, attempts) {
    const key = `phase_${phaseId}`;
    const data = { maxKilometers, attempts, lastUpdated: new Date().toISOString() };
    localStorage.setItem(key, JSON.stringify(data));
  }

  static updatePhaseMaxKilometers(phaseId, kilometers) {
    const data = GameScene.getPhaseData(phaseId);
    const newMax = Math.max(data.maxKilometers, kilometers);
    GameScene.savePhaseData(phaseId, newMax, data.attempts + 1);
    return newMax;
  }

  static getAllPhasesData() {
    const allData = {};
    Object.values(GameScene.PHASES).forEach(phase => {
      allData[phase.id] = GameScene.getPhaseData(phase.id);
    });
    return allData;
  }

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
    
    // Passa as referências para o Tyrannus (para o magnetismo funcionar)
    this._tyrannus.libelulas = this._libelulas;
    
    // Cria o grupo de imãs (power-ups de magnetismo)
    this._imans = new MagnetGroup(this);

    // Ativa o personagem (permite movimento)
    this._tyrannus.activate();

    // Fundo simples com cor
    this.cameras.main.setBackgroundColor('#419169');

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

    // Carrega dados da fase atual
    const phaseData = GameScene.getPhaseData(this._currentPhase.id);
    
    // Texto do nome da fase
    this.add.text(W / 2, H - 20, `FASE: ${this._currentPhase.name}`, {
      fontSize: '14px',
      fill: '#90EE90'
    }).setOrigin(0.5).setDepth(100);

    // Texto da quilometragem máxima da fase
    this._maxKilometerText = this.add.text(16, 50, `🏁 Melhor: ${phaseData.maxKilometers} km`, {
      fontSize: '14px',
      fill: '#ffcc00'
    }).setDepth(100);

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
    // Atualiza o Tyrannus a cada frame
    this._tyrannus.update(delta);

    // Atualiza as harpias
    this._harpias.update(delta, this.scale.height);

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
    this._tyrannus.alive = false;
    this._tyrannus.sprite.setVelocity(0, 0);
    this._harpias.stop();
    this._carcaras.stop();
    this._libelulas.stop();
    this._imans.stop();

    // Calcula quilômetros finais
    const finalKilometers = Math.floor(this._score / 60);

    // Atualiza e obtém a quilometragem máxima da fase
    const maxKilometers = GameScene.updatePhaseMaxKilometers(this._currentPhase.id, finalKilometers);

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
      this.scale.height / 2 + 30,
      `Quilômetros: ${finalKilometers} km`,
      {
        fontSize: '32px',
        fill: '#fff'
      }
    ).setOrigin(0.5).setDepth(200);

    // Mostra se bateu recorde
    if (finalKilometers === maxKilometers && finalKilometers > 0) {
      this.add.text(
        this.scale.width / 2,
        this.scale.height / 2 + 100,
        '🏆 NOVO RECORDE! 🏆',
        {
          fontSize: '24px',
          fill: '#ffcc00',
          fontStyle: 'bold'
        }
      ).setOrigin(0.5).setDepth(200);
    }

    // Retorna para o menu após 3 segundos
    this.time.delayedCall(2000, () => {
      this.scene.start('MenuScene');
    });
  }
}