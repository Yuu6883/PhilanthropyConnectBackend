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

    it("Database CRUD tests", async() => {
        const testID = `indi-test-${Date.now()}`;

        let none = await app.db.inds.byID(testID);
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

        const ref = await app.db.inds.insert(doc);
        const snapshot = await ref.get();
        // Create successful
        assert(snapshot.exists, "Document should be inserted");
        assert(snapshot.id == testID, "ID should match test ID");

        // Read document
        const readDoc = snapshot.data();
        assert(readDoc.zip == doc.zip, "Document zip should match");
        const oldLocation = readDoc.location;

        // Update document
        const updated_form = {
            firstname: "Branson",
            lastname: "Beihl",
            cause: ["Disaster Response"],
            zip: "92122"
        };
        doc = app.db.inds.create(updated_form);
        const updated = await app.db.inds.update(testID, doc);
        assert(updated, "Update operation should be successful");

        const readUpdatedDoc = (await app.db.inds.byID(testID)).data();
        const newLocation = readUpdatedDoc.location;
        assert(!newLocation.isEqual(oldLocation), "Location should be updated");

        // Delete document
        deleteRes = await app.db.inds.delete(testID);
        assert(deleteRes, "Document should be deleted");

        none = await app.db.inds.byID(testID);
        assert(!none.exists, "No document expected");
    });

    it("Endpoint test", async() => {
        // TODO:
    });

});
