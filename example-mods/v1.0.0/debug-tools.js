// ============================================================================
// Debug Tools Mod
// ============================================================================
// Utilities for debugging ThreadJS mods using the WebSocket debugger
//
// Commands:
//   /start_debugger [port]      - Start WebSocket debugger (default: 31337)
//   /debug_local <true|false>   - Toggle debug log mirroring to chat
//   /describe_me                - Dump your player state to debugger
//   /inspect_api                - Print the API schema to log
//   /list_players               - Describe all online players
//
// This mod showcases:
//   - WebSocket debugger integration
//   - Runtime object inspection
//   - Debug logging and state introspection
//   - Optional command arguments
// ============================================================================

api.registerMod("debug_tools", {
    onInitialize(api) {
        // Command: /start_debugger [port]
        // Description: Start the WebSocket debugger server
        // Arguments: Optional port number (default: 31337)
        // Usage: Open examples/debugger-client.htm after running this
        api.registerCommand("start_debugger", (ctx, args) => {
            const port = args.length > 0 ? Number(args[0]) || 31337 : 31337;
            api.startDebugger(port);
            ctx.reply(`Debugger requested on ws://127.0.0.1:${port}/. Open debugger-client.htm.`);
        }, 0, false, ["int"]);

        // Command: /debug_local <true|false> [player]
        // Description: Toggle debug log mirroring to in-game chat
        // Arguments: true/false to enable/disable, optional player name
        api.registerCommand("debug_local", (ctx, args) => {
            if(args.length === 1 && args[0] === "true"){
                api.setDebugLocal(true, true, ctx.player);
                ctx.reply(`Debug logs will be mirrored your chat (and WebSocket).`);
            }else if(args.length === 1 && args[0] === "false") {
                api.setDebugLocal(false, false, ctx.player);
                ctx.reply(`Debug logs disabled.`);
            }

            if(args.length === 2 && args[1] === "true") {
                let target = args[0] || (ctx.player ? ctx.player.name : null);
                if (!target) {
                    ctx.reply("Usage: /debug_local [playerName]");
                    return;
                }
                api.setDebugLocal(true, true, target);
                ctx.reply(`Debug logs will be mirrored to ${target}'s chat (and WebSocket).`);
            }else{
                let target = args[0] || (ctx.player ? ctx.player.name : null);
                if (!target) {
                    ctx.reply("Usage: /debug_local [playerName]");
                    return;
                }
                api.setDebugLocal(false, false, target);
                ctx.reply(`Debug logs disabled.`);
            }
        });

        // Command: /describe_me
        // Description: Output your complete player state to the debugger/log
        api.registerCommand("describe_me", (ctx, args) => {
            if (!ctx.player) {
                ctx.reply("Console has no player state.");
                return;
            }
            api.describe(ctx.player);
            ctx.reply("Described your player state in the debugger/log.");
        });

        // Command: /inspect_api
        // Description: Print the complete API schema to the log for reference
        api.registerCommand("inspect_api", (ctx, args) => {
            api.inspect(api);
            ctx.reply("Printed api schema to the log.");
        });

        // Command: /list_players
        // Description: Describe all currently online players in the debugger/log
        api.registerCommand("list_players", (ctx, args) => {
            const players = api.listPlayers();
            api.describe(players);
            ctx.reply(`Described ${players.length} players in debugger/log.`);
        });

        api.log("[debug-tools] Commands registered: start_debugger, debug_local, describe_me, inspect_api, list_players");
    }
});