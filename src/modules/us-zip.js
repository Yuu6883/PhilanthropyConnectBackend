/** @type {{[zip: string] : [lat: number, long: number]}} */
const data = require("../../data/us-zip.json");
const map = new Map(Object.entries(data));

let lastLocation;
for (let i = 601; i < 99929; i++) {
    const zip = i.toString().padStart(5, "0");
    if (map.has(zip)) lastLocation = map.get(zip);
    else map.set(zip, lastLocation);
}

module.exports = { map };