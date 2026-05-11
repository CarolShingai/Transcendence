// entities/MagnetGroup.js
// Gerencia Imãs como power-ups que atraem inimigos para o Tyrannus

class MagnetGroup {
  
  static SPAWN_INTERVAL = 10000; // Spawna a cada 10 segundos
  static MAGNET_DURATION = 6000; // Ímã dura 6 segundos
  static MAGNET_RADIUS = 250;    // Raio de atração do ímã

  constructor(scene) {
    this.scene = scene;
    this.group = scene.physics.add.group();
    this.spawnTimer = 0;
    this.spawnInterval = MagnetGroup.SPAWN_INTERVAL;
    
    // Cria a textura do imã (dinâmica)
    this._createMagnetTexture();
  }

  // ── Criar textura do imã ──────────────────────────────────────────────────

  _createMagnetTexture() {
    const graphics = this.scene.make.graphics({ x: 0, y: 0, add: false });
    
    // Desenha um imã simples com dois polos
    graphics.fillStyle(0xff0000, 1); // Vermelho
    graphics.fillRect(0, 0, 20, 30);
    
    graphics.fillStyle(0x0000ff, 1); // Azul
    graphics.fillRect(20, 0, 20, 30);
    
    graphics.generateTexture('iman', 40, 30);
    graphics.destroy();
  }

  // ── Update: Spawn e movimento ──────────────────────────────────────────────

  update(delta, sceneWidth, sceneHeight, tyrannus = null) {
    // Spawna novo Imã periodicamente
    this.spawnTimer += delta;
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0;
      this.spawn(sceneWidth);
    }

    // Atrai libelulas para o Tyrannus quando magnetismo está ativo
    if (tyrannus && tyrannus.magnetActive) {
      this._applyMagnetism(tyrannus);
    }

    // Remove Imãs fora da tela
    this.group.getChildren().forEach((iman) => {
      if (iman.y > sceneHeight + 40) {
        iman.destroy();
      }
    });
  }

  // ── Ímã: atrai apenas libelulas para o Tyrannus ────────────────────────────

  _applyMagnetism(tyrannus) {
    const tx = tyrannus.sprite.x;
    const ty = tyrannus.sprite.y;
    const magnetRadius = MagnetGroup.MAGNET_RADIUS;

    // Atrai libelulas
    if (tyrannus.libelulas) {
      tyrannus.libelulas.getGroup().getChildren().forEach((libelula) => {
        const dx = tx - libelula.x;
        const dy = ty - libelula.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < magnetRadius && dist > 0) {
          // Quanto mais perto, mais forte a atração (até 600 px/s)
          const force = Phaser.Math.Clamp((magnetRadius - dist) / magnetRadius, 0, 1) * 600;
          libelula.setVelocity((dx / dist) * force, (dy / dist) * force);
        }
      });
    }
  }

  // ── Spawn: cria um novo Imã em posição aleatória ───────────────────────────

  spawn(sceneWidth) {
    const x = Phaser.Math.Between(40, sceneWidth - 40);
    const iman = this.group.create(x, -30, 'iman');

    iman.setDepth(9);
    iman.setVelocityY(90); // Desce lentamente
    iman.setPushable(false);
    
    // Rotação contínua para parecer magnetizado
    this.scene.tweens.add({
      targets: iman,
      angle: 360,
      duration: 1200,
      repeat: -1,
    });

    // Pulso de escala para chamar atenção
    this.scene.tweens.add({
      targets: iman,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 500,
      yoyo: true,
      repeat: -1,
    });

    return iman;
  }

  // ── Coleta: ativa o magnetismo quando Imã é coletado ──────────────────────

  collect(imanSprite) {
    imanSprite.destroy();
    return { type: 'magnet', duration: MagnetGroup.MAGNET_DURATION };
  }

  // ── Efeito visual: burst ao coletar com cor amarela ──────────────────────

  _burstEffect(x, y) {
    const color = 0xffcc00; // Amarelo para imã
    const g = this.scene.add.graphics().setDepth(15);

    g.fillStyle(color, 0.7);
    g.fillCircle(x, y, 20);

    // Cria um efeito de irradiação
    g.lineStyle(2, color, 0.5);
    g.strokeCircle(x, y, 35);

    this.scene.tweens.add({
      targets: g,
      alpha: 0,
      scaleX: 1.5,
      scaleY: 1.5,
      duration: 400,
      onComplete: () => g.destroy(),
    });
  }

  getGroup() {
    return this.group;
  }

  stop() {
    this.group.clear(true);
  }
}
