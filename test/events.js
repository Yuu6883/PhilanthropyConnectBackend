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
            date: Date.now()
        };

        res = app.db.events.validate(valid_form);
        assert.ifError(res.error || res.errors);
    });

    it("Database Create & Delete tests", async() => {

        const testOrgID = `test-org-${Date.now()}`;

        const valid_form = {
            title: "Brush with Kindness",
            details: "Help volunteer painting homes of those who can't do it themselves.",
            zip: "92037",
            skills: ["Painting"],
            date: Date.now()
        };

        let doc = app.db.events.create(valid_form);

        doc.owner = testOrgID;
        const ref = await app.db.events.insert(doc);
        assert((await ref.get()).exists, "Document should be inserted");

        const deleted = await app.db.events.delete(ref.id);
        assert(deleted, "Document should be deleted");
    });

    it("Database Read test", async() => {
        // TODO
    });

    it("Database Update test", async() => {
        // TODO: maybe just have front end send everything/post form again, instead of only sending the changed fields in the object
    });

});
