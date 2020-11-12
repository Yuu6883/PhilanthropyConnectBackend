/** @type {{[zip: string] : [lat: number, long: number]}} */
const data = require("../../data/us-zip.json");
const map = new Map(Object.entries(data));

module.exports = { map };