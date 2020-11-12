process.once("unhandledRejection", err => app.logger.onError(err));

const fs = require("fs");
const path = require("path");

const Server = require("../../src/server/index");
const ConfigPath = path.resolve(__dirname, "..", "..", "cli", "app-config.json");

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

after(async () => {
    await app.stop();
});

module.exports = async () => { 
    await app.start();
    return app;
}