// /home/babischa/Transcendence/Game/entities/Tyrannus.js
// Jogador Tyrannus-savana: movimento em X e Y com animação de asa.

class Tyrannus {

  static SPEED         = 300;
  static SPEED_DEFAULT = 300;

  constructor(scene, x, y, baseTexture = 'tyrannus', altTexture = 'tyrannus2') {
    this.scene = scene;
    this.alive = false; // inicia falso; ativado em activate()

    // Animação de asa
    this._wingTimer    = 0;
    this._wingInterval = 160;
    this._wingFrame    = 0;

    // Sistema de escudo
    this.shieldActive   = false;
    this.shieldTimer    = 0;
    this.shieldDuration = 0;
    this.shieldGraphics = null;

    // Sistema de ímã
    this.magnetActive   = false;
    this.magnetRadius   = 200; // Raio de atração do ímã
    this._magnetGraphics = null;

    // Texturas do Tyrannus
    this._baseTexture = baseTexture;
    this._altTexture  = altTexture;

    // Sprite do Tyrannus
    this.sprite = scene.physics.add.image(x, y, this._baseTexture);
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setDepth(10);

    // Controles: teclado + mouse
    this._cursors = scene.input.keyboard.createCursorKeys();
    this._wasd    = scene.input.keyboard.addKeys('W,A,S,D');

    // Movimento com mouse
    scene.input.on('pointermove', (p) => {
      if (!this.alive) return;
      this.sprite.x = Phaser.Math.Clamp(p.x, 32, scene.scale.width  - 32);
      this.sprite.y = Phaser.Math.Clamp(p.y, 52, scene.scale.height - 52);
    });
  }

  // Ativa o personagem
  activate() { this.alive = true; }

  // ── Loop ─────────────────────────────────────────────────────────────────

  update(delta) {
    if (!this.alive) return;

    this._handleMovement();
    this._animateWings(delta);
    this._updateShield(delta);
    this._updateMagnetism(delta);
  }

  // ── Movimento 4 direções ──────────────────────────────────────────────────

  _handleMovement() {
    const left  = this._cursors.left.isDown  || this._wasd.A.isDown;
    const right = this._cursors.right.isDown || this._wasd.D.isDown;
    const up    = this._cursors.up.isDown    || this._wasd.W.isDown;
    const down  = this._cursors.down.isDown  || this._wasd.S.isDown;

    const spd = Tyrannus.SPEED;
    const vx  = left ? -spd : right ? spd : 0;
    const vy  = up   ? -spd : down  ? spd : 0;

    // Normaliza diagonal
    if (vx !== 0 && vy !== 0) {
      const norm = spd / Math.SQRT2;
      this.sprite.setVelocity(vx > 0 ? norm : -norm, vy > 0 ? norm : -norm);
    } else {
      this.sprite.setVelocity(vx, vy);
    }
  }

  // ── Animação de asa (alterna entre 2 frames) ──────────────────────────────

  _animateWings(delta) {
    this._wingTimer += delta;

    if (this._wingTimer >= this._wingInterval) {
      this._wingTimer = 0;
      this._wingFrame = this._wingFrame === 0 ? 1 : 0;
      this.sprite.setTexture(this._wingFrame === 0 ? this._baseTexture : this._altTexture);
    }
  }

  // ── Sistema de escudo ──────────────────────────────────────────────────────

  activateShield(duration) {
    this.shieldActive = true;
    this.shieldTimer = 0;
    this.shieldDuration = duration;
    this._createShieldGraphics();
  }

  // ── Sistema de ímã ─────────────────────────────────────────────────────────

  activateMagnet(duration) {
    this.magnetActive = true;
    this.magnetTimer = 0;
    this.magnetDuration = duration;
  }

  _deactivateMagnet() {
    this.magnetActive = false;
  }

  _updateMagnetism(delta) {
    if (!this.magnetActive) return;

    this.magnetTimer = (this.magnetTimer || 0) + delta;

    // Desfaz o ímã quando tempo expira
    if (this.magnetTimer >= this.magnetDuration) {
      this._deactivateMagnet();
    }
  }

  _updateShield(delta) {
    if (!this.shieldActive) return;

    this.shieldTimer += delta;

    // Redesenha o escudo para acompanhar o Tyrannus
    if (this.shieldGraphics) {
      this.shieldGraphics.clear();
      this.shieldGraphics.lineStyle(3, 0x00ccff, 0.9);
      this.shieldGraphics.strokeCircle(this.sprite.x, this.sprite.y, 55);
    }

    // Desfaz o escudo quando tempo expira
    if (this.shieldTimer >= this.shieldDuration) {
      this._deactivateShield();
    }
  }

  _createShieldGraphics() {
    // Destrói o escudo anterior se existir
    if (this.shieldGraphics) {
      this.scene.tweens.killTweensOf(this.shieldGraphics);
      if (this.shieldGraphics.particleSystem) {
        this.shieldGraphics.particleSystem.destroy();
      }
      this.shieldGraphics.destroy();
    }

    this.shieldGraphics = this.scene.add.graphics().setDepth(8);
    
    // Desenha círculo de escudo
    this.shieldGraphics.lineStyle(3, 0x00ccff, 0.9);
    this.shieldGraphics.strokeCircle(this.sprite.x, this.sprite.y, 55);
  }

  _deactivateShield() {
    this.shieldActive = false;

    if (this.shieldGraphics) {
      // Para todos os tweens associados ao graphics
      this.scene.tweens.killTweensOf(this.shieldGraphics);
      
      // Destrói o graphics
      this.shieldGraphics.destroy();
      this.shieldGraphics = null;
    }
  }
}