// ============================================================================
// Scoreboard Example Mod
// ============================================================================
// Demonstrates the scoreboard/objective system in ThreadJS
//
// Scoreboard Functions:
//   - createScoreboard    - Create a new scoreboard with objectives
//   - incrementScore      - Add to a player's score
//   - setScore           - Set a player's score to a specific value
//   - getScore           - Retrieve a player's current score
//   - displayScoreboard  - Show a scoreboard in sidebar/list/belowName
//
// Commands:
//   /js showscoreboard <board>  - Display a scoreboard (pvp or mining)
//
// This mod showcases:
//   - Creating multiple scoreboards
//   - Tracking kills in PvP
//   - Tracking blocks mined
//   - Dynamic score updates
//   - Scoreboard display positions
// ============================================================================

api.registerMod("scoreboard_example", {
  onInitialize(api) {
    // Create scoreboards on server start
    api.onServerStart(() => {
  api.createScoreboard("pvp", "PvP Stats");
  api.createScoreboard("mining", "Mining Stats");
});

// Track player kills
api.onEntityDeath((evt) => {
  if (evt.victimType === "minecraft:player" && evt.killedBy === "minecraft:player") {
    // Increment killer's score
    api.incrementScore("pvp", evt.killedBy, "kills", 1);
    
    // Show updated score
    const score = api.getScore("pvp", evt.killedBy, "kills");
    api.sendMessageTo(evt.killedBy, `§6Total kills: ${score}`);
  }
});

// Track blocks mined
api.onBlockBreak((evt) => {
  api.incrementScore("mining", evt.playerName, "blocks_mined", 1);
});

// Command to check stats
api.registerCommand("stats", (ctx, args) => {
  if (!ctx.player) return;
  
  const kills = api.getScore("pvp", ctx.player.name, "kills");
  const mined = api.getScore("mining", ctx.player.name, "blocks_mined");
  
  api.sendMessageTo(ctx.player.name, `§a=== Your Stats ===`);
  api.sendMessageTo(ctx.player.name, `§eKills: §f${kills}`);
  api.sendMessageTo(ctx.player.name, `§eBlocks Mined: §f${mined}`);
});

// Command to show scoreboard
api.registerCommand("showscoreboard", (ctx, args) => {
  if (!ctx.player || args.length < 1) return;
  
    const board = args[0]; // "pvp" or "mining"
    api.displayScoreboard(board, "SIDEBAR");
    api.sendMessageTo(ctx.player.name, `§aShowing ${board} scoreboard`);
    });
  }
});
  }
});
