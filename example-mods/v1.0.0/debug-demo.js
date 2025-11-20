// ============================================================================
// Debug Tools Mod - Development and Debugging Utilities
// ============================================================================
/**
 * This mod provides essential debugging tools for ThreadJS development.
 * 
 * Commands:
 *   /start_debugger [port]      - Start WebSocket debugger (default: 31337)
 *   /debug_local <true|false>   - Toggle debug log mirroring to chat
 *   /describe_me                - Dump your player state to debugger
 *   /inspect_api                - Print the API schema to log
 *   /list_players               - Describe all online players
 * 
 * Features Demonstrated:
 *   - WebSocket debugger integration
 *   - Runtime object inspection (api.describe)
 *   - Debug logging and state introspection
 *   - Optional command arguments
 *   - API schema reflection
 *   - Player state dumping
 * 
 * WebSocket Debugger:
 *   - Real-time log streaming to browser
 *   - Two-way communication (send commands from browser)
 *   - JSON message protocol
 *   - Default port: 31337 (configurable)
 *   - Client: Open docs/debugger-client.htm in browser
 * 
 * Use Cases:
 *   - Inspecting player data during development
 *   - Real-time log monitoring in browser
 *   - Understanding API structure
 *   - Debugging event handlers
 *   - Testing mod interactions
 * 
 * Example Workflow:
 *   1. /start_debugger          -> Start debugger on port 31337
 *   2. Open debugger-client.htm -> Connect browser to debugger
 *   3. /debug_local true        -> Mirror logs to your chat
 *   4. /describe_me             -> See your player data in debugger
 *   5. Run other commands       -> Watch logs in real-time
 */

api.registerMod("debug_tools", {
    onInitialize: function(api) {
        api.log("[debug-tools] Loading debugging utilities...");
        
        // ====================================================================
        // START_DEBUGGER COMMAND - /start_debugger [port]
        // ====================================================================
        // Demonstrates:
        //   - WebSocket server creation
        //   - Optional integer argument with default value
        //   - Port configuration
        //   - External tool integration
        //
        // The debugger creates a WebSocket server that streams all logs
        // and allows sending commands from a web browser. This is invaluable
        // for debugging complex mods without cluttering the game console.
        // ====================================================================
        api.registerCommand({
            command: "start_debugger",
            description: "Start WebSocket debugger server",
            args: [
                {type: "int", name: "port", hint: "31337", optional: true}
            ],
            execute: function(ctx) {
                var port = ctx.args.port || 31337;
                api.startDebugger(port);
                ctx.reply("§aDebugger started on ws://127.0.0.1:" + port + "/");
                ctx.reply("Open https://2lynk.github.io/ThreadJS/inspector.html in your browser to connect");
            }
        });
        
        // ====================================================================
        // DEBUG_LOCAL COMMAND - /debug_local <true|false>
        // ====================================================================
        // Demonstrates:
        //   - Boolean argument parsing
        //   - String-based hint suggestions
        //   - Debug log routing configuration
        //   - Player-specific settings
        //
        // When enabled, all api.log() and api.debug() calls will be mirrored
        // to your in-game chat. This is useful for debugging without alt-tabbing
        // to the console or debugger.
        // ====================================================================
        api.registerCommand({
            command: "debug_local",
            description: "Toggle debug log mirroring to your chat",
            args: [
                {type: "string", name: "enabled", hint: ["true", "false"]}
            ],
            execute: function(ctx) {
                var enabled = String(ctx.args.enabled) === "true";
                api.setDebugLocal(enabled, enabled, ctx.player);
                
                if (enabled) {
                    ctx.reply("§aDebug logs will now appear in your chat");
                } else {
                    ctx.reply("§7Debug logs disabled");
                }
            }
        });
        
        // ====================================================================
        // DESCRIBE_ME COMMAND - /describe_me
        // ====================================================================
        // Demonstrates:
        //   - No-argument command
        //   - Player object inspection
        //   - api.describe() usage
        //   - Debugging player state
        //
        // This dumps your complete player state to the debugger/log, including:
        //   - Position (x, y, z)
        //   - Health and hunger
        //   - Inventory contents
        //   - Active effects
        //   - Gamemode
        //   - And all other player properties
        // ====================================================================
        api.registerCommand({
            command: "describe_me",
            description: "Dump your complete player state to debugger/log",
            args: [],
            execute: function(ctx) {
                if (!ctx.player) {
                    ctx.reply("§cConsole has no player state");
                    return;
                }
                
                api.describe(ctx.player);
                ctx.reply("§aPlayer state dumped to debugger/log");
                ctx.reply("§7Check the console or WebSocket debugger to see details");
            }
        });
        
        // ====================================================================
        // INSPECT_API COMMAND - /inspect_api
        // ====================================================================
        // Demonstrates:
        //   - API schema reflection
        //   - api.inspect() usage
        //   - Method discovery
        //   - Development tooling
        //
        // This prints the complete API object structure to the log, showing
        // all available methods and their signatures. Useful for discovering
        // what methods are available and how to use them.
        // ====================================================================
        api.registerCommand({
            command: "inspect_api",
            description: "Print the complete API schema to the log",
            args: [],
            execute: function(ctx) {
                api.inspect(api);
                ctx.reply("§aAPI schema printed to log");
                ctx.reply("§7Check the console to see all available methods");
            }
        });
        
        // ====================================================================
        // LIST_PLAYERS COMMAND - /list_players
        // ====================================================================
        // Demonstrates:
        //   - Player listing
        //   - Collection iteration
        //   - api.describe() on arrays
        //   - Multiplayer debugging
        //
        // This describes all currently online players in the debugger/log,
        // showing their complete state. Useful for debugging multiplayer
        // interactions and player-specific issues.
        // ====================================================================
        api.registerCommand({
            command: "list_players",
            description: "Describe all online players in debugger/log",
            args: [],
            execute: function(ctx) {
                var players = api.listPlayers();
                api.describe(players);
                ctx.reply("§aDescribed " + players.length + " players in debugger/log");
                ctx.reply("§7Check the console or WebSocket debugger for player data");
            }
        });

        api.log("[debug-tools] Commands registered: start_debugger, debug_local, describe_me, inspect_api, list_players");
    }
});