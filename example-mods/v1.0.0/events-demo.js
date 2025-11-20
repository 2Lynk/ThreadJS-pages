// ============================================================================
// Events Demo - Event Handlers and Custom Commands
// ============================================================================
// This mod demonstrates the COMPLETE event system with practical examples:
//   - ALL 25+ working event types
//   - Event object properties and structure
//   - Persistent data storage with api.saveData/loadData
//   - Event cancellation (return true to cancel)
//   - Custom command integration
//   - Player statistics tracking
//
// PRACTICAL FEATURES DEMONSTRATED:
//   1. Welcome/goodbye messages (onPlayerJoin, onPlayerLeave)
//   2. Chat monitoring and logging (onChatMessage)
//   3. Block break statistics tracking (onBlockBreak + data storage)
//   4. Death counter with persistent storage (onEntityDeath)
//   5. Custom /shout command (registerCommand)
//   6. Custom /stats command to view your statistics
//
// DATA STORAGE:
//   - Block breaks: data/block_breaks/<player>.json
//   - Death counts: data/death_counts/<player>.json
//   - All data persists between server restarts
//
// Commands:
//   /shout <message> - Broadcast message in bold caps
//   /stats - View your block breaks and death count
//
// Features:
//   - Welcome messages for joining players
//   - Goodbye messages for leaving players
//   - Chat message transformation (try saying "hello")
//   - Block break statistics stored per player
//   - Death tracking and reporting
//
// Example Usage:
//   /shout Hello everyone!   - Sends "§6[SHOUT] §f§lHELLO EVERYONE!"
//   Type "hello" in chat    - Auto-responds with greeting
//   Break blocks             - Automatically tracked
//
// Data Storage:
//   Block breaks are saved to: data/block_breaks/<player>.json
//   Persists between server restarts
// ============================================================================
//
// WARNING: This mod is very verbose and will spam your logs!
// It's designed for learning and debugging - not for production use.
//
// Events demonstrated - 25 WORKING EVENTS:
//   - onServerTick           - Every game tick (20/second)
//   - onPlayerTick           - Every tick per player
//   - onPlayerJoin           - When a player joins
//   - onPlayerLeave          - When a player disconnects
//   - onChatMessage          - When chat messages are sent (cancellable)
//   - onBlockBreak           - When blocks are broken
//   - onBlockPlace           - When blocks are placed
//   - onUseBlock             - When blocks are right-clicked
//   - onUseItem              - When items are used
//   - onAttackEntity         - When entities are attacked
//   - onEntityDeath          - When entities die
//   - onEntityDamage         - When entities take damage
//   - onItemDrop             - When items are dropped
//   - onPlayerLevelUp        - When players level up
//   - onPlayerRespawn        - When players respawn
//   - onWeatherChange        - When weather changes
//   - onItemPickup           - When items are picked up
//   - onItemCraft            - When items are crafted
//   - onEntitySpawn          - When entities spawn
//   - onProjectileHit        - When projectiles hit
//   - onPortalUse            - When portals are used
//   - onContainerOpen        - When containers are opened
//   - onContainerClose       - When containers are closed
//   - onCommandExecute       - When commands are executed
//
// This mod showcases:
//   - All event handler signatures
//   - Event object properties
//   - Event logging best practices
//   - Chat command interception (the !shout example)
// ============================================================================

api.registerMod("events_demo", {
    onInitialize(api) {
        api.log("[events-demo] Initializing comprehensive event demonstration mod...");
        
        // ====================================================================
        // CUSTOM COMMANDS THAT DEMONSTRATE DATA STORAGE
        // ====================================================================
        
        // /shout command - Demonstrates greedy string arguments
        api.registerCommand({
            command: "shout",
            description: "Shout a message to everyone",
            args: [
                {name: "message", type: "greedy", hint: "Message to shout"}
            ],
            execute: function(ctx) {
                var playerName = ctx.player.getName().getString();
                var message = ctx.args.message;
                api.sendMessage("§6[SHOUT] " + playerName + ": §f§l" + message.toUpperCase());
                api.log("[Shout] " + playerName + " shouted: " + message);
            }
        });
        
        // /stats command - Demonstrates data loading and player statistics
        api.registerCommand({
            command: "stats",
            description: "View your statistics",
            args: [],
            execute: function(ctx) {
                var playerName = ctx.player.getName().getString();
                
                // Load block break stats
                var blockStats = api.loadData("block_breaks/" + playerName, {total: 0});
                
                // Load death count
                var deathData = api.loadData("death_counts/" + playerName, {deaths: 0});
                
                ctx.reply("§e=== Your Statistics ===");
                ctx.reply("§7Blocks broken: §f" + blockStats.total);
                ctx.reply("§7Deaths: §c" + deathData.deaths);
                
                api.log("[Stats] " + playerName + " checked stats: " + blockStats.total + " blocks, " + deathData.deaths + " deaths");
            }
        });
        
        // ====================================================================
        // EVENT HANDLERS - ALL 25+ WORKING EVENTS
        // ====================================================================

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
        // DEMONSTRATES: Welcome messages, player tracking initialization
        api.onPlayerJoin(player => {
            api.sendMessage("§a[ThreadJS] Welcome, " + player.name + "!");
            api.log("[Join] " + player.name + " joined the server");
            
            // Initialize player data if first time joining
            var playerData = api.loadData("block_breaks/" + player.name, null);
            if (!playerData) {
                api.saveData("block_breaks/" + player.name, {total: 0, types: {}});
                api.log("[Init] Created new stats for " + player.name);
            }
        });

        // Event: Player Leave
        // Fires when a player disconnects from the server
        // DEMONSTRATES: Cleanup, logging
        api.onPlayerLeave(player => {
            api.sendMessage("§c" + player.name + " left the server");
            api.log("[Leave] " + player.name + " disconnected");
        });

        // Event: Chat Message
        // Fires when a player sends a chat message
        // DEMONSTRATES: Chat monitoring (commands now use registerCommand instead)
        api.onChatMessage((message, playerName) => {
            // Log non-command chat messages
            if (!message.startsWith("/")) {
                api.log("[Chat] " + playerName + ": " + message);
                
                // Example: Auto-response to specific messages
                if (message.toLowerCase().includes("hello")) {
                    api.sendMessage("§e" + playerName + " says hello! Everyone say hi!");
                }
            }
            return false; // false = allow message, true = cancel message
        });

        // Event: Block Break
        // Fires when a player breaks a block
        // DEMONSTRATES: Persistent data storage, statistics tracking
        api.onBlockBreak(event => {
            api.log("[BlockBreak] " + event.playerName + " broke " + event.blockId + " at " + event.x + "," + event.y + "," + event.z);

            // Track block breaks per player
            var stats = api.loadData("block_breaks/" + event.playerName, {total: 0, types: {}});
            // Convert to JS object if needed
            if (typeof stats === "object" && stats !== null && typeof Java !== "undefined" && stats.getClass && String(stats.getClass()) === "class com.google.gson.internal.LinkedTreeMap") {
                stats = JSON.parse(JSON.stringify(stats));
            }
            stats.total = (stats.total || 0) + 1;

            // Track by block type
            if (!stats.types) stats.types = {};
            stats.types[event.blockId] = (stats.types[event.blockId] || 0) + 1;

            api.saveData("block_breaks/" + event.playerName, stats);

            // Milestone notifications
            if (stats.total === 100) {
                api.sendMessage("§e" + event.playerName + " has broken 100 blocks!");
            } else if (stats.total === 1000) {
                api.sendMessage("§6" + event.playerName + " has broken 1,000 blocks!");
            }
        });

        // Event: Block Place
        // Fires when a player places a block
        api.onBlockPlace(event => {
            api.log(`[BlockPlace] ${event.playerName} placed ${event.blockId} at ${event.x},${event.y},${event.z} in ${event.dimensionId} @ ${event.timeOfEvent}`);
            
            // Special logging for containers
            if (event.blockId.includes("chest") || event.blockId.includes("barrel") || 
                event.blockId.includes("shulker_box") || event.blockId.includes("furnace") || 
                event.blockId.includes("hopper") || event.blockId.includes("dispenser") || 
                event.blockId.includes("dropper")) {
                api.log(`[Container Placed] ${event.playerName} placed container ${event.blockId} at ${event.x},${event.y},${event.z}`);
            }
        });

        // Event: Use Block
        // Fires when a player right-clicks/interacts with a block
        api.onUseBlock(event => {
            api.log(`[UseBlock] ${event.playerName} used block ${event.blockId} at ${event.x},${event.y},${event.z} with ${event.hand} in ${event.dimensionId} @ ${event.timeOfEvent}`);
        });

        // Event: Use Item
        // Fires when a player uses/right-clicks with an item
        api.onUseItem(event => {
            api.log(`[UseItem] ${event.playerName} used ${event.itemId} x${event.itemCount} at ${Math.round(event.x)},${Math.round(event.y)},${Math.round(event.z)} in ${event.dimensionId} @ ${event.timeOfEvent}`);
        });

        // Event: Attack Entity
        // Fires when a player attacks an entity
        api.onAttackEntity(event => {
            api.log(`[AttackEntity] ${event.playerName} attacked ${event.targetName} (${event.targetType}) at ${Math.round(event.x)},${Math.round(event.y)},${Math.round(event.z)} in ${event.dimensionId} @ ${event.timeOfEvent}`);
        });

        // Event: Entity Death
        // Fires when any entity dies
        // DEMONSTRATES: Death tracking, persistent counters
        api.onEntityDeath(event => {
            api.log("[EntityDeath] " + event.victimName + " (" + event.victimType + ") killed by " + event.killedBy);
            
            // Track player deaths
            if (event.victimType.includes("player")) {
                var deathData = api.loadData("death_counts/" + event.victimName, {deaths: 0, causes: {}});
                deathData.deaths = (deathData.deaths || 0) + 1;
                
                // Track death causes
                if (!deathData.causes) deathData.causes = {};
                deathData.causes[event.killedBy] = (deathData.causes[event.killedBy] || 0) + 1;
                
                api.saveData("death_counts/" + event.victimName, deathData);
                
                api.sendMessage("§c" + event.victimName + " died! (Total deaths: " + deathData.deaths + ")");
            }
        });

        // Event: Entity Damage
        // Fires when any entity takes damage
        api.onEntityDamage(event => {
            api.log(`[EntityDamage] ${event.victimName} (${event.victimType}) took ${event.amount.toFixed(1)} damage from ${event.sourceType} at ${Math.round(event.x)},${Math.round(event.y)},${Math.round(event.z)} in ${event.dimensionId} @ ${event.timeOfEvent}`);
        });

        // Event: Item Drop
        // Fires when a player drops an item
        api.onItemDrop(event => {
            api.log(`[ItemDrop] ${event.playerName} dropped ${event.itemId} x${event.count} at ${Math.round(event.x)},${Math.round(event.y)},${Math.round(event.z)} in ${event.dimensionId} @ ${event.timeOfEvent}`);
        });

        // Event: Player Level Up
        // Fires when a player gains experience levels
        api.onPlayerLevelUp(event => {
            api.log(`[LevelUp] ${event.playerName} reached level ${event.newLevel} (was ${event.oldLevel}) at ${Math.round(event.x)},${Math.round(event.y)},${Math.round(event.z)} in ${event.dimensionId} @ ${event.timeOfEvent}`);
        });

        // Event: Player Respawn
        // Fires when a player respawns
        api.onPlayerRespawn(event => {
            api.log(`[PlayerRespawn] ${event.playerName} respawned at ${Math.round(event.x)},${Math.round(event.y)},${Math.round(event.z)} in ${event.dimensionId} @ ${event.timeOfEvent}`);
        });

        // Event: Weather Change
        // Fires when weather changes
        api.onWeatherChange(event => {
            const weather = event.thundering ? "thundering" : (event.raining ? "raining" : "clear");
            api.log(`[WeatherChange] Weather changed to ${weather} in ${event.dimensionId} @ ${event.timeOfEvent}`);
        });

        // Event: Item Pickup
        // Fires when a player picks up an item
        api.onItemPickup(event => {
            api.log(`[ItemPickup] ${event.playerName} picked up ${event.itemId} x${event.count} at ${Math.round(event.x)},${Math.round(event.y)},${Math.round(event.z)} in ${event.dimensionId} @ ${event.timeOfEvent}`);
        });

        // Event: Item Craft
        // Fires when a player crafts an item
        api.onItemCraft(event => {
            api.log(`[ItemCraft] ${event.playerName} crafted ${event.itemId} x${event.count} at ${Math.round(event.x)},${Math.round(event.y)},${Math.round(event.z)} in ${event.dimensionId} @ ${event.timeOfEvent}`);
        });

        // Event: Entity Spawn
        // Fires when entities spawn
        api.onEntitySpawn(event => {
            api.log(`[EntitySpawn] ${event.entityType} spawned at ${Math.round(event.x)},${Math.round(event.y)},${Math.round(event.z)} in ${event.dimensionId} (${event.spawnReason}) @ ${event.timeOfEvent}`);
        });

        // Event: Projectile Hit
        // Fires when projectiles hit something
        api.onProjectileHit(event => {
            api.log(`[ProjectileHit] ${event.projectileType} shot by ${event.shooterName} hit ${event.hitEntityName} (${event.hitType}) at ${Math.round(event.x)},${Math.round(event.y)},${Math.round(event.z)} in ${event.dimensionId} @ ${event.timeOfEvent}`);
        });

        // Event: Portal Use
        // Fires when a player uses a portal
        api.onPortalUse(event => {
            api.log(`[PortalUse] ${event.playerName} used portal at ${event.x},${event.y},${event.z} in ${event.dimensionId} @ ${event.timeOfEvent}`);
        });

        // Event: Container Open
        // Fires when a player opens a container (chest, furnace, etc.)
        api.onContainerOpen(event => {
            api.log(`[ContainerOpen] ${event.playerName} opened ${event.containerType} at ${event.x},${event.y},${event.z} in ${event.dimensionId} @ ${event.timeOfEvent}`);
        });

        // Event: Container Close
        // Fires when a player closes a container
        api.onContainerClose(event => {
            api.log(`[ContainerClose] ${event.playerName} closed ${event.containerType} at ${event.x},${event.y},${event.z} in ${event.dimensionId} @ ${event.timeOfEvent}`);
        });

        // Event: Command Execute
        // Fires when a player executes a command
        api.onCommandExecute(event => {
            api.log(`[CommandExecute] ${event.playerName} executed: ${event.command} at ${Math.round(event.x)},${Math.round(event.y)},${Math.round(event.z)} in ${event.dimensionId} @ ${event.timeOfEvent}`);
        });

        // Event: Player Change Dimension
        // Fires when a player changes dimensions (e.g., entering the Nether or End)
        api.onPlayerChangeDimension(event => {
            api.log(`[DimensionChange] ${event.playerName} traveled from ${event.fromDimension} to ${event.toDimension} at ${Math.round(event.x)},${Math.round(event.y)},${Math.round(event.z)} @ ${event.timeOfEvent}`);
        });

        // Event: Explosion
        // Fires when explosions occur (TNT, creepers, fireballs, etc.)
        api.onExplosion(event => {
            api.log(`[Explosion] Explosion at ${Math.round(event.x)},${Math.round(event.y)},${Math.round(event.z)} with power ${event.power.toFixed(1)} caused by ${event.causeType} in ${event.dimensionId} @ ${event.timeOfEvent}`);
        });

        api.log("[events-demo] ✓ Registered 25+ event handlers");
        api.log("[events-demo] ✓ Registered custom commands: /shout, /stats");
        api.log("[events-demo] ✓ Data tracking enabled for blocks and deaths");
        api.log("[events-demo] Try breaking blocks and using /stats to see persistent data!");
    }
});
