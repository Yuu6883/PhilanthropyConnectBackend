const assert = require("assert");
const runner = require("./setup/runner");
const fetch = require("node-fetch");

describe("Basic Ratings Test", async function() {

    const app = await runner();
    
    after(async () => await app.stop());
    
    it("Ratings form validation", () => {
        const invalidForm = {};
        let res = app.db.ratings.validate(invalidForm);
        assert(!!(res.error || res.errors), "Expecting error");

        const validForm = {
            stars: 4,
            description: "The organization was very friendly and absolutely warmed my heart helping those in need."
        };

        res = app.db.ratings.validate(validForm);
        assert.ifError(res.error || res.errors);
    });

    it("Database Ratings CRUD tests", async() => {
        const testIndID = `test-ind-${Date.now()}`;

        const validForm = {
            stars: 4,
            description: "The organization was very friendly and absolutely warmed my heart helping those in need."
        };
        
        let doc = app.db.ratings.formToDocument(validForm);
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
        const updatedForm = {
            stars: 5,
            description: "The organization was very friendly and absolutely warmed my heart helping those in need."
        };
        doc = app.db.ratings.formToDocument(updatedForm);
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

    it("Endpoint Ratings CRUD test", async() => {
        
        // insert org
        const testOrgID = `test-org-${Date.now()}`;
        const validOrgform = {
            title: "Yuh",
            mission: "Fixing broken programmers",
            cause: [],
            zip: "92037",
            contact: "testemail@brokenprogrammers.org",
            url: "yuh.org",
            events: []
        };
        let orgDoc = app.db.orgs.formToDocument(validOrgform);
        orgDoc.id = testOrgID;
        await app.db.orgs.insert(orgDoc);
        
        // insert individual
        const testIndiID = `test-indi-${Date.now()}`;
        const validIndiform = {
            firstname: "Branson",
            lastname: "Beihl",
            cause: ["Disaster Response"],
            zip: "92037",
            skills: ["exampleSkill"],
            age: "20-29"
        };
        let indiDoc = app.db.inds.formToDocument(validIndiform);
        indiDoc.id = testIndiID;
        await app.db.inds.insert(indiDoc);

        // CREATE TEST
        const testRatingForm = {
            stars: 4,
            description: "The organization was very friendly and absolutely warmed my heart helping those in need."
        };

        app.testPayload = {
            "uid": testIndiID,
        };

        /** @type {Response} */
        let res = await fetch(`http://localhost:${app.config.port}/api/organization/rate/${testOrgID}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(testRatingForm)
        });

        assert(res.status == 200, `Invalid form should return http status 200 instead of ${res.status}`);
        const jsonRes = await res.json();
        assert(jsonRes.success && jsonRes.id, "Operation should be successful");
        
        const data = (await app.db.ratings.byID(jsonRes.id)).data();
        assert(data.owner == testIndiID, "Owner of rating and test individual ID should match");

        // test catch
        res = await fetch(`http://localhost:${app.config.port}/api/organization/rate/nonExistingOrg`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(testRatingForm)
        });
        assert(res.status == 404, `Non existing org should return http status 404 instead of ${res.status}`);

        // TODO: test other ratings endpoints

        // Delete individual, org, and rating
        await app.db.inds.delete(testIndiID);
        await app.db.orgs.delete(testOrgID);
        await app.db.ratings.delete(jsonRes.id);
    });
});
