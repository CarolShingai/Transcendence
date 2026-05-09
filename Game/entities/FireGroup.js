// entities/FireGroup.js
// Grupo de fogo: aparece lateralmente como obstáculos.

class FireGroup {

  constructor(scene) {
    this.scene = scene;
    this.group = scene.physics.add.group();
    this.baseSpeed = OBSTACLES_CONFIG.baseSpeed;
    this._spawnTimer = 0;
    this._spawnDelay = OBSTACLES_CONFIG.fireSpawnDelay || 8000; // Spawn a cada 8 segundos
    this._active = true;
  }

  // ── Spawn ───────────────────────────────────────────────────────────────

  spawn(sceneWidth, sceneHeight) {
    // Não spawna se já tem muito fogo
    if (this.group.getChildren().length >= (OBSTACLES_CONFIG.maxFires || 3)) {
      return;
    }

    // Spawna do topo e desce na tela
    const x = Phaser.Math.Between(60, sceneWidth - 60);
    const y = -60;

    // Sprite do fogo
    const sprite = this.group.create(x, y, 'fire');
    sprite.setDepth(8);
    sprite.setScale(0.8);
    sprite.setCollideWorldBounds(false);

    this._applyBehavior(sprite);

    return sprite;
  }

  // ── Comportamento ───────────────────────────────────────────────────────

  _applyBehavior(sprite) {
    const speedY = this.baseSpeed + Phaser.Math.Between(-20, 30);

    sprite.setVelocity(0, speedY);
    sprite.setAngularVelocity(Phaser.Math.Between(-1, 1)); // Gira lentamente
  }

  // ── Update: Controla spawn e limpeza ─────────────────────────────────────

  update(delta, sceneHeight, sceneWidth) {
    // Não spawna novo fogo se inativo
    if (this._active) {
      // Timer para spawn de novo fogo
      this._spawnTimer += delta;
      if (this._spawnTimer >= this._spawnDelay) {
        this._spawnTimer = 0;
        this.spawn(sceneWidth, sceneHeight);
      }
    }

    // Remove fogo que saiu completamente da tela
    this.group.getChildren().forEach((fire) => {
      if (fire.y > sceneHeight + 100) {
        fire.destroy();
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
    this.group.children.entries.forEach(fire => {
      fire.setVelocity(0, 0);
      fire.setAcceleration(0, 0);
    });
  }
}
