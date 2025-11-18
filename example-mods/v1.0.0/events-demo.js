// ============================================================================
// Events Demo Mod
// ============================================================================
// Comprehensive demonstration of ALL available event hooks in ThreadJS
//
// WARNING: This mod is very verbose and will spam your logs!
// It's designed for learning and debugging - not for production use.
//
// Events demonstrated:
//   - onServerTick      - Every game tick (20/second)
//   - onPlayerTick      - Every tick per player
//   - onPlayerJoin      - When a player joins
//   - onPlayerLeave     - When a player disconnects
//   - onChatMessage     - When chat messages are sent
//   - onBlockBreak      - When blocks are broken
//   - onBlockPlace      - When blocks are placed
//   - onUseBlock        - When blocks are right-clicked
//   - onUseItem         - When items are used
//   - onAttackEntity    - When entities are attacked
//   - onEntityDamage    - When entities take damage
//   - onEntityDeath     - When entities die
//
// This mod showcases:
//   - All event handler signatures
//   - Event object properties
//   - Event logging best practices
//   - Chat command interception (the !shout example)
// ============================================================================

api.registerMod("events_demo", {
    onInitialize(api) {
        // Event: Server Tick
        // Fires every game tick (20 times per second)
        // NOTE: Logging every tick creates massive spam, so this is kept quiet
        api.onServerTick(() => {
            // Very noisy if you log every tick; we'll keep this quiet.
        });

        // Event: Player Tick
        // Fires every tick for each online player
        // Throttled here to only log occasionally (0.05% chance per tick)
        api.onPlayerTick(player => {
            // Example: occasionally log player position
            // (throttled to once every 100 ticks per player via random)
            if (Math.random() < 0.0005) {
                api.log(`[tick] ${player.name} is alive.`);
            }
        });

        // Event: Player Join
        // Fires when a player successfully joins the server
        api.onPlayerJoin(player => {
            api.sendMessage(`§a[ThreadJS] Welcome, ${player.name}!`);
        });

        // Event: Player Leave
        // Fires when a player disconnects from the server
        api.onPlayerLeave(player => {
            api.log(`[events-demo] ${player.name} left the server.`);
        });

        // Event: Chat Message
        // Fires when a player sends a chat message
        // Example: Intercept messages starting with "!shout" and broadcast them
        api.onChatMessage((message, player) => {
            if (message.startsWith("!shout ")) {
                const rest = message.substring("!shout ".length);
                api.sendMessage(`§e[SHOUT] ${player.name}: ${rest.toUpperCase()}`);
            }
        });

        // Event: Block Break
        // Fires when a player breaks a block
        // Provides: playerName, blockId, x, y, z, dimensionId
        api.onBlockBreak(event => {
            // event: BlockEvent (playerName, blockId, x, y, z, dimensionId)
            api.log(`[BlockBreak] ${event.playerName} broke ${event.blockId} at ${event.x},${event.y},${event.z}`);
        });

        // Event: Block Place
        // Fires when a player places a block
        api.onBlockPlace(event => {
            api.log(`[BlockPlace] ${event.playerName} placed ${event.blockId} at ${event.x},${event.y},${event.z}`);
        });

        // Event: Use Block
        // Fires when a player right-clicks/interacts with a block
        api.onUseBlock(event => {
            api.log(`[UseBlock] ${event.playerName} used block ${event.blockId} at ${event.x},${event.y},${event.z} with ${event.hand}`);
        });

        // Event: Use Item
        // Fires when a player uses/right-clicks with an item
        api.onUseItem(event => {
            api.log(`[UseItem] ${event.playerName} used ${event.itemId} x${event.itemCount} in ${event.dimensionId}`);
        });

        // Event: Attack Entity
        // Fires when a player attacks an entity
        api.onAttackEntity(event => {
            api.log(`[AttackEntity] ${event.playerName} attacked ${event.targetType} (${event.targetUuid}) in ${event.dimensionId}`);
        });

        // Event: Entity Damage
        // Fires when any entity takes damage
        api.onEntityDamage(event => {
            api.log(`[EntityDamage] ${event.victimType} took ${event.amount} by ${event.sourceType} in ${event.dimensionId}`);
        });

        // Event: Entity Death
        // Fires when any entity dies
        api.onEntityDeath(event => {
            api.log(`[EntityDeath] ${event.victimName} was killed by ${event.killedBy}`);
        });

        api.log("[events-demo] All event hooks registered.");
    }
});