const assert = require("assert");
const runner = require("./setup/runner");

describe("Basic Organization Test", async function() {

    const app = await runner();
    
    after(async () => await app.stop());
    
    it("Organization form validation", () => {
        
    });

    it("Database tests", async() => {
        
    });

    it("Database mock test", async() => {
    });

});
