// ============================================================================
// Designer Example Mod
// ============================================================================
// This mod was created using the ThreadJS Visual Designer!
//
// The visual designer allows you to create mods using a node-based interface,
// making it easy to build complex logic without writing code directly.
//
// How to use the designer:
//   1. Open docs/ThreadJS/designer.html in your browser
//   2. Select the node version from the version selector (v1.0.0-nodes)
//   3. Drag event nodes (Server Tick, Player Join, etc.) onto the canvas
//   4. Add action nodes (Send Message, Play Sound, etc.)
//   5. Connect nodes to create your logic flow
//   6. Click "Generate Code" and paste it into a .js file
//
// The designer uses versioned YAML files:
//   - versions/v1.0.0-nodes.yaml      - Node definitions (types, colors, params)
//   - versions/v1.0.0-variables.yaml  - Variable schemas for autocomplete
//   - versions/v1.0.0.yaml            - API reference documentation
//
// This example demonstrates:
//   - Welcome messages for joining players
//   - Event logging for block breaks
//   - Custom command with sound effects
// ============================================================================

api.registerMod("designer-example", {
  onInitialize(api) {
    api.log("Designer Example Mod Loaded! ✅");
    
    // Event: Player Join
    // Sends a personalized welcome message and plays a level-up sound
    api.onPlayerJoin(player => {
      api.sendMessageTo(player.name, "Welcome to the server, " + player.name + "!");
      api.playSound("entity.player.levelup", 1.0, 1.0);
    });
    
    // Event: Block Break
    // Logs detailed information about every block broken
    api.onBlockBreak(evt => {
      api.log("Block broken: " + evt.blockId + " at (" + evt.x + ", " + evt.y + ", " + evt.z + ") by " + evt.playerName);
    });
    
    // Command: /example
    // A simple command that sends a message and plays a sound
    api.registerCommand("example", (ctx, args) => {
      if (ctx.player) {
        api.sendMessageTo(ctx.player.name, "Example command executed!");
        api.playSoundTo(ctx.player.name, "entity.experience_orb.pickup", 1.0, 1.0);
      } else {
        api.log("Example command executed from console!");
      }
    });
  }
});
