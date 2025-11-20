// ============================================================================
// Command Demo - Custom Slash Commands with Argument Features
// ============================================================================
/**
 * This demo showcases ALL command registration features including:
 *   - Multiple argument types (player, int, string, greedy)
 *   - Argument hints and suggestions
 *   - Named arguments via ctx.args
 *   - Optional arguments
 *   - CONDITIONAL arguments with the 'on' field
 *   - Permission levels and OP requirements
 * 
 * NEW COMMAND API (Object-based):
 *   api.registerCommand({
 *     command: "commandname",
 *     description: "What this command does",
 *     args: [
 *       {type: "string", name: "argName", hint: ["suggestion1", "suggestion2"]},
 *       {type: "int", name: "value", hint: "100", on: "suggestion1"}  // CONDITIONAL!
 *     ],
 *     permissionLevel: 0,  // 0-4 (optional, default 0)
 *     requiresOp: false,   // boolean (optional, default false)
 *     execute: function(ctx) {
 *       // ctx.player - The player who ran the command
 *       // ctx.args.argName - Access arguments by name
 *       // ctx.reply(message) - Send feedback to player
 *     }
 *   })
 * 
 * Argument Types:
 *   - "player" - Shows list of online players
 *   - "int" or "integer" - Integer number
 *   - "string" or "word" - Single word
 *   - "greedy" - Captures all remaining text (must be last argument)
 * 
 * Argument Properties:
 *   - type: The argument type
 *   - name: Variable name for ctx.args.name
 *   - hint: String or array of suggestions
 *   - on: "value" - Only show this arg when previous arg equals "value" (NEW!)
 *   - optional: true/false - Whether argument is required
 * 
 * Example Commands Demonstrated:
 *   /heal <player> <amount> - Basic player + int arguments
 *   /broadcast <message> - Greedy string argument
 *   /give <player> <item> - Player + string arguments
 *   /tpto <player> <target> - Multiple player arguments
 *   /settime <value> - String with multiple hints
 *   /weather <type> - Array-based suggestions
 *   /kit <type> [size] - CONDITIONAL argument (size only shows for certain types)
 */

api.registerMod("command_demo", {
    onInitialize: function(api) {
        api.log("[command-demo] Registering custom commands...");
        
        // ====================================================================
        // HEAL COMMAND - /heal <player> <amount>
        // ====================================================================
        api.registerCommand({
            command: "heal",
            description: "Heal a player to a specific health amount",
            args: [
                {type: "player", name: "target"},
                {type: "int", name: "amount", hint: "Amount of health"}
            ],
            execute: function(ctx) {
                var targetName = String(ctx.args.target);
                var amount = Number(ctx.args.amount) || 0;
                
                api.log("Heal command: target=" + targetName + ", amount=" + amount);
                
                // Set player health using existing API
                var success = api.setPlayerHealth(targetName, amount);
                
                if (success) {
                    ctx.reply("§aSet " + targetName + "'s health to " + amount + ".");
                } else {
                    ctx.reply("§cPlayer not found: " + targetName);
                }
            }
        });
        
        // ====================================================================
        // BROADCAST COMMAND - /broadcast <message>
        // ====================================================================
        api.registerCommand({
            command: "broadcast",
            description: "Broadcast a message to all players",
            args: [
                {type: "greedy", name: "message", hint: "Message to broadcast"}
            ],
            execute: function(ctx) {
                var message = String(ctx.args.message);
                // Broadcast to all players
                api.sendMessage("§6[Broadcast] §f" + message);
                ctx.reply("§aBroadcast sent!");
            }
        });
        
        // ====================================================================
        // GIVE COMMAND - /give <player> <item> <count>
        // ====================================================================
        api.registerCommand({
            command: "give",
            description: "Give an item to a player",
            args: [
                {type: "player", name: "target"},
                {type: "string", name: "item", hint: "minecraft:diamond"}
            ],
            execute: function(ctx) {
                var targetName = String(ctx.args.target);
                var itemId = String(ctx.args.item);
                
                // Give item directly to player's inventory
                if (api.giveItem(targetName, itemId, 1)) {
                    ctx.reply("§aGave " + itemId + " to " + targetName);
                } else {
                    ctx.reply("§cFailed to give item (player not found or invalid item)");
                }
            }
        });
        
        // ====================================================================
        // TELEPORT COMMAND - /tpto <player>
        // ====================================================================
        api.registerCommand({
            command: "tpto",
            description: "Teleport a player to another player",
            args: [
                {type: "player", name: "player"},
                {type: "player", name: "target"}
            ],
            execute: function(ctx) {
                var playerName = String(ctx.args.player);
                var targetName = String(ctx.args.target);
                
                if (api.teleportPlayerToPlayer(playerName, targetName)) {
                    ctx.reply("§aTeleported " + playerName + " to " + targetName);
                } else {
                    ctx.reply("§cFailed to teleport (player or target not found)");
                }
            }
        });
        
        // ====================================================================
        // TIME COMMAND - /settime <day|night|value>
        // ====================================================================
        api.registerCommand({
            command: "settime",
            description: "Set the time of day",
            args: [
                {type: "string", name: "time", hint: ["day","night", "0", "12000", "18000", "24000"]}
            ],
            execute: function(ctx) {
                var timeArg = String(ctx.args.time).toLowerCase();
                var time = 0;
                
                if (timeArg === "day") {
                    time = 1000;
                } else if (timeArg === "night") {
                    time = 13000;
                } else {
                    time = parseInt(timeArg);
                }
                
                api.setServerTime(time);
                ctx.reply("§aTime set to " + time);
            }
        });
        
        // ====================================================================
        // WEATHER COMMAND - /weather <clear|rain|thunder>
        // ====================================================================
        api.registerCommand({
            command: "weather",
            description: "Change the weather",
            args: [
                {type: "string", name: "type", hint: ["clear","rain","thunder"]}
            ],
            execute: function(ctx) {
                var type = String(ctx.args.type).toLowerCase();
                var duration = 6000; // 5 minutes in ticks
                
                if (type === "clear") {
                    api.setWeatherClear(duration);
                    ctx.reply("§aWeather cleared for 5 minutes");
                } else if (type === "rain") {
                    api.setWeatherRain(duration);
                    ctx.reply("§aStarted rain for 5 minutes");
                } else if (type === "thunder") {
                    api.setWeatherThunder(duration);
                    ctx.reply("§aStarted thunderstorm for 5 minutes");
                } else {
                    ctx.reply("§cInvalid weather type. Use: clear, rain, or thunder");
                }
            }
        });
        
        // ====================================================================
        // SPEED COMMAND - /speed <player> <speed>
        // ====================================================================
        api.registerCommand({
            command: "speed",
            description: "Set a player's movement speed",
            args: [
                {type: "player", name: "target"},
                {type: "int", name: "multiplier", hint: "Speed multiplier (1-10)"}
            ],
            execute: function(ctx) {
                var targetName = String(ctx.args.target);
                var speedMultiplier = Number(ctx.args.multiplier) || 1;
                
                // Convert multiplier to Minecraft speed (0.1 = normal)
                var speed = 0.1 * speedMultiplier;
                
                if (api.setPlayerSpeed(targetName, speed)) {
                    ctx.reply("§aSet " + targetName + "'s speed to " + speedMultiplier + "x");
                } else {
                    ctx.reply("§cPlayer not found: " + targetName);
                }
            }
        });
        
        // ====================================================================
        // KIT COMMAND - DEMONSTRATES CONDITIONAL ARGUMENTS WITH 'on' FIELD
        // ====================================================================
        // This command shows the 'on' feature where certain arguments only
        // appear when a previous argument has a specific value.
        //
        // /kit starter - Only shows "starter" (no size option)
        // /kit tools small - Shows "tools" then "small/medium/large"
        // /kit armor premium - Shows "armor" then "basic/premium/legendary"
        //
        // Different conditional arguments can have different hints/suggestions
        // by using different argument names (toolSize vs armorQuality).
        // ====================================================================
        api.registerCommand({
            command: "kit",
            description: "Give yourself a kit (demonstrates conditional arguments)",
            args: [
                {type: "string", name: "type", hint: ["starter", "tools", "armor"]},
                {type: "string", name: "toolSize", hint: ["small", "medium", "large"], on: "tools"},
                {type: "string", name: "armorQuality", hint: ["basic", "premium", "legendary"], on: "armor"}
            ],
            execute: function(ctx) {
                var playerName = ctx.player.getName().getString();
                var kitType = ctx.args.type;
                
                if (kitType === "starter") {
                    // Basic starter kit - no options
                    api.giveItem(playerName, "minecraft:wooden_sword", 1);
                    api.giveItem(playerName, "minecraft:bread", 8);
                    ctx.reply("§aGave you a starter kit!");
                    
                } else if (kitType === "tools") {
                    // Tool kit with size-based quality
                    var toolSize = ctx.args.toolSize || "medium";
                    var toolMaterial = toolSize === "small" ? "stone" : (toolSize === "large" ? "diamond" : "iron");
                    
                    api.giveItem(playerName, "minecraft:" + toolMaterial + "_pickaxe", 1);
                    api.giveItem(playerName, "minecraft:" + toolMaterial + "_axe", 1);
                    api.giveItem(playerName, "minecraft:" + toolMaterial + "_shovel", 1);
                    ctx.reply("§aGave you a " + toolSize + " tool kit (" + toolMaterial + ")!");
                    
                } else if (kitType === "armor") {
                    // Armor kit with quality-based material
                    var armorQuality = ctx.args.armorQuality || "premium";
                    var armorMaterial = armorQuality === "basic" ? "leather" : (armorQuality === "legendary" ? "diamond" : "iron");
                    
                    api.giveItem(playerName, "minecraft:" + armorMaterial + "_helmet", 1);
                    api.giveItem(playerName, "minecraft:" + armorMaterial + "_chestplate", 1);
                    api.giveItem(playerName, "minecraft:" + armorMaterial + "_leggings", 1);
                    api.giveItem(playerName, "minecraft:" + armorMaterial + "_boots", 1);
                    ctx.reply("§aGave you a " + armorQuality + " armor kit (" + armorMaterial + ")!");
                }
            }
        });
        
        // ====================================================================
        // SHOP COMMAND - DEMONSTRATES MULTIPLE CONDITIONAL VALUES WITH ARRAYS
        // ====================================================================
        // This command shows using arrays in the 'on' field to make an argument
        // appear for MULTIPLE different parent values.
        //
        // /shop buy <item> <amount> - Buy items from the shop
        // /shop sell <item> <amount> - Sell items to the shop  
        // /shop trade <item> <amount> - Trade items with shop
        // /shop list - List available items (no extra args)
        // /shop balance - Check your balance (no extra args)
        //
        // The "item" and "amount" arguments appear for buy, sell, AND trade using arrays
        // ====================================================================
        api.registerCommand({
            command: "shop",
            description: "Shop system (demonstrates array conditionals)",
            args: [
                {type: "string", name: "action", hint: ["buy", "sell", "trade", "list", "balance"]},
                
                // These arguments show for buy, sell, AND trade (array of conditions)
                {type: "string", name: "item", hint: ["diamond", "iron", "gold", "emerald"], on: ["buy", "sell", "trade"]},
                {type: "int", name: "amount", hint: "1", on: ["buy", "sell", "trade"]}
            ],
            execute: function(ctx) {
                var playerName = ctx.player.getName().getString();
                var action = ctx.args.action;
                
                if (action === "list") {
                    ctx.reply("§e=== Shop Items ===");
                    ctx.reply("§7Diamond: $100 | Iron: $10 | Gold: $50 | Emerald: $200");
                    
                } else if (action === "balance") {
                    ctx.reply("§aYour balance: §6$1000");
                    
                } else if (action === "buy") {
                    var item = ctx.args.item || "diamond";
                    var amount = ctx.args.amount || 1;
                    var prices = {diamond: 100, iron: 10, gold: 50, emerald: 200};
                    var cost = prices[item] * amount;
                    
                    api.giveItem(playerName, "minecraft:" + item, amount);
                    ctx.reply("§aBought " + amount + "x " + item + " for $" + cost);
                    
                } else if (action === "sell") {
                    var item = ctx.args.item || "diamond";
                    var amount = ctx.args.amount || 1;
                    var prices = {diamond: 80, iron: 8, gold: 40, emerald: 160};
                    var earnings = prices[item] * amount;
                    
                    ctx.reply("§aSold " + amount + "x " + item + " for $" + earnings);
                    
                } else if (action === "trade") {
                    var item = ctx.args.item || "diamond";
                    var amount = ctx.args.amount || 1;
                    
                    ctx.reply("§aTraded " + amount + "x " + item + " with the shop!");
                }
            }
        });
        
        api.log("[command-demo] Registered 9 custom commands!");
        api.log("[command-demo] Try: /heal, /broadcast, /give, /tpto, /settime, /weather, /speed, /kit, /shop");
        api.log("[command-demo] Special: Try '/kit tools medium' to see conditional arguments!");
        api.log("[command-demo] Special: Try '/shop buy diamond 5' to see array conditionals!");
    }
});
