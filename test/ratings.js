const assert = require("assert");
const runner = require("./setup/runner");

describe("Basic Ratings Test", async function() {

    const app = await runner();
    
    after(async () => await app.stop());
    
    it("Ratings form validation", () => {
        
    });

    it("Database tests", async() => {
        
    });
});
