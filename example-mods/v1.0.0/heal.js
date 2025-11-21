/**
 * Heal - Simple player healing command
 *
 * Showcases:
 * - Player manipulation (health, hunger)
 * - Permission levels
 * - Target player argument with suggestions
 * - Visual/audio feedback
 *
 * Provides commands to heal players and restore hunger.
 */

/**
 * @typedef {Object} CommandContext
 * @property {Object} args - Parsed command arguments.
 * @property {string} [args.target] - Target player name.
 * @property {Object} player - Player object (if the sender is a player).
 * @property {string} playerName - Name of the sender/player.
 * @property {(msg:string)=>void} reply - Sends a chat message back to the sender.
 */

/**
 * @typedef {Object} PlayerInfo
 * @property {number} x
 * @property {number} y
 * @property {number} z
 * @property {number} health
 * @property {number} foodLevel
 *
 * Note: When returned as a Java object, fields must be accessed using `.get()`.
 */

/**
 * @typedef {Object} APIMethods
 * @property {(msg:string)=>void} log - Log text to the server console.
 * @property {(name:string)=>PlayerInfo|Map} getPlayer - Get all data for a player.
 * @property {(player:string, health:number)=>void} setPlayerHealth - Set player health (0-20).
 * @property {(player:string, foodLevel:number)=>void} setPlayerHunger - Set player hunger (0-20).
 * @property {(particle:string, x:number, y:number, z:number, count:number)=>void} spawnParticle - Spawn particles.
 * @property {(sound:string, x:number, y:number, z:number, volume:number, pitch:number)=>void} playSound - Play a sound.
 * @property {(cmd:Object)=>void} registerCommand - Register a new command.
 * @property {(id:string, implementation:Object)=>void} registerMod - Register a new JavaScript mod.
 */

/**
 * Registers the Heal mod.
 * @param {APIMethods} api - The Thread.JS modding API.
 */
api.registerMod("heal", {

  /**
   * Fired when the mod initializes.
   * Registers the `/heal` command.
   *
   * @param {APIMethods} api - API instance provided on startup.
   */
  onInitialize(api) {
    api.log("§6[Heal] Loading Heal mod...");

    // Register /heal command
    api.registerCommand({
      command: "heal",
      description: "Restore health and hunger",
      requiresOp: true,
      permissionLevel: 2,
      args: [
        { name: "target", type: "player", hint: "<player>", optional: true }
      ],

      /**
       * Execute the /heal command.
       * Restores target player's health and hunger to maximum.
       *
       * @param {CommandContext} ctx
       */
      execute: function(ctx) {
        let targetPlayer = ctx.args.target || ctx.playerName;

        if (!targetPlayer) {
          ctx.reply("§cUsage: /heal [player]");
          return;
        }

        // Get player info
        let playerInfo = api.getPlayer(targetPlayer);
        if (!playerInfo) {
          ctx.reply(`§cPlayer '${targetPlayer}' not found!`);
          return;
        }

        let x = playerInfo.get ? playerInfo.get("x") : playerInfo.x;
        let y = playerInfo.get ? playerInfo.get("y") : playerInfo.y;
        let z = playerInfo.get ? playerInfo.get("z") : playerInfo.z;

        // Heal player
        api.setPlayerHealth(targetPlayer, 20);
        api.setPlayerHunger(targetPlayer, 20);

        // Effects
        api.spawnParticle("minecraft:heart", x, y + 1, z, 20);
        api.playSound("minecraft:entity.player.levelup", x, y, z, 0.5, 1.5);

        if (targetPlayer === ctx.playerName) {
          ctx.reply("§a✓ You have been healed!");
        } else {
          ctx.reply(`§a✓ Healed ${targetPlayer}!`);
        }
      }
    });

    api.log("§a✓ Heal mod loaded!");
  }
});
