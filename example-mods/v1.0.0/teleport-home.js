/**
 * Teleport Home - Simple home system
 *
 * Showcases:
 * - Command registration with optional arguments
 * - Player location tracking
 * - Data persistence (save/load)
 * - Teleportation API
 * - Particle effects
 *
 * This module registers the `teleport-home` mod and provides a `/home`
 * command with multiple sub-actions: set, delete, list, and teleport.
 */

/**
 * @typedef {Object} HomeLocation
 * @property {number} x - X coordinate of the saved home.
 * @property {number} y - Y coordinate of the saved home.
 * @property {number} z - Z coordinate of the saved home.
 * @property {string|number} dimension - Dimension ID where the home is set.
 * @property {number} yaw - Player yaw rotation when saved.
 * @property {number} pitch - Player pitch rotation when saved.
 */

/**
 * @typedef {Object} CommandContext
 * @property {Object} args - Parsed command arguments.
 * @property {string} [args.action] - The requested action (set, delete, list, tp).
 * @property {Object} player - Player object (if the sender is a player).
 * @property {string} playerName - Name of the sender/player.
 * @property {(msg:string)=>void} reply - Sends a chat message back to the sender.
 */

/**
 * @typedef {Object} PlayerInfo
 * @property {number} x
 * @property {number} y
 * @property {number} z
 * @property {string|number} dimensionId
 * @property {number} yaw
 * @property {number} pitch
 * 
 * Note: When returned as a Java object, fields must be accessed using `.get()`.
 */

/**
 * @typedef {Object} APIMethods
 * @property {(msg:string)=>void} log - Log text to the server console.
 * @property {(key:string, defaultValue:any)=>any} loadData - Load saved JSON data.
 * @property {(key:string, value:any)=>void} saveData - Save JSON data.
 * @property {(name:string)=>PlayerInfo|Map} getPlayer - Get all data for a player.
 * @property {(player:string, x:number, y:number, z:number)=>void} teleportPlayer - Teleport a player.
 * @property {(particle:string, x:number, y:number, z:number, count:number)=>void} spawnParticle - Spawn particles.
 * @property {(sound:string, x:number, y:number, z:number, volume:number, pitch:number)=>void} playSound - Play a sound.
 * @property {(cmd:Object)=>void} registerCommand - Register a new command.
 * @property {(id:string, implementation:Object)=>void} registerMod - Register a new JavaScript mod.
 */

/**
 * Registers the Teleport Home mod.
 * @param {APIMethods} api - The Thread.JS modding API.
 */
api.registerMod("teleport-home", {

  /**
   * Fired when the mod initializes.
   * Loads persisted home locations and registers the `/home` command.
   *
   * @param {APIMethods} api - API instance provided on startup.
   */
  onInitialize(api) {
    api.log("§6[TeleportHome] Loading Teleport Home mod...");

    /** @type {Record<string, HomeLocation>} */
    let homes = {};
    
    // Load saved homes
    let homesRaw = api.loadData("homes", {});
    try {
      homes = JSON.parse(JSON.stringify(homesRaw)) || {};
    } catch (e) {
      api.log("[TeleportHome] Failed to parse homes: " + e);
      homes = {};
    }

    // Register the /home command
    api.registerCommand({
      command: "home",
      description: "Teleport to your home or manage home settings.",
      args: [
        {
          name: "action",
          type: "string",
          hint: ["set", "delete", "list"],
          optional: true
        }
      ],

      /**
       * Execute the /home command.
       * Possible actions:
       * - set: Save the current location as home.
       * - delete: Remove stored home.
       * - list: Show stored home information.
       * - tp (default): Teleport the player to their home.
       *
       * @param {CommandContext} ctx
       */
      execute: function(ctx) {
        if (!ctx.player) {
          ctx.reply("§cOnly players can use this command!");
          return;
        }

        let playerName = ctx.playerName;
        let action = ctx.args.action ? ctx.args.action.toLowerCase() : "tp";

        // ----- SET HOME -----
        if (action === "set") {
          let playerInfo = api.getPlayer(playerName);

          /** @type {PlayerInfo} */
          let info = {
            x: playerInfo.get ? playerInfo.get("x") : playerInfo.x,
            y: playerInfo.get ? playerInfo.get("y") : playerInfo.y,
            z: playerInfo.get ? playerInfo.get("z") : playerInfo.z,
            dimensionId: playerInfo.get ? playerInfo.get("dimensionId") : playerInfo.dimensionId,
            yaw: playerInfo.get ? (playerInfo.get("yaw") || 0) : (playerInfo.yaw || 0),
            pitch: playerInfo.get ? (playerInfo.get("pitch") || 0) : (playerInfo.pitch || 0)
          };

          homes[playerName] = {
            x: info.x,
            y: info.y,
            z: info.z,
            dimension: info.dimensionId,
            yaw: info.yaw,
            pitch: info.pitch
          };

          api.saveData("homes", homes);
          ctx.reply(`§aHome set at §f${Math.floor(info.x)}, ${Math.floor(info.y)}, ${Math.floor(info.z)}`);

          api.spawnParticle("minecraft:happy_villager", info.x, info.y + 1, info.z, 20);
          api.playSound("minecraft:block.note_block.pling", info.x, info.y, info.z, 1.0, 1.5);

          return;
        }

        // ----- DELETE HOME -----
        if (action === "delete") {
          if (!homes[playerName]) {
            ctx.reply("§cYou don't have a home set!");
            return;
          }
          delete homes[playerName];
          api.saveData("homes", homes);
          ctx.reply("§aHome deleted!");
          return;
        }

        // ----- LIST HOME -----
        if (action === "list") {
          if (!homes[playerName]) {
            ctx.reply("§cYou don't have a home set!");
            return;
          }
          let home = homes[playerName];
          ctx.reply("§6=== Your Home ===");
          ctx.reply(`§eLocation: §f${Math.floor(home.x)}, ${Math.floor(home.y)}, ${Math.floor(home.z)}`);
          ctx.reply(`§eDimension: §f${home.dimension}`);
          return;
        }

        // ----- TELEPORT -----
        if (!homes[playerName]) {
          ctx.reply("§cYou don't have a home set! Use §e/home set");
          return;
        }

        let home = homes[playerName];
        let current = api.getPlayer(playerName);
        let currentX = current.get ? current.get("x") : current.x;
        let currentY = current.get ? current.get("y") : current.y;
        let currentZ = current.get ? current.get("z") : current.z;

        // Departure particles
        api.spawnParticle("minecraft:portal", currentX, currentY + 1, currentZ, 50);

        // Teleport
        api.teleportPlayer(playerName, home.x, home.y, home.z);

        // Arrival effects
        api.spawnParticle("minecraft:portal", home.x, home.y + 1, home.z, 50);
        api.playSound("minecraft:entity.enderman.teleport", home.x, home.y, home.z, 1.0, 1.0);

        ctx.reply("§aTeleported home!");
      }
    });

    api.log("§a✓ Teleport Home mod loaded!");
  }
});
