// ============================================================================
// Weather & Time Example Mod
// ============================================================================
// Demonstrates weather and time manipulation in Minecraft worlds
//
// Weather Functions:
//   - setWeather    - Change weather (CLEAR, RAIN, THUNDER)
//   - getWeather    - Get current weather state
//
// Time Functions:
//   - setTime       - Set world time (0-24000 ticks)
//   - getTime       - Get current world time
//   - setTimeOfDay  - Set time by period (DAY, NIGHT, NOON, MIDNIGHT)
//
// Commands:
//   /js weather <clear|rain|thunder>  - Change the weather
//   /js time <ticks>                  - Set time (0-24000)
//   /js day                           - Set time to day (1000)
//   /js night                         - Set time to night (13000)
//   /js rain                          - Start rain for 30 seconds
//
// This mod showcases:
//   - Weather control
//   - Time manipulation
//   - Scheduled weather changes
//   - Broadcast messages for weather/time changes
// ============================================================================

api.registerMod("weather_time_example", {
  onInitialize(api) {
    // Weather control commands
    api.registerCommand("weather", (ctx, args) => {
  if (!ctx.player) return;
  
  if (args.length < 1) {
    api.sendMessageTo(ctx.player.name, "§cUsage: /weather <clear|rain|thunder>");
    return;
  }
  
  const weather = args[0].toUpperCase();
  const validWeather = ["CLEAR", "RAIN", "THUNDER"];
  
  if (!validWeather.includes(weather)) {
    api.sendMessageTo(ctx.player.name, "§cInvalid weather! Use: clear, rain, or thunder");
    return;
  }
  
  api.setWeather("minecraft:overworld", weather);
  api.broadcast(`§e${ctx.player.name} §aset the weather to §e${weather.toLowerCase()}`);
});

// Time control commands
api.registerCommand("time", (ctx, args) => {
  if (!ctx.player) return;
  
  if (args.length < 1) {
    // Show current time
    const time = api.getTime("minecraft:overworld");
    const timeOfDay = getTimeOfDay(time);
    api.sendMessageTo(ctx.player.name, `§aCurrent time: §e${time} §7(${timeOfDay})`);
    return;
  }
  
  const arg = args[0].toLowerCase();
  let newTime;
  
  switch (arg) {
    case "day":
      newTime = 1000;
      break;
    case "noon":
      newTime = 6000;
      break;
    case "night":
      newTime = 13000;
      break;
    case "midnight":
      newTime = 18000;
      break;
    default:
      newTime = parseInt(arg);
      if (isNaN(newTime)) {
        api.sendMessageTo(ctx.player.name, "§cUsage: /time <day|noon|night|midnight|number>");
        return;
      }
  }
  
  api.setTime("minecraft:overworld", newTime.toString());
  api.broadcast(`§e${ctx.player.name} §aset the time to §e${arg}`);
});

// Helper function to convert time to readable format
function getTimeOfDay(time) {
  const t = parseInt(time);
  if (t >= 0 && t < 6000) return "Morning";
  if (t >= 6000 && t < 12000) return "Day";
  if (t >= 12000 && t < 13000) return "Sunset";
  if (t >= 13000 && t < 18000) return "Night";
  if (t >= 18000 && t < 24000) return "Midnight";
  return "Unknown";
}

// Auto day/night cycle announcements
let lastAnnouncedPhase = "";

api.onPlayerTick((player) => {
  // Check every 100 ticks (5 seconds)
  if (player.tick % 100 === 0) {
    const time = api.getTime(player.dimensionId);
    const phase = getTimeOfDay(time);
    
    if (phase !== lastAnnouncedPhase) {
      lastAnnouncedPhase = phase;
      
      if (phase === "Night") {
        api.broadcast("§c§l⚠ §cNight has fallen! Monsters are spawning!");
      } else if (phase === "Morning") {
        api.broadcast("§e§l☀ §eGood morning! The sun is rising!");
      }
    }
  }
});

// Storm spawner with effects
api.registerCommand("storm", (ctx, args) => {
  if (!ctx.player) return;
  
  api.setWeather("minecraft:overworld", "THUNDER");
  api.broadcast("§c§l⚡ §eA storm is brewing!");
  
  // Spawn lightning after delay
  api.runLater("20", () => {
    const players = api.getPlayers();
    players.forEach(player => {
      // Spawn lightning near each player
      const x = player.x + Math.floor(Math.random() * 20 - 10);
      const z = player.z + Math.floor(Math.random() * 20 - 10);
      
      api.spawnLightning(x, player.y, z, player.dimensionId, "true");
      api.playSound("entity.lightning_bolt.thunder", 1.0, 1.0);
    });
  });
});

// Scheduled weather changes
api.onServerStart(() => {
  // Change weather every 10 minutes (12000 ticks)
  api.runRepeating("12000", () => {
    const weathers = ["CLEAR", "RAIN", "THUNDER"];
    const random = weathers[Math.floor(Math.random() * weathers.length)];
    
    api.setWeather("minecraft:overworld", random);
    api.broadcast(`§7Weather changed to: §e${random.toLowerCase()}`);
  });
});

// Time-based events
api.registerCommand("schedule", (ctx, args) => {
  if (!ctx.player) return;
  
  if (args.length < 1) {
    api.sendMessageTo(ctx.player.name, "§cUsage: /schedule <event>");
    return;
  }
  
  const event = args[0];
  
  // Schedule event to run at specific time
  api.runAt("minecraft:overworld", "1000", () => {
    api.broadcast(`§a§l⏰ §eScheduled event: ${event}`);
  });
  
  api.sendMessageTo(ctx.player.name, `§aScheduled '${event}' to run at dawn`);
});

// Daily reset at midnight
api.runDaily("minecraft:overworld", "18000", () => {
  api.broadcast("§c§l⏰ §eDaily server reset!");
  
  // Reset all player data
  const players = api.getPlayers();
  players.forEach(player => {
    // Reset health, clear effects, etc.
    api.sendMessageTo(player.name, "§aYour stats have been reset!");
  });
});

// Auto-clear weather after rain
api.registerCommand("autoclear", (ctx, args) => {
    if (!ctx.player) return;
    
    api.setWeather("minecraft:overworld", "RAIN");
    api.broadcast("§bIt's starting to rain...");
    
    // Clear after 30 seconds
    api.runLater("600", () => {
      api.setWeather("minecraft:overworld", "CLEAR");
      api.broadcast("§eThe rain has stopped!");
    });
  });
  }
});
