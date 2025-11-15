// world-tools.js
// Simple world manipulation and entity utilities, Rhino-friendly (ES5).

api.registerMod("world_tools", {
    onInitialize: function (api) {

        // /js pillar <height>
        api.registerCommand("pillar", function (ctx, args) {
            if (!ctx.player) {
                ctx.reply("Only players can use this.");
                return;
            }

            var height = args.length > 0 ? Number(args[0]) : 5;
            var target = api.raycastBlock(ctx.player.name, 100);
            
            if (!target) {
                ctx.reply("No block in sight (within 100 blocks).");
                return;
            }

            var x = target.x;
            var y = target.y;
            var z = target.z;
            var dim = target.dimensionId;

            for (var i = 0; i < height; i++) {
                api.setBlock(x, y + i, z, dim, "minecraft:stone");
            }
            ctx.reply("Built a stone pillar of height " + height + " at " + x + "," + y + "," + z + ".");
        }, 0, false, ["int"]);

        // /js clear_pillar <height>
        api.registerCommand("clear_pillar", function (ctx, args) {
            if (!ctx.player) {
                ctx.reply("Only players can use this.");
                return;
            }

            var height = args.length > 0 ? Number(args[0]) : 5;
            var target = api.raycastBlock(ctx.player.name, 100);
            
            if (!target) {
                ctx.reply("No block in sight (within 100 blocks).");
                return;
            }

            var x = target.x;
            var y = target.y;
            var z = target.z;
            var dim = target.dimensionId;

            for (var i = 0; i < height; i++) {
                api.setBlock(x, y + i, z, dim, "minecraft:air");
            }
            ctx.reply("Cleared pillar of height " + height + " at " + x + "," + y + "," + z + ".");
        }, 0, false, ["int"]);

        // /js fill_box <dx> <dy> <dz> <blockId>
        api.registerCommand("fill_box", function (ctx, args) {
            if (!ctx.player) {
                ctx.reply("Only players can use this.");
                return;
            }
            if (args.length < 4) {
                ctx.reply("Usage: /js fill_box <dx> <dy> <dz> <blockId>");
                return;
            }

            var dx = Number(args[0]);
            var dy = Number(args[1]);
            var dz = Number(args[2]);
            var blockId = args[3];

            var pos = ctx.player.pos;
            var x1 = Math.floor(pos[0]);
            var y1 = Math.floor(pos[1]);
            var z1 = Math.floor(pos[2]);
            var x2 = Math.floor(pos[0] + dx);
            var y2 = Math.floor(pos[1] + dy);
            var z2 = Math.floor(pos[2] + dz);
            var dim = ctx.player.dimensionId;

            var placed = api.fillArea(x1, y1, z1, x2, y2, z2, dim, blockId);
            ctx.reply("Filled " + placed + " blocks of " + blockId + ".");
        }, 0, false, ["int", "int", "int", "word"]);

        // /js spawn_zombies <count> <radius>
        api.registerCommand("spawn_zombies", function (ctx, args) {
            if (!ctx.player) {
                ctx.reply("Only players can use this.");
                return;
            }

            var count = args.length > 0 ? Number(args[0]) : 3;
            var radius = args.length > 1 ? Number(args[1]) : 5;
            var pos = ctx.player.pos;
            var x = pos[0];
            var y = pos[1];
            var z = pos[2];
            var dim = ctx.player.dimensionId;

            for (var i = 0; i < count; i++) {
                var ox = x + (Math.random() - 0.5) * radius * 2;
                var oz = z + (Math.random() - 0.5) * radius * 2;
                api.spawnEntity("minecraft:zombie", ox, y, oz, dim);
            }
            ctx.reply("Spawned " + count + " zombies.");
        }, 0, false, ["int", "int"]);

        // /js kill_nearby <radius>
        api.registerCommand("kill_nearby", function (ctx, args) {
            if (!ctx.player) {
                ctx.reply("Only players can use this.");
                return;
            }

            var radius = args.length > 0 ? Number(args[0]) : 10;
            var pos = ctx.player.pos;
            var x = pos[0];
            var y = pos[1];
            var z = pos[2];
            var dim = ctx.player.dimensionId;

            var entities = api.findEntities({
                center: { x: x, y: y, z: z, dimensionId: dim },
                radius: radius
            });

            var killed = 0;
            for (var i = 0; i < entities.length; i++) {
                var e = entities[i];
                // Avoid killing players
                if (e.typeId && e.typeId.indexOf("minecraft:player") !== 0) {
                    if (api.killEntity(e.uuid)) {
                        killed++;
                    }
                }
            }
            ctx.reply("Killed " + killed + " nearby entities (radius " + radius + ").");
        }, 0, false, ["int"]);

        api.log("[world-tools] Commands registered: pillar, clear_pillar, fill_box, spawn_zombies, kill_nearby");
    }
});