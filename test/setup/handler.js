/**
 * @param {Date} date
 * @param {string} level
 * @param {string} message
 */
function formatConsole(date, level, message) {
    /** @type {{ [level: string]: string }} */
    const levelFormat = {
        DEBUG:  "\x1b[90m DEBUG\x1b[0m",
        ACCESS:         "ACCESS",
        INFO:   "\x1b[92m  INFO\x1b[0m",
        WARN:   "\x1b[93m  WARN\x1b[0m",
        ERROR:  "\x1b[91m ERROR\x1b[0m",
        FATAL:  "\x1b[31m FATAL\x1b[0m",
        TEST:   "\x1b[36m  TEST\x1b[0m"
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
function write(date, level, message) {
    console.log(formatConsole(date, level, message));
}

/** @param {Date} date */
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

/** @param {import("../../src/server/index")} server */
module.exports = server => void(server.logger.onlog = write);