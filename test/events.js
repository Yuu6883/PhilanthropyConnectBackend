const assert = require("assert");
const runner = require("./setup/runner");
const fetch = require("node-fetch");

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

    it("Database Events CRUD tests", async() => {

        const testOrgID = `test-org-${Date.now()}`;

        const valid_form = {
            title: "Brush with Kindness",
            details: "Help volunteer painting homes of those who can't do it themselves.",
            zip: "92037",
            skills: ["Painting"],
            date: Date.now()
        };

        let doc = app.db.events.formToDocument(valid_form);
        doc.owner = testOrgID;

        const ref = await app.db.events.insert(doc);
        const snapshot = await ref.get();
        // Create successful
        assert(snapshot.exists, "Document should be inserted");

        // Read document
        const readDoc = snapshot.data();
        assert(readDoc.owner == testOrgID, "Owner should match");
        const oldSkills = readDoc.skills;

        // Update document
        const updated_form = {
            title: "Brush with Kindness",
            details: "Help volunteer painting homes of those who can't do it themselves.",
            zip: "92037",
            skills: ["Painting", "Construction"],
            date: Date.now()
        };
        doc = app.db.events.formToDocument(updated_form);
        const updated = await app.db.events.update(snapshot.id, doc);
        assert(updated, "Update operation should be successful");

        const readUpdatedDoc = (await app.db.events.byID(snapshot.id)).data();
        const newSkills = readUpdatedDoc.skills;
        assert(oldSkills.length !== newSkills.length, "Skills should be updated");

        // Delete document
        const deleted = await app.db.events.delete(snapshot.id);
        assert(deleted, "Document should be deleted");

        const none = await app.db.events.byID(snapshot.id);
        assert(!none.exists, "No document expected");
    });

    // TODO
    it("Events Endpoint CRUD test", async() => {

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

        // CREATE TEST
        // frontend form to create
        const test_event_form = {
            title: "Beach Cleanup",
            details: "Clean up the beach this weekend for Earth Day!",
            zip: "92037",
            skills: [],
            date: Date.now()
        };

        app.testPayload = {
            "uid": testOrgID,
        };

        /** @type {Response} */
        const res = await fetch("http://localhost:3000/api/events/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(test_event_form)
        });

        assert(res.status == 200, `Invalid form should return http status 200 instead of ${res.status}`);
        const jsonRes = await res.json();
        assert(jsonRes.success, "Operation should be successful");
        
        const data = (await app.db.events.byID(jsonRes.id)).data();
        assert(data.owner == testOrgID, "Owner of event and test org ID should match");

        // TODO: test other events endpoints

        // Delete org and event
        await app.db.events.delete(jsonRes.id);
        await app.db.orgs.delete(testOrgID);

    });

});
