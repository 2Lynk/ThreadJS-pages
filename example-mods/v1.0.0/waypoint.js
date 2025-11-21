/**
 * Waypoint - Mark and manage locations
 *
 * Showcases:
 * - Multiple waypoints per player
 * - Coordinate calculations (distance)
 * - List formatting
 * - Data organization
 *
 * This module allows players to save named waypoints at their current
 * location and view distance/info about them. Supports multi-word names.
 */

/**
 * @typedef {Object} CommandContext
 * @property {Object} args - Parsed command arguments.
 * @property {string} [args.action] - The requested action (add, remove, list, info).
 * @property {string} [args.name] - Waypoint name (greedy, supports spaces).
 * @property {Object} player - Player object (if the sender is a player).
 * @property {string} playerName - Name of the sender/player.
 * @property {(msg:string)=>void} reply - Sends a chat message back to the sender.
 */

/**
 * @typedef {Object} Waypoint
 * @property {string} name - Name of the waypoint.
 * @property {number} x - X coordinate.
 * @property {number} y - Y coordinate.
 * @property {number} z - Z coordinate.
 * @property {string} dimension - Dimension ID.
 * @property {number} created - Unix timestamp when created.
 */

/**
 * @typedef {Object} PlayerInfo
 * @property {number} x
 * @property {number} y
 * @property {number} z
 * @property {string|number} dimensionId
 *
 * Note: When returned as a Java object, fields must be accessed using `.get()`.
 */

/**
 * @typedef {Object} APIMethods
 * @property {(msg:string)=>void} log - Log text to the server console.
 * @property {(key:string, defaultValue:any)=>any} loadData - Load saved JSON data.
 * @property {(key:string, value:any)=>void} saveData - Save JSON data.
 * @property {(name:string)=>PlayerInfo|Map} getPlayer - Get all data for a player.
 * @property {(particle:string, x:number, y:number, z:number, count:number)=>void} spawnParticle - Spawn particles.
 * @property {(cmd:Object)=>void} registerCommand - Register a new command.
 * @property {(id:string, implementation:Object)=>void} registerMod - Register a new JavaScript mod.
 */

/**
 * Registers the Waypoint mod.
 * @param {APIMethods} api - The Thread.JS modding API.
 */
api.registerMod("waypoint", {

  /**
   * Fired when the mod initializes.
   * Loads waypoint data and registers the `/waypoint` command.
   *
   * @param {APIMethods} api - API instance provided on startup.
   */
  onInitialize(api) {
    api.log("§6[Waypoint] Loading Waypoint mod...");

    /** @type {Record<string, Waypoint[]>} - Maps player names to their waypoint arrays */
    let waypoints = {};

    // Load waypoints
    let waypointsRaw = api.loadData("waypoints", {});
    try {
      waypoints = JSON.parse(JSON.stringify(waypointsRaw)) || {};
    } catch (e) {
      api.log("[Waypoint] Failed to parse waypoints: " + e);
      waypoints = {};
    }

    /**
     * Calculate 3D distance between two points.
     * @param {number} x1
     * @param {number} y1
     * @param {number} z1
     * @param {number} x2
     * @param {number} y2
     * @param {number} z2
     * @returns {number} Distance in blocks
     */
    function distance(x1, y1, z1, x2, y2, z2) {
      return Math.sqrt(
        Math.pow(x2 - x1, 2) +
        Math.pow(y2 - y1, 2) +
        Math.pow(z2 - z1, 2)
      );
    }

    // Register /waypoint command
    api.registerCommand({
      command: "waypoint",
      description: "Manage personal waypoints",
      args: [
        { name: "action", type: "string", hint: ["add", "remove", "list", "info"], optional: true },
        { name: "name", type: "greedy", hint: "<waypoint name>", optional: true }
      ],

      /**
       * Execute the /waypoint command.
       * Actions:
       * - add <name>: Create a waypoint at current location.
       * - remove <name>: Delete a waypoint.
       * - list: Show all waypoints with distances.
       * - info <name>: Show detailed info about a waypoint.
       *
       * @param {CommandContext} ctx
       */
      execute: function(ctx) {
        if (!ctx.player) {
          ctx.reply("§cOnly players can use this command!");
          return;
        }

        let playerName = ctx.playerName;
        let action = ctx.args.action ? ctx.args.action.toLowerCase() : "list";

        // Initialize player waypoints
        if (!waypoints[playerName]) {
          waypoints[playerName] = [];
        }

        // ----- ADD -----
        if (action === "add") {
          if (!ctx.args.name) {
            ctx.reply("§cUsage: /waypoint add <name>");
            return;
          }

          let name = ctx.args.name;
          let playerInfo = api.getPlayer(playerName);
          let x = playerInfo.get ? playerInfo.get("x") : playerInfo.x;
          let y = playerInfo.get ? playerInfo.get("y") : playerInfo.y;
          let z = playerInfo.get ? playerInfo.get("z") : playerInfo.z;
          let dimension = playerInfo.get ? playerInfo.get("dimensionId") : playerInfo.dimensionId;

          // Check if waypoint already exists
          for (let i = 0; i < waypoints[playerName].length; i++) {
            if (waypoints[playerName][i].name === name) {
              ctx.reply(`§cWaypoint '${name}' already exists!`);
              return;
            }
          }

          waypoints[playerName].push({
            name: name,
            x: x,
            y: y,
            z: z,
            dimension: dimension,
            created: Date.now()
          });

          api.saveData("waypoints", waypoints);
          ctx.reply(`§aWaypoint '${name}' created at §f${Math.floor(x)}, ${Math.floor(y)}, ${Math.floor(z)}`);
          api.spawnParticle("minecraft:end_rod", x, y + 1, z, 20);

        // ----- REMOVE -----
        } else if (action === "remove") {
          if (!ctx.args.name) {
            ctx.reply("§cUsage: /waypoint remove <name>");
            return;
          }

          let name = ctx.args.name;
          let found = false;

          for (let i = 0; i < waypoints[playerName].length; i++) {
            if (waypoints[playerName][i].name === name) {
              waypoints[playerName].splice(i, 1);
              found = true;
              break;
            }
          }

          if (!found) {
            ctx.reply(`§cWaypoint '${name}' not found!`);
            return;
          }

          api.saveData("waypoints", waypoints);
          ctx.reply(`§aWaypoint '${name}' removed`);

        // ----- INFO -----
        } else if (action === "info") {
          if (!ctx.args.name) {
            ctx.reply("§cUsage: /waypoint info <name>");
            return;
          }

          let name = ctx.args.name;
          let waypoint = null;

          for (let i = 0; i < waypoints[playerName].length; i++) {
            if (waypoints[playerName][i].name === name) {
              waypoint = waypoints[playerName][i];
              break;
            }
          }

          if (!waypoint) {
            ctx.reply(`§cWaypoint '${name}' not found!`);
            return;
          }

          let playerInfo = api.getPlayer(playerName);
          let px = playerInfo.get ? playerInfo.get("x") : playerInfo.x;
          let py = playerInfo.get ? playerInfo.get("y") : playerInfo.y;
          let pz = playerInfo.get ? playerInfo.get("z") : playerInfo.z;
          let dist = distance(px, py, pz, waypoint.x, waypoint.y, waypoint.z);

          ctx.reply(`§6=== Waypoint: ${waypoint.name} ===`);
          ctx.reply(`§eLocation: §f${Math.floor(waypoint.x)}, ${Math.floor(waypoint.y)}, ${Math.floor(waypoint.z)}`);
          ctx.reply(`§eDimension: §f${waypoint.dimension}`);
          ctx.reply(`§eDistance: §f${Math.floor(dist)} blocks`);

          let created = new Date(waypoint.created);
          ctx.reply(`§eCreated: §f${created.toLocaleDateString()}`);

        // ----- LIST -----
        } else if (action === "list") {
          if (waypoints[playerName].length === 0) {
            ctx.reply("§cYou don't have any waypoints! Use §e/waypoint add <name>");
            return;
          }

          let playerInfo = api.getPlayer(playerName);
          let px = playerInfo.get ? playerInfo.get("x") : playerInfo.x;
          let py = playerInfo.get ? playerInfo.get("y") : playerInfo.y;
          let pz = playerInfo.get ? playerInfo.get("z") : playerInfo.z;
          ctx.reply(`§6=== Your Waypoints (${waypoints[playerName].length}) ===`);

          for (let i = 0; i < waypoints[playerName].length; i++) {
            let wp = waypoints[playerName][i];
            let dist = distance(px, py, pz, wp.x, wp.y, wp.z);
            ctx.reply(`§e${wp.name} §7- §f${Math.floor(dist)}m §7(${Math.floor(wp.x)}, ${Math.floor(wp.y)}, ${Math.floor(wp.z)})`);
          }

        } else {
          ctx.reply("§cUsage: /waypoint [add|remove|list|info] <name>");
        }
      }
    });

    api.log("§a✓ Waypoint mod loaded!");
  }
});
