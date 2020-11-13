const fs = require("fs");
const path = require("path");

/** @param {string} dir */
module.exports = dir => {
    /** @type {string[]} */
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            /* Recurse into a subdirectory */
            results = results.concat(module.exports(file));
        } else { 
            /* Is a file */
            results.push(file);
        }
    });
    return results;
}