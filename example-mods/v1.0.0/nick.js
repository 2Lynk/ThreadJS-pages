/**
 * Nick - Player nickname system
 *
 * Showcases:
 * - Data persistence for player preferences
 * - String manipulation
 * - Greedy string arguments
 * - Color code support
 *
 * Allows players to set custom display nicknames.
 */

/**
 * @typedef {Object} CommandContext
 * @property {Object} args - Parsed command arguments.
 * @property {string} [args.action] - Action (set, clear, list).
 * @property {string} [args.nickname] - The nickname to set.
 * @property {Object} player - Player object (if the sender is a player).
 * @property {string} playerName - Name of the sender/player.
 * @property {(msg:string)=>void} reply - Sends a chat message back to the sender.
 */

/**
 * @typedef {Object} APIMethods
 * @property {(msg:string)=>void} log - Log text to the server console.
 * @property {(key:string, defaultValue:any)=>any} loadData - Load saved JSON data.
 * @property {(key:string, value:any)=>void} saveData - Save JSON data.
 * @property {(cmd:Object)=>void} registerCommand - Register a new command.
 * @property {(id:string, implementation:Object)=>void} registerMod - Register a new JavaScript mod.
 */

/**
 * Registers the Nick mod.
 * @param {APIMethods} api - The Thread.JS modding API.
 */
api.registerMod("nick", {

  /**
   * Fired when the mod initializes.
   * Loads nickname data and registers the `/nick` command.
   *
   * @param {APIMethods} api - API instance provided on startup.
   */
  onInitialize(api) {
    api.log("§6[Nick] Loading Nick mod...");

    /** @type {Record<string, string>} - Maps player names to their nicknames */
    let nicknames = {};

    // Load nicknames
    let nicknamesRaw = api.loadData("nicknames", {});
    try {
      nicknames = JSON.parse(JSON.stringify(nicknamesRaw)) || {};
    } catch (e) {
      api.log("[Nick] Failed to parse nicknames: " + e);
      nicknames = {};
    }

    // Register /nick command
    api.registerCommand({
      command: "nick",
      description: "Set your display nickname",
      args: [
        { name: "action", type: "string", hint: ["set", "clear", "show"], optional: true },
        { name: "nickname", type: "greedy", hint: "<nickname>", optional: true }
      ],

      /**
       * Execute the /nick command.
       * Actions:
       * - set <nickname>: Set your nickname (supports color codes with &).
       * - clear: Remove your nickname.
       * - show: Display your current nickname.
       *
       * @param {CommandContext} ctx
       */
      execute: function(ctx) {
        if (!ctx.player) {
          ctx.reply("§cOnly players can use this command!");
          return;
        }

        let playerName = ctx.playerName;
        let action = ctx.args.action ? ctx.args.action.toLowerCase() : "show";

        // ----- SET -----
        if (action === "set") {
          if (!ctx.args.nickname) {
            ctx.reply("§cUsage: /nick set <nickname>");
            ctx.reply("§7Use & for color codes (e.g., &6Gold &bBlue)");
            return;
          }

          let nick = ctx.args.nickname;

          // Validate length
          if (nick.length > 32) {
            ctx.reply("§cNickname is too long! Max 32 characters.");
            return;
          }

          // Strip color codes for length check of actual text
          let plainText = nick.replace(/&[0-9a-fk-or]/gi, '');
          if (plainText.length < 3) {
            ctx.reply("§cNickname must be at least 3 characters (excluding color codes).");
            return;
          }

          // Convert & codes to § codes
          nick = nick.replace(/&([0-9a-fk-or])/gi, '§$1');

          nicknames[playerName] = nick;
          api.saveData("nicknames", nicknames);
          ctx.reply(`§aNickname set to: ${nick}`);

        // ----- CLEAR -----
        } else if (action === "clear") {
          if (!nicknames[playerName]) {
            ctx.reply("§cYou don't have a nickname set!");
            return;
          }

          delete nicknames[playerName];
          api.saveData("nicknames", nicknames);
          ctx.reply("§aNickname cleared!");

        // ----- SHOW -----
        } else if (action === "show") {
          if (!nicknames[playerName]) {
            ctx.reply("§cYou don't have a nickname set! Use §e/nick set <nickname>");
            return;
          }

          ctx.reply(`§eYour nickname: ${nicknames[playerName]}`);
          ctx.reply(`§7Real name: §f${playerName}`);

        } else {
          ctx.reply("§cUsage: /nick [set|clear|show]");
        }
      }
    });

    api.log("§a✓ Nick mod loaded!");
  }
});
