const assert = require("assert");
const runner = require("./setup/runner");

describe("Basic Individual Test", async function() {

    const app = await runner();
    
    after(async () => await app.stop());
    let error = null;

    it("User form validation", () => {
        const invalid_form = {};
        error = app.db.inds.schema.validate(invalid_form);
        assert(!!error, "Expecting error");
        
        const valid_form = {
            firstname: "Branson",
            lastname: "Beihl",
            cause: ["Disaster Response"]
        };
        error = app.db.inds.schema.validate(valid_form);
        assert.ifError(error);
    });

    it("Database tests", async() => {
        const testID = "individual_1234567890";

        const none = await app.db.inds.getByID(testID);
        assert(!none.exists, "No document expected");

        let deleteRes = await app.db.inds.delete(testID);
        assert(!deleteRes, "No document should be deleted");

        const valid_form = {
            firstname: "Branson",
            lastname: "Beihl",
            cause: ["Disaster Response"]
        };
        let doc = app.db.inds.schema.from(valid_form);
        doc.id = testID;

        const writeRes = await app.db.inds.insert(doc);
        assert(writeRes, "Document should be inserted");

        const res = await app.db.inds.getByID(testID);
        assert(res.exists, "Document should exist");
        assert(res.id == testID, "ID should match test ID");

        deleteRes = await app.db.inds.delete(testID);
        assert(deleteRes, "Document should be deleted");
    });

});
