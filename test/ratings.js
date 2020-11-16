const assert = require("assert");
const runner = require("./setup/runner");

describe("Basic Ratings Test", async function() {

    const app = await runner();
    
    after(async () => await app.stop());
    
    it("Ratings form validation", () => {
        const invalid_form = {};
        let res = app.db.ratings.validate(invalid_form);
        assert(!!(res.error || res.errors), "Expecting error");

        const valid_form = {
            stars: 4,
            description: "The organization was very friendly and absolutely warmed my heart helping those in need."
        };

        res = app.db.ratings.validate(valid_form);
        assert.ifError(res.error || res.errors);
    });

    it("Database Ratings CRUD tests", async() => {
        const testIndID = `test-ind-${Date.now()}`;

        const valid_form = {
            stars: 4,
            description: "The organization was very friendly and absolutely warmed my heart helping those in need."
        };
        
        let doc = app.db.ratings.formToDocument(valid_form);
        doc.owner = testIndID;

        const ref = await app.db.ratings.insert(doc);
        const snapshot = await ref.get();
        // Create successful
        assert(snapshot.exists, "Document should be inserted");

        // Read document
        const readDoc = snapshot.data();
        assert(readDoc.owner == testIndID, "Owner should match");
        const oldStars = readDoc.stars;

        // Update document
        const updated_form = {
            stars: 5,
            description: "The organization was very friendly and absolutely warmed my heart helping those in need."
        };
        doc = app.db.ratings.formToDocument(updated_form);
        const updated = await app.db.ratings.update(snapshot.id, doc);
        assert(updated, "Update operation should be successful");

        const readUpdatedDoc = (await app.db.ratings.byID(snapshot.id)).data();
        const newStars = readUpdatedDoc.stars;
        assert(oldStars !== newStars, "Stars should be updated");

        // Delete document
        const deleted = await app.db.ratings.delete(snapshot.id);
        assert(deleted, "Document should be deleted");

        const none = await app.db.ratings.byID(snapshot.id);
        assert(!none.exists, "No document expected");
    });

    it("Endpoint Ratings test", async() => {
        // TODO:
    });

});
