// ============================================================================
// World Advanced Example Mod
// ============================================================================
// Demonstrates advanced world manipulation: structures, recipes, explosions
//
// Structure Functions:
//   - placeStructure     - Place a Minecraft structure at coordinates
//   - saveStructure      - Save a region as a custom structure
//   - listStructures     - Get available structure templates
//
// Recipe Functions:
//   - addShapedRecipe    - Add a shaped crafting recipe
//   - addShapelessRecipe - Add a shapeless crafting recipe
//   - removeRecipe       - Remove a recipe
//
// World Manipulation:
//   - createExplosion    - Create explosions with configurable power
//   - setBlock          - Place blocks programmatically
//   - getBlock          - Read block at coordinates
//
// Commands:
//   /placestructure <name>            - Place a structure
//   /savestructure <name> <size>      - Save region as structure
//   /customrecipe                     - Add diamond from coal recipe
//   /explode <power>                  - Create explosion at your feet
//   /build_platform                   - Build a 9x9 platform
//
// This mod showcases:
//   - Structure placement and saving
//   - Custom crafting recipes
//   - Controlled explosions
//   - Programmatic building
// ============================================================================

api.registerMod("world_advanced_example", {
  onInitialize(api) {
    // === STRUCTURES ===

    // Place structure at spawn
    api.onServerStart(() => {
  // Place a village house at spawn
  api.placeStructure(
    50, 64, 50,
    "minecraft:overworld",
    "minecraft:village/plains/houses/plains_small_house_1",
    "NONE", // rotation
    "NONE"  // mirror
  );
  
  api.log("Spawn structures placed");
});

// Command to save structure
api.registerCommand("savestructure", (ctx, args) => {
  if (!ctx.player) return;
  
  if (args.length < 7) {
    api.sendMessageTo(ctx.player.name, "§cUsage: /savestructure <name> <x1> <y1> <z1> <x2> <y2> <z2>");
    return;
  }
  
  const name = args[0];
  const x1 = parseInt(args[1]);
  const y1 = parseInt(args[2]);
  const z1 = parseInt(args[3]);
  const x2 = parseInt(args[4]);
  const y2 = parseInt(args[5]);
  const z2 = parseInt(args[6]);
  
  const structureName = api.saveStructure(
    x1, y1, z1,
    x2, y2, z2,
    ctx.player.dimensionId,
    name
  );
  
  api.sendMessageTo(ctx.player.name, `§aStructure saved as: §e${structureName}`);
});

// Command to place saved structure
api.registerCommand("placestructure", (ctx, args) => {
  if (!ctx.player) return;
  
  if (args.length < 1) {
    api.sendMessageTo(ctx.player.name, "§cUsage: /placestructure <name> [rotation] [mirror]");
    return;
  }
  
  const name = args[0];
  const rotation = args[1] || "NONE";
  const mirror = args[2] || "NONE";
  
  api.placeStructure(
    ctx.player.x,
    ctx.player.y,
    ctx.player.z,
    ctx.player.dimensionId,
    name,
    rotation,
    mirror
  );
  
  api.sendMessageTo(ctx.player.name, `§aPlaced structure: §e${name}`);
  api.spawnParticle(
    ctx.player.x, ctx.player.y + 1, ctx.player.z,
    ctx.player.dimensionId,
    "minecraft:totem_of_undying",
    50, 0.5, 2, 2, 2
  );
});

// === CUSTOM RECIPES ===

api.onServerStart(() => {
  // Add custom crafting recipe: Iron ingots -> Diamond
  api.addRecipe(
    "custom_diamond",
    "minecraft:diamond",
    "1",
    '["AAA","ABA","AAA"]',
    '{"A":"minecraft:iron_ingot","B":"minecraft:emerald"}'
  );
  
  // Add another recipe: Sticks -> Golden Apple
  api.addRecipe(
    "custom_golden_apple",
    "minecraft:golden_apple",
    "1",
    '["AAA","ABA","AAA"]',
    '{"A":"minecraft:gold_ingot","B":"minecraft:apple"}'
  );
  
  api.log("Custom recipes added");
});

// Command to remove recipe
api.registerCommand("removerecipe", (ctx, args) => {
  if (!ctx.player) return;
  
  if (args.length < 1) {
    api.sendMessageTo(ctx.player.name, "§cUsage: /removerecipe <id>");
    return;
  }
  
  api.removeRecipe(args[0]);
  api.sendMessageTo(ctx.player.name, `§aRemoved recipe: §e${args[0]}`);
});

// === WORLD MODIFICATION ===

// Explosion command
api.registerCommand("explode", (ctx, args) => {
  if (!ctx.player) return;
  
  if (!api.hasPermission(ctx.player.name, "admin.explode")) {
    api.sendMessageTo(ctx.player.name, "§cNo permission!");
    return;
  }
  
  const power = args[0] || "4";
  const fire = args[1] === "true";
  const breaks = args[2] !== "false";
  
  // Get block player is looking at via raycast
  const raycast = api.raycast(ctx.player.name, "5");
  
  if (raycast && raycast.hit) {
    api.createExplosion(
      raycast.x,
      raycast.y,
      raycast.z,
      ctx.player.dimensionId,
      power,
      fire.toString(),
      breaks.toString()
    );
    
    api.broadcast(`§c§l💥 §e${ctx.player.name} §ccreated an explosion!`);
    api.playSound("entity.generic.explode", 1.0, 1.0);
  } else {
    api.sendMessageTo(ctx.player.name, "§cLook at a block first!");
  }
});

// Lightning strike command
api.registerCommand("lightning", (ctx, args) => {
  if (!ctx.player) return;
  
  const visual = args[0] === "visual";
  
  // Get block player is looking at
  const raycast = api.raycast(ctx.player.name, "100");
  
  if (raycast && raycast.hit) {
    api.spawnLightning(
      raycast.x,
      raycast.y,
      raycast.z,
      ctx.player.dimensionId,
      visual.toString()
    );
    
    api.playSound("entity.lightning_bolt.thunder", 1.0, 1.0);
    api.sendMessageTo(ctx.player.name, "§e⚡ Lightning summoned!");
  } else {
    api.sendMessageTo(ctx.player.name, "§cLook at a location first!");
  }
});

// Lightning wand item
api.onItemUse((evt) => {
  if (evt.itemId === "minecraft:blaze_rod") {
    // Get block player clicked
    const raycast = api.raycast(evt.playerName, "50");
    
    if (raycast && raycast.hit) {
      api.spawnLightning(
        raycast.x,
        raycast.y,
        raycast.z,
        evt.player.dimensionId,
        "false"
      );
      
      api.sendMessageTo(evt.playerName, "§e⚡ Lightning Wand activated!");
      
      // Particle effect
      api.spawnParticle(
        raycast.x, raycast.y + 1, raycast.z,
        evt.player.dimensionId,
        "minecraft:electric_spark",
        20, 0.3, 0.5, 1, 0.5
      );
    }
  }
});

// Set spawn point
api.registerCommand("setspawn", (ctx, args) => {
  if (!ctx.player) return;
  
  if (!api.hasPermission(ctx.player.name, "admin.setspawn")) {
    api.sendMessageTo(ctx.player.name, "§cNo permission!");
    return;
  }
  
  api.setSpawn(
    ctx.player.dimensionId,
    Math.floor(ctx.player.x).toString(),
    Math.floor(ctx.player.y).toString(),
    Math.floor(ctx.player.z).toString()
  );
  
  api.broadcast(`§aSpawn point updated by §e${ctx.player.name}`);
  
  // Mark spawn with particles
  api.spawnParticleCircle(
    ctx.player.x,
    ctx.player.y,
    ctx.player.z,
    ctx.player.dimensionId,
    "minecraft:glow",
    5,
    50
  );
});

// Meteor shower event
api.registerCommand("meteorshower", (ctx, args) => {
  if (!ctx.player) return;
  
  api.broadcast("§c§l⚠ §eMeteor shower incoming!");
  
  let count = 0;
  const interval = api.runRepeating("20", () => {
    count++;
    
    // Random location near spawn
    const x = Math.floor(Math.random() * 200 - 100);
    const z = Math.floor(Math.random() * 200 - 100);
    const y = 100;
    
    // Fireball effect
    api.spawnParticle(
      x, y, z,
      "minecraft:overworld",
      "minecraft:flame",
      100, 2, 5, 5, 5
    );
    
    // Explosion on impact
    api.runLater("40", () => {
      api.createExplosion(
        x.toString(),
        "64",
        z.toString(),
        "minecraft:overworld",
        "3",
        "true",
        "true"
      );
    });
    
    if (count >= 10) {
      api.cancelTask(interval);
      api.broadcast("§aMeteor shower has ended!");
    }
  });
});

// Instant building
api.registerCommand("build", (ctx, args) => {
  if (!ctx.player) return;
  
  if (args.length < 1) {
    api.sendMessageTo(ctx.player.name, "§cUsage: /build <house|tower|wall>");
    return;
  }
  
  const type = args[0].toLowerCase();
  const x = Math.floor(ctx.player.x);
  const y = Math.floor(ctx.player.y);
  const z = Math.floor(ctx.player.z);
  
  if (type === "house") {
    // Build simple house
    api.fillArea(
      x, y, z,
      (x + 5).toString(), (y + 4).toString(), (z + 5).toString(),
      ctx.player.dimensionId,
      "minecraft:oak_planks"
    );
    
    // Hollow it out
    api.fillArea(
      (x + 1).toString(), (y + 1).toString(), (z + 1).toString(),
      (x + 4).toString(), (y + 3).toString(), (z + 4).toString(),
      ctx.player.dimensionId,
      "minecraft:air"
    );
    
    api.sendMessageTo(ctx.player.name, "§aHouse built!");
  } else if (type === "tower") {
    // Build tower
    api.fillArea(
      x, y, z,
      (x + 3).toString(), (y + 20).toString(), (z + 3).toString(),
      ctx.player.dimensionId,
      "minecraft:stone_bricks"
    );
    
    api.sendMessageTo(ctx.player.name, "§aTower built!");
  } else if (type === "wall") {
    // Build wall
    api.fillArea(
      x, y, z,
      (x + 20).toString(), (y + 5).toString(), z.toString(),
      ctx.player.dimensionId,
      "minecraft:cobblestone"
    );
      
      api.sendMessageTo(ctx.player.name, "§aWall built!");
    }
    
    // Particle effect
    api.spawnParticle(
      ctx.player.x, ctx.player.y + 2, ctx.player.z,
      ctx.player.dimensionId,
      "minecraft:happy_villager",
      30, 0.5, 2, 2, 2
    );
  });
  }
});
