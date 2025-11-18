// ============================================================================
// Forms Example Mod
// ============================================================================
// Comprehensive demonstration of the ThreadJS GUI form system
//
// This mod showcases three types of forms:
//   1. Simple Form    - Button selection menus
//   2. Modal Form     - Yes/No confirmation dialogs
//   3. Custom Form    - Multi-input forms with various field types
//
// Commands:
//   /js shop       - Item shop with button selections (Simple Form)
//   /js clearinv   - Inventory clear with confirmation (Modal Form)
//   /js teleport   - Teleport with coordinate inputs (Custom Form)
//   /js settings   - Player settings panel (Advanced Custom Form)
//   /js kit        - Kit selection menu (Simple Form with logic)
//
// Form Field Types (Custom Forms):
//   - input      - Text input field
//   - toggle     - Boolean on/off switch
//   - slider     - Numeric range slider
//   - dropdown   - Selection from a list of options
//
// This mod demonstrates:
//   - All form types and their use cases
//   - Form response handling
//   - User input validation
//   - Persistent data storage
//   - Complex form layouts
// ============================================================================

api.registerMod("forms_example", {
  onInitialize(api) {
    // ========================================================================
    // SIMPLE FORM EXAMPLE: Button Selection
    // ========================================================================
    // Command: /js shop
    // Description: Shows an item shop with selectable options
    // Form Type: Simple Form (showSimpleForm)
    // Use Case: Menu navigation, shop interfaces, option selection
    api.registerCommand("shop", (ctx, args) => {
      if (!ctx.player) return;
      
      const response = api.showSimpleForm(
        ctx.player.name,
        "§6§lItem Shop",
        "§7Choose an item to purchase:",
        ["§eDiamond Sword - 100 coins", "§bIron Armor Set - 75 coins", "§aGolden Apple - 50 coins", "§cCancel"]
      );
      
      // Handle response (in real implementation, this would be async/callback)
      if (response && !response.canceled) {
        const selection = response.selection;
        
        if (selection === 0) {
          // Diamond Sword
          api.giveItem(ctx.player.name, "minecraft:diamond_sword", 1);
          api.sendMessageTo(ctx.player.name, "§aPurchased Diamond Sword for 100 coins!");
        } else if (selection === 1) {
          // Iron Armor
          api.giveItem(ctx.player.name, "minecraft:iron_helmet", 1);
          api.giveItem(ctx.player.name, "minecraft:iron_chestplate", 1);
          api.giveItem(ctx.player.name, "minecraft:iron_leggings", 1);
          api.giveItem(ctx.player.name, "minecraft:iron_boots", 1);
          api.sendMessageTo(ctx.player.name, "§aPurchased Iron Armor Set for 75 coins!");
        } else if (selection === 2) {
          // Golden Apple
          api.giveItem(ctx.player.name, "minecraft:golden_apple", 1);
          api.sendMessageTo(ctx.player.name, "§aPurchased Golden Apple for 50 coins!");
        }
      }
    });

    // ========================================================================
    // MODAL FORM EXAMPLE: Yes/No Confirmation
    // ========================================================================
    // Command: /js clearinv
    // Description: Confirms before clearing inventory
    // Form Type: Modal Form (showModalForm)
    // Use Case: Confirmations, binary choices, dangerous actions
    api.registerCommand("clearinv", (ctx, args) => {
      if (!ctx.player) return;
      
      const response = api.showModalForm(
        ctx.player.name,
        "§c§lClear Inventory",
        "§7Are you sure you want to clear your inventory? This cannot be undone!",
        "§aYes, clear it",
        "§cNo, cancel"
      );
      
      if (response && !response.canceled && response.button === 0) {
        api.clearInventory(ctx.player.name);
        api.sendMessageTo(ctx.player.name, "§aInventory cleared!");
      } else {
        api.sendMessageTo(ctx.player.name, "§aYou cancelled.");
      }
    });

    // ========================================================================
    // CUSTOM FORM EXAMPLE: Multi-Input Form
    // ========================================================================
    // Command: /js teleport
    // Description: Teleport using coordinate inputs
    // Form Type: Custom Form (showCustomForm)
    // Use Case: Data collection, multi-field input, complex forms
    // Fields: 3 text inputs (X, Y, Z) + 1 dropdown (dimension)
    api.registerCommand("teleport", (ctx, args) => {
      if (!ctx.player) return;
      
      const response = api.showCustomForm(
        ctx.player.name,
        "§b§lTeleport",
        [
          {
            type: "input",
            label: "§eX Coordinate",
            placeholder: "0",
            default: "0"
          },
          {
            type: "input",
            label: "§eY Coordinate",
            placeholder: "64",
            default: "64"
          },
          {
            type: "input",
            label: "§eZ Coordinate",
            placeholder: "0",
            default: "0"
          },
          {
            type: "dropdown",
            label: "§eDimension",
            options: ["Overworld", "Nether", "End"],
            default: 0
          }
        ]
      );
      
      if (response && !response.canceled) {
        const x = parseInt(response.values[0]) || 0;
        const y = parseInt(response.values[1]) || 64;
        const z = parseInt(response.values[2]) || 0;
        const dimIndex = response.values[3];
        
        const dimensions = [
          "minecraft:overworld",
          "minecraft:the_nether",
          "minecraft:the_end"
        ];
        
        api.teleport(ctx.player.name, x, y, z, dimensions[dimIndex]);
        api.sendMessageTo(ctx.player.name, `§aTeleported to ${x}, ${y}, ${z}`);
      }
    });

    // ========================================================================
    // ADVANCED CUSTOM FORM: Settings Panel
    // ========================================================================
    // Command: /js settings
    // Description: Player preferences with multiple field types
    // Form Type: Custom Form (showCustomForm)
    // Fields: 2 toggles, 1 slider, 1 dropdown, 1 text input
    // Demonstrates: Persistent data storage with api.saveData()
    api.registerCommand("settings", (ctx, args) => {
      if (!ctx.player) return;
      
      const response = api.showCustomForm(
        ctx.player.name,
        "§d§lPlayer Settings",
        [
          {
            type: "toggle",
            label: "§eEnable Particles",
            default: true
          },
          {
            type: "toggle",
            label: "§eEnable Sounds",
            default: true
          },
          {
            type: "slider",
            label: "§eParticle Density",
            min: 0,
            max: 100,
            step: 10,
            default: 50
          },
          {
            type: "dropdown",
            label: "§ePreferred Gamemode",
            options: ["Survival", "Creative", "Adventure", "Spectator"],
            default: 0
          },
          {
            type: "input",
            label: "§eNickname",
            placeholder: "Enter nickname",
            default: ctx.player.name
          }
        ]
      );
      
      if (response && !response.canceled) {
        const enableParticles = response.values[0];
        const enableSounds = response.values[1];
        const particleDensity = response.values[2];
        const gamemode = response.values[3];
        const nickname = response.values[4];
        
        // Save settings to persistent data
        api.saveData("player_settings", ctx.player.uuid, {
          particles: enableParticles,
          sounds: enableSounds,
          particleDensity: particleDensity,
          preferredGamemode: gamemode,
          nickname: nickname
        });
        
        api.sendMessageTo(ctx.player.name, "§aSettings saved!");
        api.showActionbar(ctx.player.name, "§a✓ Settings updated");
      }
    });

    // ========================================================================
    // SIMPLE FORM WITH LOGIC: Kit Selection
    // ========================================================================
    // Command: /js kit
    // Description: Choose from different starter kits
    // Form Type: Simple Form with conditional logic based on selection
    // Demonstrates: Branching logic based on button selection
    api.registerCommand("kit", (ctx, args) => {
      if (!ctx.player) return;
      
      const response = api.showSimpleForm(
        ctx.player.name,
        "§6§lChoose a Kit",
        "§7Select your starting kit:",
        [
          "§c⚔ §lWarrior Kit §r§7- Armor & Weapons",
          "§a⛏ §lMiner Kit §r§7- Tools & Food",
          "§b🏹 §lArcher Kit §r§7- Bow & Arrows",
          "§e⚗ §lAlchemist Kit §r§7- Potions & Brewing"
        ]
      );
      
      if (response && !response.canceled) {
        const kit = response.selection;
        
        if (kit === 0) {
          // Warrior
          api.giveItem(ctx.player.name, "minecraft:iron_sword", 1);
          api.giveItem(ctx.player.name, "minecraft:iron_helmet", 1);
          api.giveItem(ctx.player.name, "minecraft:iron_chestplate", 1);
          api.giveItem(ctx.player.name, "minecraft:iron_leggings", 1);
          api.giveItem(ctx.player.name, "minecraft:iron_boots", 1);
          api.sendMessageTo(ctx.player.name, "§cReceived Warrior Kit!");
        } else if (kit === 1) {
          // Miner
          api.giveItem(ctx.player.name, "minecraft:iron_pickaxe", 1);
          api.giveItem(ctx.player.name, "minecraft:iron_shovel", 1);
          api.giveItem(ctx.player.name, "minecraft:iron_axe", 1);
          api.giveItem(ctx.player.name, "minecraft:cooked_beef", 32);
          api.giveItem(ctx.player.name, "minecraft:torch", 64);
          api.sendMessageTo(ctx.player.name, "§aReceived Miner Kit!");
        } else if (kit === 2) {
          // Archer
          api.giveItem(ctx.player.name, "minecraft:bow", 1);
          api.giveItem(ctx.player.name, "minecraft:arrow", 64);
          api.giveItem(ctx.player.name, "minecraft:leather_helmet", 1);
          api.giveItem(ctx.player.name, "minecraft:leather_chestplate", 1);
          api.sendMessageTo(ctx.player.name, "§bReceived Archer Kit!");
        } else if (kit === 3) {
          // Alchemist
          api.giveItem(ctx.player.name, "minecraft:brewing_stand", 1);
          api.giveItem(ctx.player.name, "minecraft:blaze_powder", 16);
          api.giveItem(ctx.player.name, "minecraft:nether_wart", 16);
          api.giveItem(ctx.player.name, "minecraft:glass_bottle", 16);
          api.sendMessageTo(ctx.player.name, "§eReceived Alchemist Kit!");
        }
        
        api.showTitle(ctx.player.name, "§aKit Received!", "", 10, 30, 10);
      }
    });
  }
});
