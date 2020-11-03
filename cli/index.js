process.once("unhandledRejection", err => app.logger.onError(err));

const fs = require("fs");
const path = require("path");
const readline = require("readline");

const Server = require("../src/server/index");
const ConfigPath = path.resolve(__dirname, "app-config.json");

/** @type {Server.DefaultConfig} */
let config;

if (fs.existsSync(ConfigPath)) {
    config = require(ConfigPath);
} else {
    config = Server.DefaultConfig;
    fs.writeFileSync(ConfigPath, JSON.stringify(config, null, 4));
}

const app = new Server(config);

require("./handler")(app);

app.start().then(() => {

    process.once("SIGINT", async () => {
        await app.stop();
        process.exit(0);
    });

    // No prompt for production
    if (app.config.env === "production" || 
        !process.stdin.isTTY) return;

    const repl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        removeHistoryDuplicates: true,
        prompt: "@ "
    });

    repl.on("line", async input => {
        app.logger.printFile(`@ ${input}`);
        try {
            let x = eval(input);
            while (x instanceof Promise) {
                app.logger.print("awaiting promise...");
                x = await x;
            }
            app.logger.print(x);
        } catch (e) {
            app.logger.warn(e);
        }
        repl.prompt(false);
    });

    repl.once("SIGINT", async () => {
        repl.close();
        app.logger.log("SIGINT received on CLI");
        await app.stop();

        process.exit(0);
    });

    repl.prompt(false);
});
