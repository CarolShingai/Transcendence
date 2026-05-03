// entities/LibelulaGroup.js
// Gerencia Libelulas como power-ups de escudo temporário

class LibelulaGroup {
  
  static SPAWN_INTERVAL = 8000; // Spawna a cada 8 segundos
  static SHIELD_DURATION = 5000; // Escudo dura 5 segundos

  constructor(scene) {
    this.scene = scene;
    this.group = scene.physics.add.group();
    this.spawnTimer = 0;
    this.spawnInterval = LibelulaGroup.SPAWN_INTERVAL;
  }

  // ── Update: Spawn e movimento ──────────────────────────────────────────────

  update(delta, sceneWidth, sceneHeight, tyrannus = null) {
    // Spawna nova Libelula periodicamente
    this.spawnTimer += delta;
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0;
      this.spawn(sceneWidth);
    }

    // Atrai libelulas para o ímã do Tyrannus
    // if (tyrannus && tyrannus.magnetActive) {
    //   this._applyMagnetism(tyrannus);
    // }

    // Remove Libelulas fora da tela
    this.group.getChildren().forEach((libelula) => {
      if (libelula.y > sceneHeight + 40) {
        libelula.destroy();
      }
    });
  }

//   // ── Ímã: atrai libelulas para o Tyrannus ───────────────────────────────────

//   _applyMagnetism(tyrannus) {
//     const tx = tyrannus.sprite.x;
//     const ty = tyrannus.sprite.y;
//     const magnetRadius = tyrannus.magnetRadius;

//     this.group.getChildren().forEach((libelula) => {
//       const dx = tx - libelula.x;
//       const dy = ty - libelula.y;
//       const dist = Math.sqrt(dx * dx + dy * dy);

//       if (dist < magnetRadius) {
//         // Quanto mais perto, mais forte a atração
//         const force = Phaser.Math.Clamp((magnetRadius - dist) / magnetRadius, 0, 1) * 300;
//         if (dist > 0) {
//           libelula.setVelocity((dx / dist) * force, (dy / dist) * force);
//         }
//       }
//     });
//   }

  // ── Spawn: cria uma nova Libelula em posição aleatória ─────────────────────

  spawn(sceneWidth) {
    const x = Phaser.Math.Between(40, sceneWidth - 40);
    const libelula = this.group.create(x, -30, 'libelula');

    libelula.setDepth(9);
    libelula.setVelocityY(100); // Desce lentamente
    libelula.setPushable(false);
    
    // Rotação contínua para parecer voando
    this.scene.tweens.add({
      targets: libelula,
      angle: 360,
      duration: 1500,
      repeat: -1,
    });

    // Movimento ondulante (esquerda-direita)
    this.scene.tweens.add({
      targets: libelula,
      x: libelula.x + Phaser.Math.Between(-80, 80),
      duration: 2000,
      yoyo: true,
      repeat: -1,
    });

    // Pulso de escala para chamar atenção
    this.scene.tweens.add({
      targets: libelula,
      scaleX: 1.3,
      scaleY: 1.3,
      duration: 600,
      yoyo: true,
      repeat: -1,
    });

    return libelula;
  }

  // ── Coleta: ativa o escudo quando Libelula é coletada ─────────────────────

  collect(libelulaSprite) {
    libelulaSprite.destroy();
    return { type: 'shield', duration: LibelulaGroup.SHIELD_DURATION };
  }

  // ── Efeito visual: burst ao coletar ────────────────────────────────────────

  _burstEffect(x, y) {
    // Sem efeito visual
  }

  getGroup() {
    return this.group;
  }

  stop() {
    this.group.clear(true);
  }
}
