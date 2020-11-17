const fs = require("fs");
const path = require("path");

const admin = require("firebase-admin");
const express = require("express");
const nocache = require("nocache");
const body = require("body-parser");

const DB = require("../modules/database");
const walk = require("../modules/walk-dir");
const Logger = require("../modules/logger");

const DefaultConfig = {
    port: 3000,
    web: true
};

class Server {

    /** @param {typeof DefaultConfig} config */
    constructor(config = {}) {
        this.config = config;
        this.logger = new Logger();

        this.loadAPIRouter();

        this.app = express()
            .disable("x-powered-by");
        
        if (config.web) {
            this.app.use(express.static(path.resolve(__dirname, "..", "..", "public")));
        }
        this.app.use("/api", this.api);

        const certFile = path.resolve(__dirname, "..", "..", "cli", "admin-config.json");
        if (!fs.existsSync(certFile)) {
            throw new Error("Can NOT find admin-config.json for firebase-admin tool, exiting");
        }
        
        admin.initializeApp({
            credential: admin.credential.cert(require(certFile))
        });
        
        this.env = process.env["NODE_ENV"];
        this.firestore = admin.firestore();
        this.db = new DB(this);
    }

    get isDev() { return !this.isProd; }
    get isProd() { return this.env == "production"; }

    loadAPIRouter() {
        this.api = express.Router()
            .use(nocache())
            .use(body.json())
            .use(body.urlencoded({ extended: true }))
            .use((req, res, next) => {
                /** @type {string} */
                let token = req.params.token || req.body.token;
                delete req.body.token;
                
                if (!token) return next();

                admin.auth().verifyIdToken(token).then(decoded => {
                    req.payload = decoded;
                    next();
                }).catch(_ => {
                    this.logger.warn(`Invalid token received`);
                    res.sendStatus(403); // Unauthorized
                });
            });

        // Register endpoints
        walk(path.resolve(__dirname, "routers")).forEach(file => {
            /** @type {APIEndpointHandler} */
            const endpoint = require(file);
            if (!endpoint.handler || !endpoint.method || !endpoint.path)
                return void this.logger.warn(`Ignoring endpoint file at "${file}": module export not properly defined`);

            if (endpoint.pre && Array.isArray(endpoint.pre)) {
                this.api.use(endpoint.path, ...endpoint.pre);
            }

            this.api[endpoint.method](endpoint.path, endpoint.handler.bind(this));
            this.logger.debug(`Registering route ${endpoint.method.toUpperCase()} at ${endpoint.path}`);
        });

        // Redirect lurkers
        this.api.use((req, res) => {
            this.logger.onAccess(`Redirecting lurker from ${req.originalUrl}`);
            res.redirect("/");
        });
    }

    // Starts the server
    start() {
        if (this.webServer) return false;
        return new Promise((res, rej) => {
            this.webServer = this.app.listen(this.config.port, err => {
                if (err) return void rej(err);
                this.logger.log(`Webserver started`);
                res(true);
            });
        });
    }

    // Stops the server
    stop() {
        if (!this.webServer) return false;
        return new Promise((res, rej) => {
            this.webServer.close(err => {
                if (err) return void rej(err);
                this.logger.log(`Webserver closed`);
                res(true);
            });
            this.webServer = null;
        });
    }
}

Server.DefaultConfig = DefaultConfig;

module.exports = Server;