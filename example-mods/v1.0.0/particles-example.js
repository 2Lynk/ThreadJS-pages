// ============================================================================
// Particles Example Mod
// ============================================================================
// Demonstrates particle effect APIs in ThreadJS
//
// Particle Functions:
//   - spawnParticle       - Spawn particles at a location with spread
//   - spawnParticleCircle - Create a circle of particles
//   - spawnParticleLine   - Draw a line between two points with particles
//
// Commands:
//   /js particleline  - Draw a particle line 10 blocks ahead
//
// This mod showcases:
//   - Welcome particle effects on join
//   - Continuous particle trails (every 5 ticks)
//   - Particle shapes (circles, lines)
//   - Different particle types
// ============================================================================

api.registerMod("particles_example", {
  onInitialize(api) {
    // Event: Player Join
    // Creates a welcome effect with heart particles and a flame circle
    api.onPlayerJoin((player) => {
  // Spawn welcome particles around player
  api.spawnParticle(
    player.x, player.y + 2, player.z,
    player.dimensionId,
    "minecraft:heart",
    20, // count
    0.2, // speed
    1, 1, 1 // offset
  );
  
  // Create particle circle effect
  api.spawnParticleCircle(
    player.x, player.y, player.z,
    player.dimensionId,
    "minecraft:flame",
    3, // radius
    30 // points
  );
});

// Event: Player Tick
// Creates a smoke trail effect (throttled to every 5 ticks)
api.onPlayerTick((player) => {
  if (player.tick % 5 === 0) { // Every 5 ticks
    // Check if sprinting (you'd need to implement this check)
    api.spawnParticle(
      player.x, player.y, player.z,
      player.dimensionId,
      "minecraft:smoke",
      3,
      0.1,
      0.2, 0.2, 0.2
    );
  }
});

// Command: /js particleline
// Description: Draw a particle line from your position 10 blocks forward
// Demonstrates: spawnParticleLine with end_rod particles
api.registerCommand("particleline", (ctx, args) => {
  if (!ctx.player) return;
  
  const player = ctx.player;
  // Draw line from player to 10 blocks ahead
  api.spawnParticleLine(
    player.x, player.y + 1, player.z,
      player.x + 10, player.y + 1, player.z,
      player.dimensionId,
      "minecraft:end_rod",
      20 // density
    );
    
    api.sendMessageTo(player.name, "Particle line spawned!");
  });
  }
});
