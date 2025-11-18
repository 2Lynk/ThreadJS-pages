// ============================================================================
// Zones Example Mod
// ============================================================================
// Demonstrates zone/region system for protected areas and custom mechanics
//
// Zone Functions:
//   - createZone         - Define a cuboid region with a name
//   - deleteZone         - Remove a zone
//   - isInZone           - Check if coordinates are in a zone
//   - getZoneAt          - Get zone name at coordinates
//   - setZoneProperty    - Configure zone properties (pvp, build, etc.)
//
// Commands:
//   /js createzone <name> <size>  - Create a zone at your location
//   /js deletezone <name>         - Delete a zone
//   /js checkzone                 - Check which zone you're in
//   /js zoneto <name>             - Teleport to a zone
//
// This mod showcases:
//   - Protected spawn zone (no building)
//   - PvP arena zone (combat enabled)
//   - Mining zone (break tracking)
//   - Entry/exit notifications
//   - Zone-based restrictions
//   - Quick zone teleportation
// ============================================================================

api.registerMod("zones_example", {
  onInitialize(api) {
    // Create zones on server start
    api.onServerStart(() => {
  // Spawn protection zone
  api.createZone(
    "spawn",
    -50, 60, -50,
    50, 100, 50,
    "minecraft:overworld"
  );
  
  // PvP arena
  api.createZone(
    "pvp_arena",
    100, 60, 100,
    200, 100, 200,
    "minecraft:overworld"
  );
  
  // Mining zone
  api.createZone(
    "mining",
    -100, 0, -100,
    -50, 64, -50,
    "minecraft:overworld"
  );
  
  api.log("Zones created: spawn, pvp_arena, mining");
});

// Handle zone enter events
api.onZoneEnter("spawn", (evt) => {
  api.sendMessageTo(evt.player.name, "§a§l» §aEntering Spawn Zone - PvP Disabled");
  api.showTitle(evt.player.name, "§aSpawn", "§7Safe Zone", 10, 40, 10);
});

api.onZoneEnter("pvp_arena", (evt) => {
  api.sendMessageTo(evt.player.name, "§c§l» §cEntering PvP Arena - Fight!");
  api.showTitle(evt.player.name, "§c§lPvP Arena", "§eWatch out!", 10, 40, 10);
  
  // Give player items for PvP
  api.giveItem(evt.player.name, "minecraft:diamond_sword", 1);
  api.giveItem(evt.player.name, "minecraft:cooked_beef", 16);
});

api.onZoneEnter("mining", (evt) => {
  api.sendMessageTo(evt.player.name, "§e§l» §eEntering Mining Zone - Bonus XP!");
  api.showActionbar(evt.player.name, "§6⛏ Mining Zone - 2x XP ⛏");
});

// Handle zone leave events
api.onZoneLeave("spawn", (evt) => {
  api.sendMessageTo(evt.player.name, "§c§l« §cLeaving Spawn - PvP Enabled");
});

api.onZoneLeave("pvp_arena", (evt) => {
  api.sendMessageTo(evt.player.name, "§a§l« §aLeaving PvP Arena");
  // Clear inventory items
  api.removeItem(evt.player.name, "minecraft:diamond_sword", 999);
});

api.onZoneLeave("mining", (evt) => {
  api.sendMessageTo(evt.player.name, "§7§l« §7Leaving Mining Zone");
});

// Prevent block breaking in spawn
api.onBlockBreak((evt) => {
  const inSpawn = api.isInZone("spawn", evt.x, evt.y, evt.z);
  
  if (inSpawn) {
    const hasPermission = api.hasPermission(evt.playerName, "spawn.build");
    if (!hasPermission) {
      api.sendMessageTo(evt.playerName, "§cYou can't break blocks in spawn!");
      return false; // Cancel event
    }
  }
});

// Prevent PvP in spawn
api.onEntityDamage((evt) => {
  if (evt.victimType === "minecraft:player") {
    // Get victim's position (you'd need to get player object)
    // For now, simplified example
    const players = api.getPlayers();
    const victim = players.find(p => p.name === evt.playerName);
    
    if (victim) {
      const inSpawn = api.isInZone("spawn", victim.x, victim.y, victim.z);
      if (inSpawn) {
        return false; // Cancel damage in spawn
      }
    }
  }
});

// Command to check zone
api.registerCommand("whereami", (ctx, args) => {
  if (!ctx.player) return;
  
  const zones = ["spawn", "pvp_arena", "mining"];
  let currentZone = null;
  
  for (const zone of zones) {
    if (api.isInZone(zone, ctx.player.x, ctx.player.y, ctx.player.z)) {
      currentZone = zone;
      break;
    }
  }
  
  if (currentZone) {
    api.sendMessageTo(ctx.player.name, `§aYou are in: §e${currentZone}`);
  } else {
    api.sendMessageTo(ctx.player.name, "§7You are in wilderness");
  }
});

// Command to teleport to zone
api.registerCommand("zone", (ctx, args) => {
  if (!ctx.player || args.length < 1) {
    api.sendMessageTo(ctx.player.name, "§cUsage: /zone <spawn|pvp|mining>");
    return;
  }
  
    const zone = args[0].toLowerCase();
    
    if (zone === "spawn") {
      api.teleport(ctx.player.name, 0, 65, 0, "minecraft:overworld");
    } else if (zone === "pvp" || zone === "pvp_arena") {
      api.teleport(ctx.player.name, 150, 65, 150, "minecraft:overworld");
    } else if (zone === "mining") {
      api.teleport(ctx.player.name, -75, 32, -75, "minecraft:overworld");
    } else {
      api.sendMessageTo(ctx.player.name, "§cUnknown zone!");
    }
  });
  }
});
