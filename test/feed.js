const assert = require("assert");
const runner = require("./setup/runner");
const fetch = require("node-fetch");

describe("Feed Test", async function() {

    const app = await runner();
    
    after(async () => await app.stop());
    
    it("Individual Feed Test", async() => {

        // Insert 3 orgs: damn bruh this aint sustainable
        const testOrgID1 = `test-org-${Date.now()}`;
        const validOrgform1 = {
            title: "Yuh",
            mission: "Fixing broken programmers",
            cause: [],
            zip: "92037",
            contact: "testemail@brokenprogrammers.org",
            url: "yuh.org",
            events: []
        };
        let orgDoc = app.db.orgs.formToDocument(validOrgform1);
        orgDoc.id = testOrgID1;
        await app.db.orgs.insert(orgDoc);

        const testOrgID2 = `test-org-${Date.now()}`;
        const validOrgform2 = {
            title: "Branson Foundation",
            mission: "Spreading the love for green",
            cause: [],
            zip: "92037",
            contact: "testemail@branson.org",
            url: "branson.org",
            events: []
        };
        let orgDoc = app.db.orgs.formToDocument(validOrgform2);
        orgDoc.id = testOrgID2;
        await app.db.orgs.insert(orgDoc);

        const testOrgID3 = `test-org-${Date.now()}`;
        const validOrgform3 = {
            title: "Vivian Foundation",
            mission: "Giving spaghetti to all people with spaghetti code",
            cause: [],
            zip: "92037",
            contact: "testemail@vivian.org",
            url: "vivian.org",
            events: []
        };
        let orgDoc = app.db.orgs.formToDocument(validOrgform3);
        orgDoc.id = testOrgID3;
        await app.db.orgs.insert(orgDoc);

        // TODO: Insert 1 event each

        // TODO: Add events to orgs


        // Insert individual
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

        // TODO: Make individual follow the orgs

        // TODO: Test GET request from individual to their feed

        // Delete org, events, and individual
        await app.db.orgs.delete(testOrgID1);
        await app.db.orgs.delete(testOrgID2);
        await app.db.orgs.delete(testOrgID3);
        //await app.db.events.delete(testEventID1);
        //await app.db.events.delete(testEventID2);
        //await app.db.events.delete(testEventID3);
        await app.db.inds.delete(testIndiID);
    });

    it("Org Feed Test", async() => {

        // Insert org
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

        // TODO: Insert 1 event each

        // TODO: Test GET request from organization to their feed

        // Delete org and events
        await app.db.orgs.delete(testOrgID);
        //await app.db.events.delete(testEventID1);
        //await app.db.events.delete(testEventID2);
        //await app.db.events.delete(testEventID3);
    });

});
