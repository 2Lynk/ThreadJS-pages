/**
 * MOTD - Message of the Day
 *
 * Showcases:
 * - Player join event listening
 * - Delayed message sending
 * - Configuration management
 * - Multi-line messages
 *
 * Displays a configurable message to players when they join the server.
 */

/**
 * @typedef {Object} CommandContext
 * @property {Object} args - Parsed command arguments.
 * @property {string} [args.action] - Action (set, clear, show, add).
 * @property {string} [args.message] - Message line to add.
 * @property {Object} player - Player object (if the sender is a player).
 * @property {string} playerName - Name of the sender/player.
 * @property {(msg:string)=>void} reply - Sends a chat message back to the sender.
 */

/**
 * @typedef {Object} PlayerEvent
 * @property {string} playerName - Name of the player who joined/left.
 * @property {number} timestamp - Unix timestamp.
 */

/**
 * @typedef {Object} APIMethods
 * @property {(msg:string)=>void} log - Log text to the server console.
 * @property {(key:string, defaultValue:any)=>any} loadData - Load saved JSON data.
 * @property {(key:string, value:any)=>void} saveData - Save JSON data.
 * @property {(player:string, msg:string)=>void} sendMessageTo - Send message to player.
 * @property {(callback:(event:PlayerEvent)=>void)=>void} onPlayerJoin - Listen for player join events.
 * @property {(cmd:Object)=>void} registerCommand - Register a new command.
 * @property {(id:string, implementation:Object)=>void} registerMod - Register a new JavaScript mod.
 */

/**
 * Registers the MOTD mod.
 * @param {APIMethods} api - The Thread.JS modding API.
 */
api.registerMod("motd", {

  /**
   * Fired when the mod initializes.
   * Loads MOTD configuration and sets up join listener.
   *
   * @param {APIMethods} api - API instance provided on startup.
   */
  onInitialize(api) {
    api.log("§6[MOTD] Loading MOTD mod...");

    /** @type {string[]} - Message lines to display */
    let motdLines = [
      "§6§l=== Welcome to the Server! ===",
      "§eType §f/help §efor a list of commands",
      "§eUse §f/home set §eto save your location",
      "§eHave fun and be respectful!"
    ];

    // Load MOTD
    let motdRaw = api.loadData("motd", motdLines);
    try {
      motdLines = JSON.parse(JSON.stringify(motdRaw)) || motdLines;
      if (!Array.isArray(motdLines)) {
        motdLines = [motdLines.toString()];
      }
    } catch (e) {
      api.log("[MOTD] Failed to parse MOTD: " + e);
    }

    // Show MOTD on player join
    api.onPlayerJoin(event => {
      let playerName = event.playerName;

      // Send each line with a small delay
      for (let i = 0; i < motdLines.length; i++) {
        api.sendMessageTo(playerName, motdLines[i]);
      }
    });

    // Register /motd command (admin only)
    api.registerCommand({
      command: "motd",
      description: "Manage message of the day",
      requiresOp: true,
      permissionLevel: 2,
      args: [
        { name: "action", type: "string", hint: ["show", "add", "clear", "remove"], optional: true },
        { name: "message", type: "greedy", hint: "<message or line number>", optional: true }
      ],

      /**
       * Execute the /motd command.
       * Actions:
       * - show: Display current MOTD.
       * - add <message>: Add a new line to MOTD.
       * - remove <number>: Remove a line by number.
       * - clear: Clear all MOTD lines.
       *
       * @param {CommandContext} ctx
       */
      execute: function(ctx) {
        let action = ctx.args.action ? ctx.args.action.toLowerCase() : "show";

        // ----- SHOW -----
        if (action === "show") {
          if (motdLines.length === 0) {
            ctx.reply("§cNo MOTD configured!");
            return;
          }

          ctx.reply("§6=== Current MOTD ===");
          for (let i = 0; i < motdLines.length; i++) {
            ctx.reply(`§7${i + 1}. §r${motdLines[i]}`);
          }

        // ----- ADD -----
        } else if (action === "add") {
          if (!ctx.args.message) {
            ctx.reply("§cUsage: /motd add <message>");
            return;
          }

          motdLines.push(ctx.args.message);
          api.saveData("motd", motdLines);
          ctx.reply(`§aAdded line ${motdLines.length} to MOTD`);

        // ----- REMOVE -----
        } else if (action === "remove") {
          if (!ctx.args.message) {
            ctx.reply("§cUsage: /motd remove <line number>");
            return;
          }

          let lineNum = parseInt(ctx.args.message);
          if (isNaN(lineNum) || lineNum < 1 || lineNum > motdLines.length) {
            ctx.reply(`§cInvalid line number! Use 1-${motdLines.length}`);
            return;
          }

          motdLines.splice(lineNum - 1, 1);
          api.saveData("motd", motdLines);
          ctx.reply(`§aRemoved line ${lineNum} from MOTD`);

        // ----- CLEAR -----
        } else if (action === "clear") {
          motdLines = [];
          api.saveData("motd", motdLines);
          ctx.reply("§aMOTD cleared!");

        } else {
          ctx.reply("§cUsage: /motd [show|add|remove|clear]");
        }
      }
    });

    api.log("§a✓ MOTD mod loaded!");
  }
});
