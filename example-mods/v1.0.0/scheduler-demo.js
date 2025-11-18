// ============================================================================
// Scheduler Demo Mod
// ============================================================================
// Demonstrates timing and task scheduling in ThreadJS
//
// Key Concepts:
//   - Ticks: Minecraft runs at 20 ticks per second (1 tick = 50ms)
//   - runLater: Schedule a one-time delayed task
//   - runRepeating: Schedule a recurring task
//
// Commands:
//   /js remind_me <seconds> <message>  - Set a personal repeating reminder
//
// This mod showcases:
//   - Delayed execution with runLater
//   - Recurring tasks with runRepeating
//   - Tick-to-second conversion (multiply by 20)
//   - Personal reminders per player
//   - Greedy string arguments (captures rest of message)
// ============================================================================

api.registerMod("scheduler_demo", {
    onInitialize(api) {
        // Example 1: One-Time Delayed Task
        // Schedule a message to be sent 5 seconds (100 ticks) after mod loads
        api.runLater(5 * 20, () => {
            api.sendMessage("§b[ThreadJS] 5 seconds have passed since startup.");
        });

        // Example 2: Repeating Task
        // Schedule a heartbeat log message every 10 seconds (200 ticks)
        api.runRepeating(10 * 20, () => {
            api.log("[scheduler-demo] Heartbeat (every 10 seconds).");
        });

        // Command: /js remind_me <seconds> <message...>
        // Description: Create a personal repeating reminder
        // Arguments: 
        //   - seconds: How often to remind (number)
        //   - message: What to remind (greedy string - captures everything after seconds)
        // Example: /js remind_me 30 Check the furnaces!
        api.registerCommand("remind_me", (ctx, args) => {
            if (!ctx.player) {
                ctx.reply("Only players can use this.");
                return;
            }
            if (args.length < 2) {
                ctx.reply("Usage: /js remind_me <seconds> <message...>");
                return;
            }
            const seconds = Number(args[0] || 10);
            const msg = args.slice(1).join(" ");

            api.runRepeating(seconds * 20, () => {
                api.sendMessageTo(ctx.player.name, `§e[Reminder] ${msg}`);
            });

            ctx.reply(`Reminder set every ${seconds}s: "${msg}"`);
        }, 0, false, ["int", "greedy"]);

        api.log("[scheduler-demo] Timers set up and remind_me command registered.");
    }
});