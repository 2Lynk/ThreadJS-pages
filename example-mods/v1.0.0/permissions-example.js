// ============================================================================
// Permissions Example Mod
// ============================================================================
// Demonstrates the permission system for access control and ranks
//
// Permission Functions:
//   - addPermission       - Grant a permission to a player
//   - removePermission    - Revoke a permission from a player
//   - hasPermission       - Check if a player has a permission
//   - listPermissions     - Get all permissions for a player
//
// Commands:
//   /grantperm <player> <permission>   - Grant a permission
//   /revokeperm <player> <permission>  - Revoke a permission
//   /checkperm <permission>            - Check if you have permission
//   /mypermissions                     - List your permissions
//   /myrank                            - Display your rank
//
// This mod showcases:
//   - Hierarchical permission system (admin.all > mod.all > vip.access)
//   - Auto-granting admin on join (for server owner)
//   - Permission-gated commands
//   - Rank display based on permissions
//   - VIP perks (speed boost example)
// ============================================================================

api.registerMod("permissions_example", {
  onInitialize(api) {
    // Grant admin permissions on first join
    api.onPlayerJoin((player) => {
  // Check if player is server owner
  const isOwner = player.name === "ServerOwner"; // Replace with actual owner name
  
  if (isOwner) {
    api.addPermission(player.name, "admin.all");
    api.sendMessageTo(player.name, "§a§lAdmin permissions granted!");
  }
  
  // Give default permissions to all players
  if (!api.hasPermission(player.name, "default.build")) {
    api.addPermission(player.name, "default.build");
    api.addPermission(player.name, "default.chat");
    api.addPermission(player.name, "default.interact");
  }
});

// Permission-gated command: kick
api.registerCommand("kick", (ctx, args) => {
  if (!ctx.player) return;
  
  if (!api.hasPermission(ctx.player.name, "admin.kick")) {
    api.sendMessageTo(ctx.player.name, "§c§l✖ §cYou don't have permission to use this command!");
    return;
  }
  
  if (args.length < 1) {
    api.sendMessageTo(ctx.player.name, "§cUsage: /kick <player> [reason]");
    return;
  }
  
  const targetPlayer = args[0];
  const reason = args.slice(1).join(" ") || "No reason specified";
  
  api.broadcast(`§c${targetPlayer} was kicked by ${ctx.player.name}: ${reason}`);
  // Actual kick implementation would go here
});

// Permission-gated command: gamemode
api.registerCommand("gm", (ctx, args) => {
  if (!ctx.player) return;
  
  if (!api.hasPermission(ctx.player.name, "admin.gamemode")) {
    api.sendMessageTo(ctx.player.name, "§c§l✖ §cYou don't have permission to use this command!");
    return;
  }
  
  if (args.length < 1) {
    api.sendMessageTo(ctx.player.name, "§cUsage: /gm <creative|survival|adventure|spectator>");
    return;
  }
  
  const mode = args[0].toLowerCase();
  api.sendMessageTo(ctx.player.name, `§aGamemode set to: ${mode}`);
  // Actual gamemode change would go here
});

// Permission management commands
api.registerCommand("addperm", (ctx, args) => {
  if (!ctx.player) return;
  
  if (!api.hasPermission(ctx.player.name, "admin.permissions")) {
    api.sendMessageTo(ctx.player.name, "§c§l✖ §cYou don't have permission to manage permissions!");
    return;
  }
  
  if (args.length < 2) {
    api.sendMessageTo(ctx.player.name, "§cUsage: /addperm <player> <permission>");
    return;
  }
  
  const player = args[0];
  const permission = args[1];
  
  api.addPermission(player, permission);
  api.sendMessageTo(ctx.player.name, `§aAdded permission '${permission}' to ${player}`);
  api.sendMessageTo(player, `§a§l✓ §aYou have been granted permission: ${permission}`);
});

api.registerCommand("removeperm", (ctx, args) => {
  if (!ctx.player) return;
  
  if (!api.hasPermission(ctx.player.name, "admin.permissions")) {
    api.sendMessageTo(ctx.player.name, "§c§l✖ §cYou don't have permission to manage permissions!");
    return;
  }
  
  if (args.length < 2) {
    api.sendMessageTo(ctx.player.name, "§cUsage: /removeperm <player> <permission>");
    return;
  }
  
  const player = args[0];
  const permission = args[1];
  
  api.removePermission(player, permission);
  api.sendMessageTo(ctx.player.name, `§aRemoved permission '${permission}' from ${player}`);
  api.sendMessageTo(player, `§c§l✖ §cYou have lost permission: ${permission}`);
});

api.registerCommand("listperms", (ctx, args) => {
  if (!ctx.player) return;
  
  let targetPlayer = ctx.player.name;
  
  // If admin, can check other players
  if (args.length > 0 && api.hasPermission(ctx.player.name, "admin.permissions")) {
    targetPlayer = args[0];
  }
  
  const permissions = api.getPlayerPermissions(targetPlayer);
  
  api.sendMessageTo(ctx.player.name, `§a§l=== Permissions for ${targetPlayer} ===`);
  if (permissions.length === 0) {
    api.sendMessageTo(ctx.player.name, "§7No permissions");
  } else {
    permissions.forEach((perm, index) => {
      api.sendMessageTo(ctx.player.name, `§e${index + 1}. §f${perm}`);
    });
  }
});

// Permission-based block breaking
api.onBlockBreak((evt) => {
  const blockType = evt.blockId;
  
  // Protect special blocks
  const protectedBlocks = [
    "minecraft:diamond_ore",
    "minecraft:ancient_debris",
    "minecraft:beacon"
  ];
  
  if (protectedBlocks.includes(blockType)) {
    if (!api.hasPermission(evt.playerName, "mining.special")) {
      api.sendMessageTo(evt.playerName, "§c§l✖ §cYou need the 'mining.special' permission to break this block!");
      return false; // Cancel event
    }
  }
});

// VIP area access
api.registerCommand("vip", (ctx, args) => {
  if (!ctx.player) return;
  
  if (!api.hasPermission(ctx.player.name, "vip.access")) {
    api.sendMessageTo(ctx.player.name, "§c§l✖ §cThis command is for VIP members only!");
    api.sendMessageTo(ctx.player.name, "§7Purchase VIP at: §eserver.com/shop");
    return;
  }
  
  // Teleport to VIP lounge
  api.teleport(ctx.player.name, 1000, 100, 1000, "minecraft:overworld");
  api.sendMessageTo(ctx.player.name, "§6§l✦ §eWelcome to the VIP Lounge!");
  api.showTitle(ctx.player.name, "§6§lVIP Lounge", "§eExclusive access", 10, 40, 10);
});

// Auto-rank system based on permissions
api.registerCommand("rank", (ctx, args) => {
  if (!ctx.player) return;
  
  let rank = "§7Default";
  
    if (api.hasPermission(ctx.player.name, "admin.all")) {
      rank = "§c§lAdmin";
    } else if (api.hasPermission(ctx.player.name, "moderator.all")) {
      rank = "§9§lModerator";
    } else if (api.hasPermission(ctx.player.name, "vip.access")) {
      rank = "§6§lVIP";
    } else if (api.hasPermission(ctx.player.name, "helper.all")) {
      rank = "§a§lHelper";
    }
    
    api.sendMessageTo(ctx.player.name, `§eYour rank: ${rank}`);
  });
  }
});
