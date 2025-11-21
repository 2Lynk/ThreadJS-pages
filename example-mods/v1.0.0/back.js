/**
 * Back - Return to last location
 *
 * Showcases:
 * - Tracking player state changes
 * - Location history
 * - Death event handling
 * - Dimension-aware teleportation
 *
 * Allows players to teleport back to their previous location after death or teleport.
 */

/**
 * @typedef {Object} CommandContext
 * @property {Object} args - Parsed command arguments.
 * @property {Object} player - Player object (if the sender is a player).
 * @property {string} playerName - Name of the sender/player.
 * @property {(msg:string)=>void} reply - Sends a chat message back to the sender.
 */

/**
 * @typedef {Object} PlayerEvent
 * @property {string} playerName - Name of the player.
 * @property {number} x
 * @property {number} y
 * @property {number} z
 * @property {string} dimensionId
 * @property {number} timestamp
 */

/**
 * @typedef {Object} SavedLocation
 * @property {number} x
 * @property {number} y
 * @property {number} z
 * @property {string} dimension
 * @property {string} reason - Why this location was saved (death, teleport).
 */

/**
 * @typedef {Object} APIMethods
 * @property {(msg:string)=>void} log - Log text to the server console.
 * @property {(player:string, x:number, y:number, z:number, dimension:string)=>void} teleportPlayer - Teleport player.
 * @property {(callback:(event:PlayerEvent)=>void)=>void} onPlayerDeath - Listen for death events.
 * @property {(particle:string, x:number, y:number, z:number, count:number)=>void} spawnParticle - Spawn particles.
 * @property {(sound:string, x:number, y:number, z:number, volume:number, pitch:number)=>void} playSound - Play a sound.
 * @property {(cmd:Object)=>void} registerCommand - Register a new command.
 * @property {(id:string, implementation:Object)=>void} registerMod - Register a new JavaScript mod.
 */

/**
 * Registers the Back mod.
 * @param {APIMethods} api - The Thread.JS modding API.
 */
api.registerMod("back", {

  /**
   * Fired when the mod initializes.
   * Sets up death tracking and registers the `/back` command.
   *
   * @param {APIMethods} api - API instance provided on startup.
   */
  onInitialize(api) {
    api.log("§6[Back] Loading Back mod...");

    /** @type {Record<string, SavedLocation>} - Maps player names to their last location */
    let lastLocations = {};

    // Save location on death
    api.onEntityDeath(event => {
      let playerName = event.playerName;
      lastLocations[playerName] = {
        x: event.x,
        y: event.y,
        z: event.z,
        dimension: event.dimensionId,
        reason: "death"
      };

      api.log(`[Back] Saved death location for ${playerName}: ${event.x}, ${event.y}, ${event.z}`);
    });

    // Register /back command
    api.registerCommand({
      command: "back",
      description: "Return to your last location (death or teleport)",
      args: [],

      /**
       * Execute the /back command.
       * Teleports player to their saved location.
       *
       * @param {CommandContext} ctx
       */
      execute: function(ctx) {
        if (!ctx.player) {
          ctx.reply("§cOnly players can use this command!");
          return;
        }

        let playerName = ctx.playerName;

        if (!lastLocations[playerName]) {
          ctx.reply("§cNo previous location saved!");
          ctx.reply("§7Locations are saved when you die or use certain teleport commands.");
          return;
        }

        let loc = lastLocations[playerName];

        // Teleport to saved location
        api.teleportPlayer(playerName, loc.x, loc.y, loc.z, loc.dimension);

        // Effects
        api.spawnParticle("minecraft:reverse_portal", loc.x, loc.y + 1, loc.z, 50);
        api.playSound("minecraft:entity.enderman.teleport", loc.x, loc.y, loc.z, 1.0, 0.8);

        ctx.reply(`§aTeleported to your last ${loc.reason} location!`);

        // Clear the saved location after use
        delete lastLocations[playerName];
      }
    });

    api.log("§a✓ Back mod loaded!");
  }
});
