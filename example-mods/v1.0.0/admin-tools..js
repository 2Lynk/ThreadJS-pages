// ============================================================================
// Admin Tools Mod
// ============================================================================
// Demonstrates admin-style commands and player manipulation APIs
//
// Commands:
//   /js heal_me              - Restore your health to full
//   /js heal <player> <amt>  - Heal a specific player by amount
//   /js tp_me <x> <y> <z>    - Teleport yourself to coordinates
//   /js gm <mode>            - Change your gamemode
//   /js kit                  - Get a basic starter kit
//
// This mod showcases:
//   - Player health manipulation
//   - Position and teleportation
//   - Gamemode changes
//   - Item giving
//   - Command argument parsing with type hints
// ============================================================================

api.registerMod("admin_tools", {
    onInitialize(api) {
        // Command: /js heal_me
        // Description: Restore your own health to maximum
        api.registerCommand("heal_me", (ctx, args) => {
            if (!ctx.player) {
                ctx.reply("Only players can use this.");
                return;
            }
            api.playerSetHealth(ctx.player, ctx.player.maxHealth);
            ctx.reply("You feel much better now.");
        });

        // Command: /js heal <player> <amount>
        // Description: Heal a specific player by the given amount
        // Arguments: player name (with tab completion), numeric amount
        // Example: /js heal Steve 10
        api.registerCommand("heal", (ctx, args) => {
            if (args.length < 2) {
                ctx.reply("Usage: /heal <player> <amount>");
                return;
            }
            const targetName = String(args[0]);
            const amount = Number(args[1]) || 0;
            
            api.log("Heal command: target=" + targetName + ", amount=" + amount);
            
            // Use the built-in helper that works with player names
            const success = api.heal(targetName, amount);
            
            api.log("Heal result: " + success);
            
            if (success) {
                ctx.reply(`Healed ${targetName} by ${amount} health.`);
            } else {
                ctx.reply("Player not found or heal failed: " + targetName);
            }
        }, 0, false, ["player", "int"]);

        // Command: /js tp_me <x> <y> <z>
        // Description: Teleport yourself to specific coordinates
        // Arguments: x, y, z coordinates (double precision)
        // Example: /js tp_me 100 64 -200
        api.registerCommand("tp_me", (ctx, args) => {
            if (!ctx.player) {
                ctx.reply("Only players can use this.");
                return;
            }
            if (args.length < 3) {
                ctx.reply("Usage: /js tp_me <x> <y> <z>");
                return;
            }
            const [xStr, yStr, zStr] = args;
            const [_, y, __] = ctx.player.pos;
            const x = Number(xStr) || ctx.player.pos[0];
            const yNew = Number(yStr) || y;
            const z = Number(zStr) || ctx.player.pos[2];

            api.playerSetPos(ctx.player, x, yNew, z);
            ctx.reply(`Teleported to ${x}, ${yNew}, ${z}.`);
        }, 0, false, ["double", "double", "double"]);

        // Command: /js gm <mode>
        // Description: Change your gamemode
        // Arguments: survival, creative, adventure, or spectator
        // Example: /js gm creative
        api.registerCommand("gm", (ctx, args) => {
            if (!ctx.player) {
                ctx.reply("Only players can use this.");
                return;
            }
            if (args.length < 1) {
                ctx.reply("Usage: /js gm <survival|creative|adventure|spectator>");
                return;
            }
            const mode = args[0].toUpperCase();
            api.playerSetGamemode(ctx.player, mode);
            ctx.reply("Gamemode changed (if permitted by server settings).");
        });

        // Command: /js kit
        // Description: Give yourself a basic starter kit (diamond sword + golden apples)
        api.registerCommand("kit", (ctx, args) => {
            if (!ctx.player) {
                ctx.reply("Only players can use this.");
                return;
            }
            api.playerGiveItem(ctx.player, "minecraft:diamond_sword", 1);
            api.playerGiveItem(ctx.player, "minecraft:golden_apple", 8);
            ctx.reply("Basic kit given.");
        });

        api.log("[admin-tools] Commands registered: heal_me, heal, tp_me, gm, kit");
    }
});