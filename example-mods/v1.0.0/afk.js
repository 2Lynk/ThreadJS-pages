/**
 * AFK - Away From Keyboard status tracker
 *
 * Showcases:
 * - Command event listening for activity detection
 * - Automatic status management
 * - Broadcast notifications
 * - Time-based logic
 *
 * Tracks player AFK status and broadcasts when players go AFK or return.
 */

/**
 * @typedef {Object} CommandContext
 * @property {Object} args - Parsed command arguments.
 * @property {Object} player - Player object (if the sender is a player).
 * @property {string} playerName - Name of the sender/player.
 * @property {(msg:string)=>void} reply - Sends a chat message back to the sender.
 */

/**
 * @typedef {Object} CommandEvent
 * @property {string} playerName - Name of the player who executed the command.
 * @property {string} command - The full command string.
 * @property {number} timestamp - Unix timestamp.
 */

/**
 * @typedef {Object} PlayerStatus
 * @property {boolean} isAFK - Whether the player is currently AFK.
 * @property {number} lastActivity - Unix timestamp of last activity.
 */

/**
 * @typedef {Object} APIMethods
 * @property {(msg:string)=>void} log - Log text to the server console.
 * @property {(msg:string)=>void} sendMessage - Broadcast message to all players.
 * @property {(callback:(event:CommandEvent)=>void)=>void} onCommandExecute - Listen for command events.
 * @property {(cmd:Object)=>void} registerCommand - Register a new command.
 * @property {(id:string, implementation:Object)=>void} registerMod - Register a new JavaScript mod.
 */

/**
 * Registers the AFK mod.
 * @param {APIMethods} api - The Thread.JS modding API.
 */
api.registerMod("afk", {

  /**
   * Fired when the mod initializes.
   * Sets up activity tracking and registers the `/afk` command.
   *
   * @param {APIMethods} api - API instance provided on startup.
   */
  onInitialize(api) {
    api.log("§6[AFK] Loading AFK mod...");

    /** @type {Record<string, PlayerStatus>} */
    let playerStatus = {};

    // Track activity via commands
    api.onCommandExecute(event => {
      let playerName = event.playerName;

      // Initialize if new player
      if (!playerStatus[playerName]) {
        playerStatus[playerName] = {
          isAFK: false,
          lastActivity: Date.now()
        };
        return;
      }

      // If player was AFK and just did something, they're back
      if (playerStatus[playerName].isAFK) {
        playerStatus[playerName].isAFK = false;
        playerStatus[playerName].lastActivity = Date.now();
        api.sendMessage(`§7${playerName} is no longer AFK`);
      } else {
        // Update last activity
        playerStatus[playerName].lastActivity = Date.now();
      }
    });

    // Register /afk command
    api.registerCommand({
      command: "afk",
      description: "Toggle AFK status",
      args: [],

      /**
       * Execute the /afk command.
       * Toggles the player's AFK status and broadcasts it.
       *
       * @param {CommandContext} ctx
       */
      execute: function(ctx) {
        if (!ctx.player) {
          ctx.reply("§cOnly players can use this command!");
          return;
        }

        let playerName = ctx.playerName;

        // Initialize if needed
        if (!playerStatus[playerName]) {
          playerStatus[playerName] = {
            isAFK: false,
            lastActivity: Date.now()
          };
        }

        // Toggle AFK status
        playerStatus[playerName].isAFK = !playerStatus[playerName].isAFK;
        playerStatus[playerName].lastActivity = Date.now();

        if (playerStatus[playerName].isAFK) {
          api.sendMessage(`§7${playerName} is now AFK`);
        } else {
          api.sendMessage(`§7${playerName} is no longer AFK`);
        }
      }
    });

    // Register /afklist command
    api.registerCommand({
      command: "afklist",
      description: "List all AFK players",
      args: [],

      /**
       * Execute the /afklist command.
       * Shows all currently AFK players.
       *
       * @param {CommandContext} ctx
       */
      execute: function(ctx) {
        let afkPlayers = [];
        for (let player in playerStatus) {
          if (playerStatus[player].isAFK) {
            afkPlayers.push(player);
          }
        }

        if (afkPlayers.length === 0) {
          ctx.reply("§7No players are currently AFK");
          return;
        }

        ctx.reply(`§6=== AFK Players (${afkPlayers.length}) ===`);
        for (let i = 0; i < afkPlayers.length; i++) {
          ctx.reply(`§7- §f${afkPlayers[i]}`);
        }
      }
    });

    api.log("§a✓ AFK mod loaded!");
  }
});
