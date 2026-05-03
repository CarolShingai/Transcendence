// entities/HarpiaGroup.js
// Grupo de harpias: caem de cima para baixo como obstáculos.

class HarpiaGroup {

  constructor(scene) {
    this.scene = scene;
    this.group = scene.physics.add.group();
    this.baseSpeed = OBSTACLES_CONFIG.baseSpeed;
    this._spawnTimer = 0;
    this._spawnDelay = OBSTACLES_CONFIG.spawnDelay;
    this._active = true;
    this.target = null; // Player (Tyrannus) para rastreamento
    this.trackingDelay = 1000; // Tempo em ms antes de rastrear
  }

  // ── Spawn ───────────────────────────────────────────────────────────────

  spawn(sceneWidth) {
    // Não spawna se já tem muitas harpias
    if (this.group.getChildren().length >= OBSTACLES_CONFIG.maxHarpias) {
      return;
    }

    const x = Phaser.Math.Between(60, sceneWidth - 60);

    // Sprite da harpia (aparece no topo fora da tela)
    const sprite = this.group.create(x, -60, 'harpia');
    sprite.setDepth(8);
    sprite.setScale(0.7);
    sprite.setCollideWorldBounds(false);
    
    // Adiciona rastreamento de tempo
    sprite.createdAt = Date.now();
    sprite.isTracking = false;

    this._applyBehavior(sprite);

    return sprite;
  }

  // ── Comportamento ───────────────────────────────────────────────────────

  _applyBehavior(sprite) {
    const speedY = this.baseSpeed + Phaser.Math.Between(-30, 40);

    sprite.setVelocity(0, speedY);
    sprite.setAngularVelocity(Phaser.Math.Between(0, 0)); // Gira enquanto cai
  }

  // ── Update: Controla spawn, rastreamento e limpeza ───────────────────────

  update(delta, sceneHeight) {
    // Não spawna novas harpias se inativo
    if (this._active) {
      // Timer para spawn de novas harpias
      this._spawnTimer += delta;
      if (this._spawnTimer >= this._spawnDelay) {
        this._spawnTimer = 0;
        this.spawn(this.scene.scale.width);
      }
    }

    // Atualiza rastreamento e limpeza
    this.group.getChildren().forEach((harpia) => {
      // Verifica se é hora de começar a rastrear o player
      if (this.target && !harpia.isTracking) {
        const elapsed = Date.now() - harpia.createdAt;
        if (elapsed >= this.trackingDelay) {
          harpia.isTracking = true;
        }
      }
      
      // Se está rastreando, move em direção ao player (mas continua caindo)
      if (harpia.isTracking && this.target) {
        const dx = this.target.sprite.x - harpia.x;
        const dy = this.target.sprite.y - harpia.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
          const speedTowardPlayer = 150; // Velocidade de rastreamento horizontal
          // Movimento horizontal em direção ao player
          const vx = (dx / distance) * speedTowardPlayer;
          // Movimento vertical: sempre desce
          // Se player está abaixo, cai mais rápido; se acima, cai normalmente
          let vy = this.baseSpeed;
          if (dy > 0) {
            vy += (dy / distance) * speedTowardPlayer;
          }
          harpia.setVelocity(vx, vy);
        }
      }
      
      // Remove harpias que saíram completamente da tela
      if (harpia.y > sceneHeight + 100) {
        harpia.destroy();
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
    this.group.children.entries.forEach(harpia => {
      harpia.setVelocity(0, 0);
      harpia.setAcceleration(0, 0);
    });
  }

  setTarget(target) {
    this.target = target;
  }
}