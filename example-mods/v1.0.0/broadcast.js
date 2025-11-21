/**
 * Broadcast - Scheduled server announcements
 *
 * Showcases:
 * - Message broadcasting
 * - Scheduled tasks (simulated with command)
 * - Color formatting
 * - Configuration storage
 *
 * This module manages a rotating list of broadcast messages that can be
 * sent to all players. Messages rotate automatically with each `/broadcast send`.
 */

/**
 * @typedef {Object} CommandContext
 * @property {Object} args - Parsed command arguments.
 * @property {string} [args.action] - The requested action (send, add, list, remove).
 * @property {string} [args.message] - Message content or number for add/remove actions.
 * @property {Object} player - Player object (if the sender is a player).
 * @property {string} playerName - Name of the sender/player.
 * @property {(msg:string)=>void} reply - Sends a chat message back to the sender.
 */

/**
 * @typedef {Object} BroadcastConfig
 * @property {string[]} messages - Array of broadcast messages.
 * @property {number} current - Index of the current message in rotation.
 */

/**
 * @typedef {Object} APIMethods
 * @property {(msg:string)=>void} log - Log text to the server console.
 * @property {(key:string, defaultValue:any)=>any} loadData - Load saved JSON data.
 * @property {(key:string, value:any)=>void} saveData - Save JSON data.
 * @property {(msg:string)=>void} sendMessage - Broadcast a message to all players.
 * @property {(cmd:Object)=>void} registerCommand - Register a new command.
 * @property {(id:string, implementation:Object)=>void} registerMod - Register a new JavaScript mod.
 */

/**
 * Registers the Broadcast mod.
 * @param {APIMethods} api - The Thread.JS modding API.
 */
api.registerMod("broadcast", {

  /**
   * Fired when the mod initializes.
   * Loads broadcast configuration and registers the `/broadcast` command.
   *
   * @param {APIMethods} api - API instance provided on startup.
   */
  onInitialize(api) {
    api.log("§6[Broadcast] Loading Broadcast mod...");

    /** @type {BroadcastConfig} */
    let config = {
      messages: [
        "§6Welcome to the server!",
        "§eUse §f/home set §eto save your location",
        "§eUse §f/kit §eto get starter items",
        "§eBe respectful to other players!"
      ],
      current: 0
    };

    // Load messages
    let messagesRaw = api.loadData("broadcast_messages", config);
    try {
      config = JSON.parse(JSON.stringify(messagesRaw)) || config;
    } catch (e) {
      api.log("[Broadcast] Failed to parse messages: " + e);
    }

    // Register /broadcast command
    api.registerCommand({
      command: "broadcast",
      description: "Manage server broadcast messages",
      args: [
        { name: "action", type: "string", hint: ["send", "add", "list", "remove"], optional: true },
        { name: "message", type: "greedy", hint: "<message>", optional: true }
      ],

      /**
       * Execute the /broadcast command.
       * Actions:
       * - send: Broadcast the next message in rotation.
       * - add <message>: Add a new broadcast message.
       * - list: Show all configured messages.
       * - remove <number>: Remove a message by its number.
       *
       * @param {CommandContext} ctx
       */
      execute: function(ctx) {
        let action = ctx.args.action ? ctx.args.action.toLowerCase() : "send";

        // ----- SEND -----
        if (action === "send") {
          if (config.messages.length === 0) {
            ctx.reply("§cNo broadcast messages configured!");
            return;
          }

          let message = config.messages[config.current];
          api.sendMessage(`§8[§6Broadcast§8] ${message}`);

          // Move to next message in rotation
          config.current = (config.current + 1) % config.messages.length;
          api.saveData("broadcast_messages", config);

        // ----- ADD -----
        } else if (action === "add") {
          if (!ctx.args.message) {
            ctx.reply("§cUsage: /broadcast add <message>");
            return;
          }

          config.messages.push(ctx.args.message);
          api.saveData("broadcast_messages", config);
          ctx.reply(`§aAdded broadcast message #${config.messages.length}`);

        // ----- LIST -----
        } else if (action === "list") {
          if (config.messages.length === 0) {
            ctx.reply("§cNo broadcast messages configured!");
            return;
          }

          ctx.reply("§6=== Broadcast Messages ===");
          for (let i = 0; i < config.messages.length; i++) {
            let prefix = (i === config.current) ? "§a>" : "§7 ";
            ctx.reply(`${prefix} §f${i + 1}. ${config.messages[i]}`);
          }

        // ----- REMOVE -----
        } else if (action === "remove") {
          if (!ctx.args.message) {
            ctx.reply("§cUsage: /broadcast remove <number>");
            return;
          }

          let index = parseInt(ctx.args.message) - 1;
          if (isNaN(index) || index < 0 || index >= config.messages.length) {
            ctx.reply("§cInvalid message number!");
            return;
          }

          config.messages.splice(index, 1);
          if (config.current >= config.messages.length) {
            config.current = 0;
          }
          api.saveData("broadcast_messages", config);
          ctx.reply(`§aRemoved broadcast message #${index + 1}`);

        } else {
          ctx.reply("§cUsage: /broadcast [send|add|list|remove]");
        }
      }
    });

    api.log("§a✓ Broadcast mod loaded!");
    api.sendMessage("§8[§6Broadcast§8] §aBroadcast system loaded! Use §f/broadcast send §ato announce.");
  }
});
