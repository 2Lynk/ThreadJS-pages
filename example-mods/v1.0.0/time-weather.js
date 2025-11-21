/**
 * Time & Weather - Control world time and weather
 *
 * Showcases:
 * - World manipulation (time, weather)
 * - Multiple commands in one mod
 * - Command execution as server
 * - Number arguments
 *
 * Provides convenient commands for time and weather control.
 */

/**
 * @typedef {Object} CommandContext
 * @property {Object} args - Parsed command arguments.
 * @property {string} [args.preset] - Time preset name.
 * @property {number} [args.ticks] - Time in ticks.
 * @property {string} [args.type] - Weather type.
 * @property {Object} player - Player object (if the sender is a player).
 * @property {string} playerName - Name of the sender/player.
 * @property {(msg:string)=>void} reply - Sends a chat message back to the sender.
 */

/**
 * @typedef {Object} APIMethods
 * @property {(msg:string)=>void} log - Log text to the server console.
 * @property {(command:string)=>void} executeCommand - Execute a Minecraft command as server.
 * @property {(cmd:Object)=>void} registerCommand - Register a new command.
 * @property {(id:string, implementation:Object)=>void} registerMod - Register a new JavaScript mod.
 */

/**
 * Registers the Time & Weather mod.
 * @param {APIMethods} api - The Thread.JS modding API.
 */
api.registerMod("time-weather", {

  /**
   * Fired when the mod initializes.
   * Registers `/day`, `/night`, `/noon`, and `/weather` commands.
   *
   * @param {APIMethods} api - API instance provided on startup.
   */
  onInitialize(api) {
    api.log("§6[TimeWeather] Loading Time & Weather mod...");

    // Register /day command
    api.registerCommand({
      command: "day",
      description: "Set time to day (1000 ticks)",
      requiresOp: true,
      permissionLevel: 2,
      args: [],

      /**
       * Execute the /day command.
       * @param {CommandContext} ctx
       */
      execute: function(ctx) {
        api.executeCommand("time set 1000");
        ctx.reply("§aTime set to day!");
      }
    });

    // Register /night command
    api.registerCommand({
      command: "night",
      description: "Set time to night (13000 ticks)",
      requiresOp: true,
      permissionLevel: 2,
      args: [],

      /**
       * Execute the /night command.
       * @param {CommandContext} ctx
       */
      execute: function(ctx) {
        api.executeCommand("time set 13000");
        ctx.reply("§aTime set to night!");
      }
    });

    // Register /noon command
    api.registerCommand({
      command: "noon",
      description: "Set time to noon (6000 ticks)",
      requiresOp: true,
      permissionLevel: 2,
      args: [],

      /**
       * Execute the /noon command.
       * @param {CommandContext} ctx
       */
      execute: function(ctx) {
        api.executeCommand("time set 6000");
        ctx.reply("§aTime set to noon!");
      }
    });

    // Register /weather command
    api.registerCommand({
      command: "weather",
      description: "Change weather",
      requiresOp: true,
      permissionLevel: 2,
      args: [
        { name: "type", type: "string", hint: ["clear", "rain", "thunder"], optional: false }
      ],

      /**
       * Execute the /weather command.
       * @param {CommandContext} ctx
       */
      execute: function(ctx) {
        if (!ctx.args.type) {
          ctx.reply("§cUsage: /weather <clear|rain|thunder>");
          return;
        }

        let type = ctx.args.type.toLowerCase();
        if (type !== "clear" && type !== "rain" && type !== "thunder") {
          ctx.reply("§cInvalid weather type! Use: clear, rain, or thunder");
          return;
        }

        api.executeCommand(`weather ${type}`);
        ctx.reply(`§aWeather set to ${type}!`);
      }
    });

    api.log("§a✓ Time & Weather mod loaded!");
  }
});
