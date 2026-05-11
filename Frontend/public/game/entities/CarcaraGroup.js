// entities/CarcaraGroup.js
// Grupo de carcarás: caem de cima para baixo como obstáculos.

class CarcaraGroup {

  constructor(scene) {
    this.scene = scene;
    this.group = scene.physics.add.group();
    this.baseSpeed = OBSTACLES_CONFIG.baseSpeed;
    this._spawnTimer = 0;
    this._spawnDelay = OBSTACLES_CONFIG.carcaraSpawnDelay;
    this._active = true;
  }

  // ── Spawn ───────────────────────────────────────────────────────────────

  spawn(sceneWidth) {
    // Não spawna se já tem muitos carcarás
    if (this.group.getChildren().length >= OBSTACLES_CONFIG.maxCarcaras) {
      return;
    }

    const x = Phaser.Math.Between(60, sceneWidth - 60);

    // Sprite do carcará (aparece no topo fora da tela)
    const sprite = this.group.create(x, -60, 'carcara');
    sprite.setDepth(8);
    sprite.setScale(0.7);
    sprite.setCollideWorldBounds(false);

    this._applyBehavior(sprite);

    return sprite;
  }

  // ── Comportamento ───────────────────────────────────────────────────────

  _applyBehavior(sprite) {
    const speedY = this.baseSpeed + Phaser.Math.Between(-30, 40);

    sprite.setVelocity(0, speedY);
    sprite.setAngularVelocity(Phaser.Math.Between(-2, 2)); // Gira enquanto cai
  }

  // ── Update: Controla spawn e limpeza ─────────────────────────────────────

  update(delta, sceneHeight) {
    // Não spawna novos carcarás se inativo
    if (this._active) {
      // Timer para spawn de novos carcarás
      this._spawnTimer += delta;
      if (this._spawnTimer >= this._spawnDelay) {
        this._spawnTimer = 0;
        this.spawn(this.scene.scale.width);
      }
    }

    // Remove carcarás que saíram completamente da tela
    this.group.getChildren().forEach((carcara) => {
      if (carcara.y > sceneHeight + 100) {
        carcara.destroy();
      }
    });
  }

  // ── Getters ──────────────────────────────────────────────────────────────

  getGroup() { 
    return this.group; 
  }

  setBaseSpeed(speed) { 
    this.baseSpeed = speed; 
  }

  setSpawnDelay(delay) { 
    this._spawnDelay = delay; 
  }

  stop() {
    this._active = false;
    this.group.children.entries.forEach(carcara => {
      carcara.setVelocity(0, 0);
      carcara.setAcceleration(0, 0);
    });
  }
}