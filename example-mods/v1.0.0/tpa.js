/**
 * TPA - Teleport request system
 *
 * Showcases:
 * - Request/accept pattern
 * - Temporary data storage
 * - Message sending to specific players
 * - Teleportation between players
 * - Timeout handling
 *
 * Players can request to teleport to others with `/tpa`, and accept with `/tpaccept`.
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
 * @typedef {Object} TeleportRequest
 * @property {string} from - Player requesting to teleport.
 * @property {string} to - Player receiving the request.
 * @property {number} timestamp - When the request was made.
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
 * @property {(name:string)=>PlayerInfo|Map} getPlayer - Get all data for a player.
 * @property {(player:string, x:number, y:number, z:number, dimension:string)=>void} teleportPlayer - Teleport a player.
 * @property {(player:string, msg:string)=>void} sendMessageTo - Send message to specific player.
 * @property {(particle:string, x:number, y:number, z:number, count:number)=>void} spawnParticle - Spawn particles.
 * @property {(sound:string, x:number, y:number, z:number, volume:number, pitch:number)=>void} playSound - Play a sound.
 * @property {(cmd:Object)=>void} registerCommand - Register a new command.
 * @property {(id:string, implementation:Object)=>void} registerMod - Register a new JavaScript mod.
 */

/**
 * Registers the TPA mod.
 * @param {APIMethods} api - The Thread.JS modding API.
 */
api.registerMod("tpa", {

  /**
   * Fired when the mod initializes.
   * Sets up teleport request tracking and registers commands.
   *
   * @param {APIMethods} api - API instance provided on startup.
   */
  onInitialize(api) {
    api.log("§6[TPA] Loading TPA mod...");

    /** @type {Record<string, TeleportRequest>} - Maps receiver names to pending requests */
    let pendingRequests = {};

    // Request timeout (60 seconds)
    const REQUEST_TIMEOUT = 60000;

    // Register /tpa command
    api.registerCommand({
      command: "tpa",
      description: "Request to teleport to another player",
      args: [
        { name: "target", type: "player", hint: "<player>", optional: false }
      ],

      /**
       * Execute the /tpa command.
       * Sends a teleport request to the target player.
       *
       * @param {CommandContext} ctx
       */
      execute: function(ctx) {
        if (!ctx.player) {
          ctx.reply("§cOnly players can use this command!");
          return;
        }

        if (!ctx.args.target) {
          ctx.reply("§cUsage: /tpa <player>");
          return;
        }

        let sender = ctx.playerName;
        let target = ctx.args.target;

        // Can't teleport to yourself
        if (sender === target) {
          ctx.reply("§cYou can't teleport to yourself!");
          return;
        }

        // Check if target exists
        let targetInfo = api.getPlayer(target);
        if (!targetInfo) {
          ctx.reply(`§cPlayer '${target}' not found!`);
          return;
        }

        // Check if there's already a pending request
        if (pendingRequests[target]) {
          let existing = pendingRequests[target];
          if (Date.now() - existing.timestamp < REQUEST_TIMEOUT) {
            ctx.reply(`§c${target} already has a pending request from ${existing.from}!`);
            return;
          }
        }

        // Create request
        pendingRequests[target] = {
          from: sender,
          to: target,
          timestamp: Date.now()
        };

        ctx.reply(`§aTeleport request sent to ${target}!`);
        api.sendMessageTo(target, `§6${sender} §ewants to teleport to you. Use §f/tpaccept §eto accept!`);
      }
    });

    // Register /tpaccept command
    api.registerCommand({
      command: "tpaccept",
      description: "Accept a teleport request",
      args: [],

      /**
       * Execute the /tpaccept command.
       * Accepts and processes a pending teleport request.
       *
       * @param {CommandContext} ctx
       */
      execute: function(ctx) {
        if (!ctx.player) {
          ctx.reply("§cOnly players can use this command!");
          return;
        }

        let receiver = ctx.playerName;

        // Check if there's a pending request
        if (!pendingRequests[receiver]) {
          ctx.reply("§cYou don't have any pending teleport requests!");
          return;
        }

        let request = pendingRequests[receiver];

        // Check if request expired
        if (Date.now() - request.timestamp > REQUEST_TIMEOUT) {
          delete pendingRequests[receiver];
          ctx.reply("§cThe teleport request has expired!");
          return;
        }

        // Get locations
        let senderInfo = api.getPlayer(request.from);
        if (!senderInfo) {
          delete pendingRequests[receiver];
          ctx.reply(`§c${request.from} is no longer online!`);
          return;
        }

        let receiverInfo = api.getPlayer(receiver);
        let rx = receiverInfo.get ? receiverInfo.get("x") : receiverInfo.x;
        let ry = receiverInfo.get ? receiverInfo.get("y") : receiverInfo.y;
        let rz = receiverInfo.get ? receiverInfo.get("z") : receiverInfo.z;
        let rdim = receiverInfo.get ? receiverInfo.get("dimensionId") : receiverInfo.dimensionId;

        // Teleport sender to receiver
        api.teleportPlayer(request.from, rx, ry, rz, rdim);

        // Effects at destination
        api.spawnParticle("minecraft:portal", rx, ry + 1, rz, 50);
        api.playSound("minecraft:entity.enderman.teleport", rx, ry, rz, 1.0, 1.0);

        // Notify both players
        api.sendMessageTo(request.from, `§aTeleported to ${receiver}!`);
        ctx.reply(`§a${request.from} has been teleported to you!`);

        // Clear request
        delete pendingRequests[receiver];
      }
    });

    // Register /tpdeny command
    api.registerCommand({
      command: "tpdeny",
      description: "Deny a teleport request",
      args: [],

      /**
       * Execute the /tpdeny command.
       * Denies a pending teleport request.
       *
       * @param {CommandContext} ctx
       */
      execute: function(ctx) {
        if (!ctx.player) {
          ctx.reply("§cOnly players can use this command!");
          return;
        }

        let receiver = ctx.playerName;

        if (!pendingRequests[receiver]) {
          ctx.reply("§cYou don't have any pending teleport requests!");
          return;
        }

        let request = pendingRequests[receiver];
        api.sendMessageTo(request.from, `§c${receiver} denied your teleport request.`);
        ctx.reply(`§aDenied teleport request from ${request.from}.`);

        delete pendingRequests[receiver];
      }
    });

    api.log("§a✓ TPA mod loaded!");
  }
});
