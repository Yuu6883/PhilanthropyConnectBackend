const fs = require("fs");

// data is from https://www.census.gov/geographies/reference-files/time-series/geo/gazetteer-files.html
const lines = fs.readFileSync("data.txt", "utf8").split("\n").slice(1).filter(s => s);

const out = {};

lines.forEach(line => {
    const [zip, a, b, c, d, lat, long] = line.split("\t");
    out[zip] = [lat, long].map(Number);
});

fs.writeFileSync("us-zip.json", JSON.stringify(out, null, 4));