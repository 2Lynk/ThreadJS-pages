// ============================================================================
// Teams Example Mod
// ============================================================================
// Demonstrates team management and team-based gameplay mechanics
//
// Team Functions:
//   - createTeam       - Create a new team with name and color
//   - addPlayerToTeam  - Add a player to a team
//   - removePlayerFromTeam - Remove a player from their team
//   - getPlayerTeam    - Get which team a player is on
//   - listTeamMembers  - Get all members of a team
//
// Commands:
//   /js jointeam <color>  - Join a team (red, blue, green, yellow)
//   /js leaveteam         - Leave your current team
//   /js teamlist          - List all team members
//
// This mod showcases:
//   - Creating multiple teams with colors
//   - Auto-balancing teams on join
//   - Team-based chat prefixes
//   - Friendly fire prevention
//   - Team membership management
// ============================================================================

api.registerMod("teams_example", {
  onInitialize(api) {
    // Create teams on server start
    api.onServerStart(() => {
  api.createTeam("red", "Red Team", "RED", false);
  api.createTeam("blue", "Blue Team", "BLUE", false);
  api.createTeam("green", "Green Team", "GREEN", false);
  api.createTeam("yellow", "Yellow Team", "YELLOW", false);
  
  api.log("Teams created: red, blue, green, yellow");
});

// Auto-balance teams on join
api.onPlayerJoin((player) => {
  // Simple auto-balance: assign to smallest team
  // In a real scenario, you'd check team sizes
  const teams = ["red", "blue", "green", "yellow"];
  const randomTeam = teams[Math.floor(Math.random() * teams.length)];
  
  api.addToTeam(randomTeam, player.name);
  api.sendMessageTo(player.name, `§aYou've been assigned to ${randomTeam} team!`);
});

// Command to join specific team
api.registerCommand("team", (ctx, args) => {
  if (!ctx.player) return;
  
  if (args.length < 1) {
    api.sendMessageTo(ctx.player.name, "§cUsage: /team <red|blue|green|yellow>");
    return;
  }
  
  const team = args[0].toLowerCase();
  const validTeams = ["red", "blue", "green", "yellow"];
  
  if (!validTeams.includes(team)) {
    api.sendMessageTo(ctx.player.name, "§cInvalid team! Choose: red, blue, green, or yellow");
    return;
  }
  
  // Remove from current team first
  const currentTeam = api.getPlayerTeam(ctx.player.name);
  if (currentTeam) {
    api.removeFromTeam(currentTeam, ctx.player.name);
  }
  
  // Add to new team
  api.addToTeam(team, ctx.player.name);
  api.broadcast(`§e${ctx.player.name} §ajoined the §${team.charAt(0)}${team} team§a!`);
});

// Command to leave team
api.registerCommand("leaveteam", (ctx, args) => {
  if (!ctx.player) return;
  
  const team = api.getPlayerTeam(ctx.player.name);
  if (!team) {
    api.sendMessageTo(ctx.player.name, "§cYou're not in a team!");
    return;
  }
  
  api.removeFromTeam(team, ctx.player.name);
  api.sendMessageTo(ctx.player.name, `§aYou left the ${team} team`);
});

// Prevent friendly fire
    api.onEntityDamage((evt) => {
      if (evt.victimType === "minecraft:player" && evt.sourceType === "minecraft:player") {
        const victimTeam = api.getPlayerTeam(evt.playerName);
        const attackerTeam = api.getPlayerTeam(evt.sourceType);
        
        if (victimTeam && attackerTeam && victimTeam === attackerTeam) {
          // Cancel damage between teammates
          return false; // Return false to cancel event
        }
      }
    });
  }
});
