/**
 * Chest Master - Advanced Chest Management Mod
 *
 * Showcases all chest-related features from JSModAPI:
 * - getChestLoot(x, y, z, dimension) - Read chest contents
 * - setChestLoot(x, y, z, dimension, items) - Set chest contents
 * - onContainerOpen(callback) - Detect when players open chests
 * - onContainerClose(callback) - Detect when players close chests
 * - getTargetBlock(player, distance) - Get the chest player is looking at
 * - saveData/loadData - Persist tracked chest locations and statistics
 *
 * Commands:
 * /chest info - Shows contents of the chest you're looking at
 * /chest clear - Empties the chest you're looking at
 * /chest fill <preset> - Fills chest with a preset (starter, mining, farming, combat, treasure)
 * /chest copy - Copies the chest contents you're looking at
 * /chest paste - Pastes copied contents to the chest you're looking at
 * /chest track - Marks a chest for tracking (logs when opened/closed)
 * /chest untrack - Removes tracking from a chest
 * /chest swap - Swaps contents between two chests (look at first, then second)
 */

api.registerMod("chest-master", {
  onInitialize(api) {
    api.log("§6[ChestMaster] Loading Chest Master mod...");

    // Storage for various features
    let copiedChest = null;

    // Load data and convert to plain JS objects to avoid Java Map issues
    let trackedChestsRaw = api.loadData("tracked_chests", {});
    let trackedChests = {};
    try {
      let parsed = JSON.parse(JSON.stringify(trackedChestsRaw));
      trackedChests = parsed || {};
    } catch (e) {
      api.log("[ChestMaster] Failed to parse tracked chests: " + e);
      trackedChests = {};
    }

    let chestStatsRaw = api.loadData("chest_stats", {});
    let chestStats = {};
    try {
      let parsed = JSON.parse(JSON.stringify(chestStatsRaw));
      chestStats = parsed || {};
    } catch (e) {
      api.log("[ChestMaster] Failed to parse chest stats: " + e);
      chestStats = {};
    }

    let swapMode = {}; // player -> first chest location

    // Preset chest configurations
    const presets = {
      starter: [
        { slot: 0, itemId: "minecraft:wooden_pickaxe", count: 1 },
        { slot: 1, itemId: "minecraft:wooden_axe", count: 1 },
        { slot: 2, itemId: "minecraft:wooden_shovel", count: 1 },
        { slot: 9, itemId: "minecraft:bread", count: 16 },
        { slot: 10, itemId: "minecraft:apple", count: 8 },
        { slot: 18, itemId: "minecraft:torch", count: 32 },
        { slot: 19, itemId: "minecraft:oak_planks", count: 64 },
        { slot: 20, itemId: "minecraft:cobblestone", count: 64 }
      ],
      mining: [
        { slot: 0, itemId: "minecraft:iron_pickaxe", count: 1 },
        { slot: 1, itemId: "minecraft:iron_shovel", count: 1 },
        { slot: 2, itemId: "minecraft:water_bucket", count: 1 },
        { slot: 9, itemId: "minecraft:torch", count: 64 },
        { slot: 10, itemId: "minecraft:torch", count: 64 },
        { slot: 11, itemId: "minecraft:ladder", count: 64 },
        { slot: 18, itemId: "minecraft:cooked_beef", count: 32 },
        { slot: 19, itemId: "minecraft:golden_apple", count: 4 }
      ],
      farming: [
        { slot: 0, itemId: "minecraft:diamond_hoe", count: 1 },
        { slot: 1, itemId: "minecraft:wheat_seeds", count: 64 },
        { slot: 2, itemId: "minecraft:carrot", count: 64 },
        { slot: 3, itemId: "minecraft:potato", count: 64 },
        { slot: 9, itemId: "minecraft:beetroot_seeds", count: 64 },
        { slot: 10, itemId: "minecraft:bone_meal", count: 64 },
        { slot: 11, itemId: "minecraft:bone_meal", count: 64 },
        { slot: 18, itemId: "minecraft:water_bucket", count: 1 },
        { slot: 19, itemId: "minecraft:composter", count: 8 }
      ],
      combat: [
        { slot: 0, itemId: "minecraft:diamond_sword", count: 1 },
        { slot: 1, itemId: "minecraft:bow", count: 1 },
        { slot: 2, itemId: "minecraft:arrow", count: 64 },
        { slot: 9, itemId: "minecraft:diamond_helmet", count: 1 },
        { slot: 10, itemId: "minecraft:diamond_chestplate", count: 1 },
        { slot: 11, itemId: "minecraft:diamond_leggings", count: 1 },
        { slot: 12, itemId: "minecraft:diamond_boots", count: 1 },
        { slot: 18, itemId: "minecraft:golden_apple", count: 8 },
        { slot: 19, itemId: "minecraft:shield", count: 1 }
      ],
      treasure: [
        { slot: 4, itemId: "minecraft:diamond", count: 16 },
        { slot: 13, itemId: "minecraft:emerald", count: 32 },
        { slot: 11, itemId: "minecraft:gold_ingot", count: 48 },
        { slot: 15, itemId: "minecraft:netherite_ingot", count: 4 },
        { slot: 20, itemId: "minecraft:enchanted_golden_apple", count: 3 },
        { slot: 21, itemId: "minecraft:totem_of_undying", count: 1 },
        { slot: 22, itemId: "minecraft:elytra", count: 1 },
        { slot: 23, itemId: "minecraft:nether_star", count: 2 }
      ]
    };

    // Helper: Get chest location key
    function getChestKey(x, y, z, dim) {
      return `${dim}:${x},${y},${z}`;
    }

    // Helper: Get the chest the player is looking at
    function getTargetChest(playerName) {
      let target = api.getTargetBlock(playerName, 10);
      if (!target) {
        api.log(`[ChestMaster] ${playerName} - No block targeted (raycast returned null)`);
        return null;
      }

      // The target is a Java HashMap, we need to use .get() method
      let blockId = target.get ? target.get("blockId") : target.blockId;
      let x = target.get ? target.get("x") : target.x;
      let y = target.get ? target.get("y") : target.y;
      let z = target.get ? target.get("z") : target.z;

      if (!blockId) {
        api.log(`[ChestMaster] Target has no blockId`);
        return null;
      }

      api.log(`[ChestMaster] ${playerName} looking at: ${blockId} at ${x},${y},${z}`);

      if (!blockId.includes("chest") && !blockId.includes("barrel") && !blockId.includes("shulker_box")) {
        api.log(`[ChestMaster] Block '${blockId}' is not a container`);
        return null;
      }

      // Return an object with the extracted values
      return {
        blockId: blockId,
        x: x,
        y: y,
        z: z
      };
    }

    // Track container opens - check if player is near any tracked chest
    api.onContainerOpen(event => {
      // Check all tracked chests to see if player is near one
      for (let key in trackedChests) {
        let chest = trackedChests[key];

        // Check if player is within 5 blocks of the tracked chest
        let distance = Math.sqrt(
          Math.pow(event.x - chest.x, 2) +
          Math.pow(event.y - chest.y, 2) +
          Math.pow(event.z - chest.z, 2)
        );

        if (distance <= 5 && chest.dimension === event.dimensionId) {
          // Update stats for this chest
          let stats = chestStats[key] || { opens: 0, lastOpened: null, lastPlayer: null, history: [] };
          stats.opens = (stats.opens || 0) + 1;
          stats.lastOpened = Date.now();
          stats.lastPlayer = event.playerName;

          // Add to history (keep last 10 opens)
          if (!stats.history) stats.history = [];
          stats.history.push({
            player: event.playerName,
            time: Date.now()
          });
          if (stats.history.length > 10) {
            stats.history.shift(); // Remove oldest entry
          }

          chestStats[key] = stats;
          api.saveData("chest_stats", chestStats);

          // Notify player
          api.sendMessageTo(event.playerName, "§e📦 Tracked Chest: §7" + chest.name);
          api.log(`[ChestMaster] ${event.playerName} opened tracked chest '${chest.name}' at ${chest.x},${chest.y},${chest.z}`);

          // Show particle effect at chest location
          api.spawnParticle("minecraft:enchant", chest.x + 0.5, chest.y + 1.5, chest.z + 0.5, 20);
          break;
        }
      }
    });

    // Track container closes - check if player is near any tracked chest
    api.onContainerClose(event => {
      // Check all tracked chests to see if player is near one
      for (let key in trackedChests) {
        let chest = trackedChests[key];

        // Check if player is within 5 blocks of the tracked chest
        let distance = Math.sqrt(
          Math.pow(event.x - chest.x, 2) +
          Math.pow(event.y - chest.y, 2) +
          Math.pow(event.z - chest.z, 2)
        );

        if (distance <= 5 && chest.dimension === event.dimensionId) {
          api.log(`[ChestMaster] ${event.playerName} closed tracked chest '${chest.name}' at ${chest.x},${chest.y},${chest.z}`);
          break;
        }
      }
    });

    // Register the /chest command using the new object-based API
    api.registerCommand({
      command: "chest",
      description: "Advanced chest management commands",
      args: [
        { name: "action", type: "string", hint: ["info", "clear", "fill", "copy", "paste", "track", "untrack", "swap"], optional: true },
        { name: "param", type: "string", hint: ["starter", "mining", "farming", "combat", "treasure"], optional: true, on: "fill" },
        { name: "name", type: "greedy", hint: "<chest name>", optional: true, on: "track" }
      ],
      execute: function(ctx) {
        if (!ctx.player) {
          ctx.reply("§cOnly players can use this command!");
          return;
        }

        // Check if action was provided
        if (!ctx.args.action) {
          ctx.reply("§6=== Chest Master Commands ===");
          ctx.reply("§e/chest info §7- Show chest contents");
          ctx.reply("§e/chest clear §7- Empty a chest");
          ctx.reply("§e/chest fill <preset> §7- Fill with preset");
          ctx.reply("§e/chest copy §7- Copy chest contents");
          ctx.reply("§e/chest paste §7- Paste copied contents");
          ctx.reply("§e/chest track <name> §7- Track this chest");
          ctx.reply("§e/chest untrack §7- Untrack this chest");
          ctx.reply("§e/chest swap §7- Swap contents between chests");
          ctx.reply("§7Presets: starter, mining, farming, combat, treasure");
          return;
        }

        let subcommand = ctx.args.action.toLowerCase();

        // Get player info using the API
        // Use ctx.playerName which is provided directly by the Java command handler
        let playerName = ctx.playerName;
        let playerInfo = api.getPlayer(playerName);
        let playerDimension = playerInfo.dimensionId;

        // Get target chest for commands that need it
        let target = getTargetChest(playerName);

        if (subcommand === "info") {
          if (!target) {
            ctx.reply("§cYou must be looking at a chest, barrel, or shulker box!");
            return;
          }

          let contents = api.getChestLoot(target.x, target.y, target.z, playerDimension);
          let key = getChestKey(target.x, target.y, target.z, playerDimension);
          let stats = chestStats[key];

          ctx.reply("§6=== Chest Info ===");
          ctx.reply(`§eLocation: §f${target.x}, ${target.y}, ${target.z}`);
          ctx.reply(`§eType: §f${target.blockId}`);
          ctx.reply(`§eItems: §f${contents.length} / 27`);

          if (trackedChests[key]) {
            ctx.reply(`§aTracked as: §f${trackedChests[key].name}`);
          }

          if (stats) {
            ctx.reply(`§eOpened: §f${stats.opens} times`);
            if (stats.lastPlayer) {
              ctx.reply(`§eLast: §f${stats.lastPlayer}`);
            }

            // Show recent history if available
            if (stats.history && stats.history.length > 0) {
              ctx.reply("§6Recent Opens:");
              let recentHistory = stats.history.slice(-5).reverse(); // Show last 5, most recent first
              for (let i = 0; i < recentHistory.length; i++) {
                let entry = recentHistory[i];
                let timeAgo = Math.floor((Date.now() - entry.time) / 1000);
                let timeStr;
                if (timeAgo < 60) {
                  timeStr = `${timeAgo}s ago`;
                } else if (timeAgo < 3600) {
                  timeStr = `${Math.floor(timeAgo / 60)}m ago`;
                } else if (timeAgo < 86400) {
                  timeStr = `${Math.floor(timeAgo / 3600)}h ago`;
                } else {
                  timeStr = `${Math.floor(timeAgo / 86400)}d ago`;
                }
                ctx.reply(`  §7${entry.player} §8- §f${timeStr}`);
              }
            }
          }

          ctx.reply("§6=== Contents ===");

          // Debug: log contents info
          api.log(`[ChestMaster] Contents type: ${typeof contents}, length: ${contents.length}, size: ${contents.size ? contents.size() : 'N/A'}`);

          if (contents.length === 0 || (contents.size && contents.size() === 0)) {
            ctx.reply("§7(Empty)");
          } else {
            // Convert to array if it's a Java List
            let itemArray = contents.toArray ? contents.toArray() : contents;

            api.log(`[ChestMaster] ItemArray length: ${itemArray.length}`);

            for (let i = 0; i < itemArray.length; i++) {
              let item = itemArray[i];
              if (!item) {
                api.log(`[ChestMaster] Item at index ${i} is null/undefined`);
                continue; // Skip null/undefined items
              }

              // Items from getChestLoot are also Java HashMaps
              let itemId = item.get ? item.get("itemId") : item.itemId;
              let slot = item.get ? item.get("slot") : item.slot;
              let count = item.get ? item.get("count") : item.count;

              api.log(`[ChestMaster] Item ${i}: slot=${slot}, itemId=${itemId}, count=${count}`);

              if (!itemId) continue; // Skip items without an ID

              let itemName = itemId.replace("minecraft:", "");
              ctx.reply(`§7Slot ${slot}: §f${count}x §e${itemName}`);
            }
          }

        } else if (subcommand === "clear") {
          if (!target) {
            ctx.reply("§cYou must be looking at a chest!");
            return;
          }

          api.setChestLoot(target.x, target.y, target.z, playerDimension, []);
          ctx.reply("§a✓ Chest cleared!");
          api.spawnParticle("minecraft:poof", target.x + 0.5, target.y + 0.5, target.z + 0.5, 20);

        } else if (subcommand === "fill") {
          if (!target) {
            ctx.reply("§cYou must be looking at a chest!");
            return;
          }

          if (!ctx.args.param) {
            ctx.reply("§cUsage: /chest fill <preset>");
            ctx.reply("§7Presets: starter, mining, farming, combat, treasure");
            return;
          }

          let presetName = ctx.args.param.toLowerCase();
          if (!presets[presetName]) {
            ctx.reply("§cUnknown preset! Available: starter, mining, farming, combat, treasure");
            return;
          }

          api.setChestLoot(target.x, target.y, target.z, playerDimension, presets[presetName]);
          ctx.reply(`§a✓ Chest filled with '${presetName}' preset!`);
          api.spawnParticle("minecraft:happy_villager", target.x + 0.5, target.y + 0.5, target.z + 0.5, 30);
          api.playSound("minecraft:entity.player.levelup", target.x, target.y, target.z, 0.5, 1.2);

        } else if (subcommand === "copy") {
          if (!target) {
            ctx.reply("§cYou must be looking at a chest!");
            return;
          }

          copiedChest = {
            items: api.getChestLoot(target.x, target.y, target.z, playerDimension),
            player: playerName
          };

          ctx.reply(`§a✓ Copied ${copiedChest.items.length} items from chest!`);
          api.spawnParticle("minecraft:enchant", target.x + 0.5, target.y + 0.5, target.z + 0.5, 15);

        } else if (subcommand === "paste") {
          if (!target) {
            ctx.reply("§cYou must be looking at a chest!");
            return;
          }

          if (!copiedChest || copiedChest.items.length === 0) {
            ctx.reply("§cNo chest contents copied! Use /chest copy first.");
            return;
          }

          api.setChestLoot(target.x, target.y, target.z, playerDimension, copiedChest.items);
          ctx.reply(`§a✓ Pasted ${copiedChest.items.length} items into chest!`);
          api.spawnParticle("minecraft:happy_villager", target.x + 0.5, target.y + 0.5, target.z + 0.5, 30);

        } else if (subcommand === "track") {
          if (!target) {
            ctx.reply("§cYou must be looking at a chest!");
            return;
          }

          if (!ctx.args.name) {
            ctx.reply("§cUsage: /chest track <name>");
            ctx.reply("§7Example: /chest track Storage Room");
            return;
          }

          let name = ctx.args.name;
          let key = getChestKey(target.x, target.y, target.z, playerDimension);

          trackedChests[key] = {
            name: name,
            x: target.x,
            y: target.y,
            z: target.z,
            dimension: playerDimension,
            trackedBy: playerName,
            trackedAt: Date.now()
          };

          api.saveData("tracked_chests", trackedChests);
          ctx.reply(`§a✓ Now tracking chest as '${name}'`);
          api.spawnParticle("minecraft:end_rod", target.x + 0.5, target.y + 1, target.z + 0.5, 20);

        } else if (subcommand === "untrack") {
          if (!target) {
            ctx.reply("§cYou must be looking at a chest!");
            return;
          }

          let key = getChestKey(target.x, target.y, target.z, playerDimension);
          if (!trackedChests[key]) {
            ctx.reply("§cThis chest is not being tracked!");
            return;
          }

          delete trackedChests[key];
          api.saveData("tracked_chests", trackedChests);
          ctx.reply("§a✓ Stopped tracking this chest");

        } else if (subcommand === "swap") {
          if (!target) {
            ctx.reply("§cYou must be looking at a chest!");
            return;
          }

          // Check if player is in swap mode
          if (!swapMode[playerName]) {
            // First chest selected
            swapMode[playerName] = {
              x: target.x,
              y: target.y,
              z: target.z,
              dimension: playerDimension,
              items: api.getChestLoot(target.x, target.y, target.z, playerDimension)
            };
            ctx.reply("§e✓ First chest selected! Now look at the second chest and use /chest swap again.");
            api.spawnParticle("minecraft:flame", target.x + 0.5, target.y + 0.5, target.z + 0.5, 10);
          } else {
            // Second chest selected - perform swap
            let first = swapMode[playerName];
            let secondItems = api.getChestLoot(target.x, target.y, target.z, playerDimension);

            // Swap contents
            api.setChestLoot(first.x, first.y, first.z, first.dimension, secondItems);
            api.setChestLoot(target.x, target.y, target.z, playerDimension, first.items);

            ctx.reply("§a✓ Chest contents swapped!");
            api.spawnParticle("minecraft:portal", first.x + 0.5, first.y + 0.5, first.z + 0.5, 30);
            api.spawnParticle("minecraft:portal", target.x + 0.5, target.y + 0.5, target.z + 0.5, 30);
            api.playSound("minecraft:entity.enderman.teleport", target.x, target.y, target.z, 1.0, 1.0);

            delete swapMode[playerName];
          }

        } else {
          ctx.reply("§cUnknown subcommand! Use /chest for help.");
        }
      }
    });

    api.log("§a✓ Chest Master mod loaded!");
    api.sendMessage("§6[ChestMaster] §aChest Master mod loaded! Use §e/chest §afor commands.");
  }
});
