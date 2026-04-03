// /home/babischa/Transcendence/Game/entities/Tyrannus.js
// Jogador Tyrannus-savana: movimento em X e Y com animação de asa.

class Tyrannus {

  static SPEED         = 300;
  static SPEED_DEFAULT = 300;

  constructor(scene, x, y) {
    this.scene = scene;
    this.alive = false; // inicia falso; ativado em activate()

    // Animação de asa
    this._wingTimer    = 0;
    this._wingInterval = 160;
    this._wingFrame    = 0;

    // Sprite do Tyrannus
    this.sprite = scene.physics.add.image(x, y, 'tyrannus');
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
      this.sprite.setTexture(this._wingFrame === 0 ? 'tyrannus' : 'tyrannus2');
    }
  }
}