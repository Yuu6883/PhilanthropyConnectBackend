const assert = require("assert");
const runner = require("./setup/runner");

describe("Basic Events Test", async function() {

    const app = await runner();
    
    after(async () => await app.stop());
    
    it("Events form validation", () => {
        const invalid_form = {};
        let res = app.db.events.validate(invalid_form);
        assert(!!(res.error || res.errors), "Expecting error");

        const valid_form = {
            title: "Brush with Kindness",
            details: "Help volunteer painting homes of those who can't do it themselves.",
            zip: "92037",
            skills: ["Painting"],
            date: "05Nov2020 2:00PST"
        };

        res = app.db.events.validate(valid_form);
        assert.ifError(res.error || res.errors);

        // Do stuff with res.value
    });

    it("Database tests", async() => {
        const valid_form = {
            title: "Brush with Kindness",
            details: "Help volunteer painting homes of those who can't do it themselves.",
            zip: "92037",
            skills: ["Painting"],
            date: "05Nov2020 2:00PST"
        };

        let doc = app.db.events.create(valid_form);

        const writeRes = await app.db.events.insert(doc);
        assert(writeRes, "Document should be inserted");

        //deleteRes = await app.db.inds.delete(testID);
        //assert(deleteRes, "Document should be deleted");
    });

    it("Database mock test", async() => {
    });

});
