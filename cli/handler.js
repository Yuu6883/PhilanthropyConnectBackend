let settings = {
    showingConsole: {
        PRINT: true,
        FILE: false,
        DEBUG: false,
        ACCESS: false,
        INFO: true,
        WARN: true,
        ERROR: true,
        FATAL: true,
        TEST: true,
    },
    showingFile: {
        PRINT: true,
        FILE: true,
        DEBUG: true,
        ACCESS: true,
        INFO: true,
        WARN: true,
        ERROR: true,
        FATAL: true,
        TEST: true
    },
    fileLogDirectory: "./logs/",
    fileLogSaveOld: true
};

const { EOL } = require("os");
const fs = require("fs");
const configPath = "./log-config.json";

if (fs.existsSync(configPath))
    settings = Object.assign(settings, JSON.parse(fs.readFileSync(configPath, "utf-8")));
fs.writeFileSync(configPath, JSON.stringify(settings, null, 4), "utf-8");

/**
 * @param {Date=} date
 */
function dateTime(date) {
    const dy = date.getFullYear();
    const dm = ("00" + (date.getMonth() + 1)).slice(-2);
    const dd = ("00" + (date.getDate())).slice(-2);
    const th = ("00" + (date.getHours())).slice(-2);
    const tm = ("00" + (date.getMinutes())).slice(-2);
    const ts = ("00" + (date.getSeconds())).slice(-2);
    const tz = ("000" + (date.getMilliseconds())).slice(-3);
    return `${dy}-${dm}-${dd} ${th}:${tm}:${ts}.${tz}`;
}

/**
 * @param {Date} date
 */
function filename(date) {
    const dy = date.getFullYear();
    const dm = ("00" + (date.getMonth() + 1)).slice(-2);
    const dd = ("00" + (date.getDate())).slice(-2);
    const th = ("00" + (date.getHours())).slice(-2);
    const tm = ("00" + (date.getMinutes())).slice(-2);
    const ts = ("00" + (date.getSeconds())).slice(-2);
    return `${dy}-${dm}-${dd}T${th}-${tm}-${ts}.log`;
}

const logFolder = settings.fileLogDirectory;
const logFile = `${settings.fileLogDirectory}latest.log`;
const oldLogsFolder = settings.fileLogDirectory + "old/";

if (!fs.existsSync(logFolder)) fs.mkdirSync(logFolder);
if (fs.existsSync(logFile)) {
    if (settings.fileLogSaveOld) {
        if (!fs.existsSync(oldLogsFolder)) fs.mkdirSync(oldLogsFolder);
        const oldLogFile = `${settings.fileLogDirectory}old/${filename(fs.statSync(logFile).ctime)}`;
        fs.renameSync(logFile, oldLogFile);
    } else fs.unlinkSync(logFile);
}

let fstream = fs.createWriteStream(logFile, { flags: "wx" });
/** @type {string[]} */
let fqueue = [];
/** @type {string} */
let fconsuming = null;
let fprocessing = false;
let synchronous = false;

/**
 * @param {Date} date
 * @param {LogEventLevel} level
 * @param {string} message
 */
function formatConsole(date, level, message) {
    /** @type {{ [level: string]: string }} */
    const levelFormat = process.stdout.isTTY ? {
        DEBUG:  "\x1b[90m DEBUG\x1b[0m",
        ACCESS:         "ACCESS",
        INFO:   "\x1b[92m  INFO\x1b[0m",
        WARN:   "\x1b[93m  WARN\x1b[0m",
        ERROR:  "\x1b[91m ERROR\x1b[0m",
        FATAL:  "\x1b[31m FATAL\x1b[0m",
        TEST:   "\x1b[36m  TEST\x1b[0m"
    } : {
        DEBUG:  " DEBUG",
        ACCESS: "ACCESS",
        INFO:   "  INFO",
        WARN:   "  WARN",
        ERROR:  " ERROR",
        FATAL:  " FATAL",
        TEST:   "  TEST"
    };
    switch (level) {
        case "PRINT":
        case "FILE":
            return message;
        default: return `\x1b[90m${dateTime(date)}\x1b[0m ${levelFormat[level]} ${message}`;
    }
}
/**
 * @param {Date} date
 * @param {LogEventLevel} level
 * @param {string} message
 */
function formatFile(date, level, message) {
    switch (level) {
        case "PRINT":
        case "FILE":
            return `${dateTime(date)} ${message}`;
        default: return `${dateTime(date)} [${level}] ${message}`;
    }
}

/**
 * @param {Date} date
 * @param {LogEventLevel} level
 * @param {string} message
 */
function write(date, level, message) {
    if (settings.showingConsole[level])
        console.log(formatConsole(date, level, message));
    if (settings.showingFile[level]) {
        fqueue.push(formatFile(date, level, message) + EOL);
        if (!fprocessing && !synchronous) fprocess();
    }
}

function fprocess() {
    fconsuming = null;
    if (fqueue.length === 0)
        return void (fprocessing = false);
    fconsuming = fqueue.join("");
    fstream.write(fconsuming, fprocess);
    fqueue.splice(0);
    return void (fprocessing = true);
}

function fprocessSync() {
    fstream.destroy();
    fstream = null;
    const tail = fqueue.join("");
    fs.appendFileSync(logFile, tail, "utf-8");
    fqueue.splice(0);
}

process.once("uncaughtException", function(e) {
    synchronous = true;
    write(new Date(), "FATAL", e.stack);
    console.error(e);
    fprocessSync();
    process.removeAllListeners("exit");
    process.exit(1);
});

process.once("exit", function(code) {
    synchronous = true;
    write(new Date(), "DEBUG", `process ended with code ${code}`);
    fprocessSync();
});

/** @param {import("../src/server/index")} server */
module.exports = server => void(server.logger.onlog = write);
