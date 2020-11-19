const assert = require("assert");
const runner = require("./setup/runner");
const fetch = require("node-fetch");

describe("Basic Organization Test", async function() {

    const app = await runner();
    
    after(async () => await app.stop());
    
    it("Organization form validation", () => {
        const invalid_form = {};
        let res = app.db.orgs.validate(invalid_form);
        assert(!!(res.error || res.errors), "Form shouldn't work");

        const empty_title = {
            title: "",
            mission: "Fixing broken programmers",
            cause: [],
            zip: "92037",
            contact: "testemail@brokenprogrammers.org",
            url: "yuh.org",
            events: ["Sample event"]
        };
        res = app.db.orgs.validate(empty_title);
        assert(!!(res.error || res.errors), "Expecting error");

        const empty_mission = {
            title: "Yuh",
            mission: "",
            cause: [],
            zip: "92037",
            contact: "testemail@brokenprogrammers.org",
            url: "yuh.org",
            events: ["Sample event"]
        };
        res = app.db.orgs.validate(empty_mission);
        assert(!!(res.error || res.errors), "Expecting error");

        const empty_contact = {
            title: "Yuh",
            mission: "Fixing broken programmers",
            cause: [],
            zip: "92037",
            contact: "",
            url: "yuh.org",
            events: ["Sample event"]
        };
        res = app.db.orgs.validate(empty_contact);
        assert(!!(res.error || res.errors), "Expecting error");

        const empty_url = {
            title: "Yuh",
            mission: "Fixing broken programmers",
            cause: [],
            zip: "92037",
            contact: "testemail@brokenprogrammers.org",
            url: "",
            events: ["Sample event"]
        };
        res = app.db.orgs.validate(empty_url);
        assert(!!(res.error || res.errors), "Expecting error");

        const validForm = {
            title: "Yuh",
            mission: "Fixing broken programmers",
            cause: [],
            zip: "92037",
            contact: "testemail@brokenprogrammers.org",
            url: "yuh.org",
            events: []
        };
        res = app.db.orgs.validate(validForm);
        assert.ifError(res.error || res.errors);

    });

    it("Organization Database CRUD tests", async() => {
        const testID = `org-test-${Date.now()}`;

        let none = await app.db.orgs.byID(testID);
        assert(!none.exists, "No document expected");

        let deleteRes = await app.db.orgs.delete(testID);
        assert(!deleteRes, "No document should be deleted");



        const valid_form = {
            title: "Habitat For Humanity",
            mission: "Fixing homelessness one family at a time",
            cause: ["Disaster Response"],
            zip: "92037",
            contact: "info@sandiegohabitat.org",
            url: "www.sandiegohabitat.org",
            events: []
        };
        let doc = app.db.orgs.formToDocument(valid_form);
        doc.id = testID;

        const ref = await app.db.orgs.insert(doc);
        const snapshot = await ref.get();
        // Create successful
        assert(snapshot.exists, "Document should be inserted");
        assert(snapshot.id == testID, "ID should match test ID");

        // Read document
        const readDoc = snapshot.data();
        assert(readDoc.zip == doc.zip, "Document zip should match");
        const oldLocation = readDoc.zip;

        // Update document
        const updated_form = {
            title: "Habitat For Humanity",
            mission: "Fixing homelessness one family at a time",
            cause: ["Disaster Response"],
            zip: "92122",
            contact: "info@sandiegohabitat.org",
            url: "www.sandiegohabitat.org",
            events: ["new event"]
        };
        doc = app.db.orgs.formToDocument(updated_form);
        const updated = await app.db.orgs.update(testID, doc);
        assert(updated, "Update operation should be successful");

        const readUpdatedDoc = (await app.db.orgs.byID(testID)).data();
        const newLocation = readUpdatedDoc.zip;
        assert(!(newLocation == oldLocation), "Location should be updated");

        // Delete document
        deleteRes = await app.db.orgs.delete(testID);
        assert(deleteRes, "Document should be deleted");

        none = await app.db.orgs.byID(testID);
        assert(!none.exists, "No document expected");
    });

    it("Organization Endpoint CRUD test", async() => {
        const testPayload = app.testPayload = {
            "uid": `org-test-${Date.now()}`,
            "name": "Habitat Fpr Humanity",
            "picture": "",
            "email": "example@habitat.org",
            "email_verified": true
        };

        // frontend form to create
        const test_auth_form = {
            title: "Habitat For Humanity",
            mission: "Fixing homelessness one family at a time",
            cause: ["Disaster Response"],
            zip: "92037",
            contact: "info@sandiegohabitat.org",
            url: "www.sandiegohabitat.org",
            events: []
        };

        /** @type {Response} */
        let res = await fetch(`http://localhost:${app.config.port}/api/profile/create?type=organization`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(test_auth_form)
        });

        assert(res.status == 200, `Valid form should return http status 200 instead of ${res.status}`);

        const data = (await app.db.orgs.byID(testPayload.uid)).data();
        assert(data.mission == test_auth_form.mission, "Mission should match in the submitted document");

        res = await fetch(`http://localhost:${app.config.port}/api/profile/create?type=organization`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(test_auth_form)
        });

        assert(res.status == 400, `Already existing profile should return 400 instead of ${res.status}`);

        await app.db.orgs.delete(testPayload.uid);

        // TODO: test other individual endpoints
    });

});
