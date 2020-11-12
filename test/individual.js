const assert = require("assert");
const runner = require("./setup/runner");

describe("Basic Individual Test", async function() {

    const app = await runner();
    
    after(async () => await app.stop());
    
    it("User form validation", () => {
        const invalid_form = {};
        let res = app.db.inds.validate(invalid_form);
        assert(!!(res.error || res.errors), "Expecting error");
        
        // TODO: 
        const valid_form = {
            firstname: "Branson",
            lastname: "Beihl",
            cause: ["Disaster Response"],
            zip: "92037"
        };
        res = app.db.inds.validate(valid_form);
        assert.ifError(res.error || res.errors);
        
        // Do stuff with res.value
    });

    it("Database tests", async() => {
        const testID = "individual_1234567890";

        const none = await app.db.inds.byID(testID);
        assert(!none.exists, "No document expected");

        let deleteRes = await app.db.inds.delete(testID);
        assert(!deleteRes, "No document should be deleted");

        const valid_form = {
            firstname: "Branson",
            lastname: "Beihl",
            cause: ["Disaster Response"],
            zip: "92037"
        };
        let doc = app.db.inds.create(valid_form);
        doc.id = testID;

        const writeRes = await app.db.inds.insert(doc);
        assert(writeRes, "Document should be inserted");

        const res = await app.db.inds.byID(testID);
        assert(res.exists, "Document should exist");
        assert(res.id == testID, "ID should match test ID");

        deleteRes = await app.db.inds.delete(testID);
        assert(deleteRes, "Document should be deleted");
    });

});
