const assert = require("assert");
const runner = require("./setup/runner");
const fetch = require("node-fetch");

describe("Basic Events Test", async function() {
    
    const app = await runner();
    
    after(async () => await app.stop());
    
    /**
     * Testing events fields within the user form
     * Expected behavior: 
     * Title: required, alphanumeric
     * and 2 < length < 40
     * Details: required, alphanumeric
     * and 2 < length < 200
     * Zip: Required, must be valid zip code
     * Skills: can be empty, must be within supported 
     * valid skills
     * Date: required
     */
    it("Events form validation", () => {
        const invalidForm = {};
        let res = app.db.events.validate(invalidForm);
        assert(!!(res.error || res.errors), "Expecting error");

        const validForm = {
            title: "Brush with Kindness",
            details: "Help volunteer painting homes of those who can't do it themselves.",
            zip: "92037",
            skills: ["Art skills"],
            date: Date.now()
        };

        res = app.db.events.validate(validForm);
        assert.ifError(res.error || res.errors);
    });

    it("Database Events CRUD tests", async() => {

        const testOrgID = `test-org-${Date.now()}`;
        const validForm = {
            title: "Brush with Kindness",
            details: "Help volunteer painting homes of those who can't do it themselves.",
            zip: "92037",
            skills: ["Art skills"],
            date: Date.now()
        };

        let doc = app.db.events.formToDocument(validForm);
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
        const updatedForm = {
            title: "Brush with Kindness",
            details: "Help volunteer painting homes of those who can't do it themselves.",
            zip: "92037",
            skills: ["Art skills", "Multimedia"],
            date: Date.now()
        };
        doc = app.db.events.formToDocument(updatedForm);
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

    it("Events Endpoint CRUD test", async() => {

        // insert org
        const testOrgID = `test-org-${Date.now()}`;
        const validOrgform = {
            title: "Yuh",
            mission: "Fixing broken programmers",
            causes: [],
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
        const testEventForm = {
            title: "Beach Cleanup",
            details: "Clean up the beach this weekend for Earth Day!",
            zip: "92037",
            skills: [],
            date: Date.now()
        };

        app.testPayload = {
            "uid": testOrgID,
        };

        // Create endpoint tests
        /** @type {Response} */
        let res = await fetch(`http://localhost:${app.config.port}/api/events/create`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(testEventForm)
        });

        assert(res.status == 200, `Valid form should return http status 200 instead of ${res.status}`);
        let jsonRes = await res.json();
        const eventID = jsonRes.id;
        assert(jsonRes.success && eventID, "Operation should be successful");
        
        const data = (await app.db.events.byID(eventID)).data();
        assert(data.owner == testOrgID, "Owner of event and test org ID should match");

        // Get endpoint
        res = await fetch(`http://localhost:${app.config.port}/api/events/${eventID}`, {
            method: "GET"
        });

        jsonRes = await res.json();
        
        assert(res.status == 200, `Read endpoint should return http status 200 instead of ${res.status}`);
        assert(jsonRes.owner == testOrgID && jsonRes.zip == "92037", "Event document data should match");

        const testUpdateEventForm = {
            title: "Beach Cleanup",
            details: "Clean up the beach this weekend for Earth Day!",
            zip: "92122",
            skills: [],
            date: Date.now()
        };

        // Update tests
        res = await fetch(`http://localhost:${app.config.port}/api/events/${eventID}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(testUpdateEventForm)
        });
        assert(res.status == 200, `Update endpoint should return http status 200 instead of ${res.status} (${res.statusText})`);

        app.testPayload.uid = "some-other-uid";
        res = await fetch(`http://localhost:${app.config.port}/api/events/${eventID}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(testUpdateEventForm)
        });
        assert(res.status == 401, "Unauthorized response expected on update endpoint");

        // Delete tests
        res = await fetch(`http://localhost:${app.config.port}/api/events/${eventID}`, {
            method: "DELETE"
        });
        assert(res.status == 401, "Unauthorized response expected on delete endpoint");
        // Put back payload id
        app.testPayload.uid = testOrgID;
        
        res = await fetch(`http://localhost:${app.config.port}/api/events/${eventID}`, {
            method: "DELETE"
        });
        assert(res.status == 200, `Delete endpoint should return http status 200 instead of ${res.status} (${res.statusText})`);

        // Confirm the event is deleted
        res = await fetch(`http://localhost:${app.config.port}/api/events/${eventID}`, {
            method: "GET"
        });
        assert(res.status == 404, `Read endpoint should return http status 404 instead of ${res.status} (${res.statusText})`);

        // Delete org and event
        await app.db.events.delete(eventID);
        await app.db.orgs.delete(testOrgID);
    });

});
