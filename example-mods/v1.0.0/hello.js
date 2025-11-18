// ============================================================================
// Hello World - Getting Started Template
// ============================================================================
// This is the simplest possible ThreadJS mod - a great starting point!
//
// This mod demonstrates:
//   - Basic mod structure with api.registerMod()
//   - The onInitialize() lifecycle hook
//   - Console logging with api.log()
//   - Commented examples of common event handlers
//
// To reload this mod after making changes:
//   1. Save this file
//   2. Run `/threadjs reload` in-game (or restart the server)
//
// Uncomment the example code below to try out different event handlers!
// ============================================================================

api.registerMod("hello", {
  onInitialize(api) {
    api.log("Hello from Thread.js! ✅");
    api.log("Edit this file and run '/threadjs reload' to see changes!");

    // ========================================================================
    // Example Event Handlers (uncomment to try them out)
    // ========================================================================
    
    // Server Tick - Runs every game tick (20 times per second)
    // api.onServerTick(() => {
    //   api.log("Server tick from JS");
    // });
    
    // Player Join - Runs when a player joins the server
    // api.onPlayerJoin(player => {
    //   api.log("Player joined: " + player.name);
    //   api.sendMessageTo(player.name, "§aWelcome to the server!");
    // });
    
    // Player Leave - Runs when a player leaves the server
    // api.onPlayerLeave(player => {
    //   api.log("Player left: " + player.name);
    // });
    
    // Chat Message - Runs when a player sends a chat message
    // api.onChatMessage((message, player) => {
    //   api.log("<" + player.name + "> " + message);
    //   // Return false to cancel the message
    // });
    
    // Block Break - Runs when a player breaks a block
    // api.onBlockBreak(event => {
    //   api.log("[BlockBreak] " + event.blockId + " at (" + event.x + ", " + event.y + ", " + event.z + ")");
    // });
    
    // Use Item - Runs when a player uses/right-clicks an item
    // api.onUseItem(event => {
    //   api.log("[UseItem] " + event.itemId);
    // });
    
    // Attack Entity - Runs when a player attacks an entity
    // api.onAttackEntity(event => {
    //   api.log("[AttackEntity] " + event.playerName + " attacked " + event.targetType);
    // });
  }
});
