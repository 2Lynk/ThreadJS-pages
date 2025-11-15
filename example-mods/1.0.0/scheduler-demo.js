// scheduler-demo.js
// Demonstrates api.runLater and api.runRepeating.

api.registerMod("scheduler_demo", {
    onInitialize(api) {
        // One-time message 5 seconds after startup (5s = 5 * 20 ticks)
        api.runLater(5 * 20, () => {
            api.sendMessage("§b[ThreadJS] 5 seconds have passed since startup.");
        });

        // Repeating heartbeat every 10 seconds
        api.runRepeating(10 * 20, () => {
            api.log("[scheduler-demo] Heartbeat (every 10 seconds).");
        });

        // Command to set a personal repeating reminder
        // /js remind_me <seconds> <message...>
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
