const assert = require("assert");
const runner = require("./setup/runner");

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
            title: "Yuh",
            mission: "Fixing broken programmers",
            cause: [],
            zip: "92037",
            contact: "testemail@brokenprogrammers.org",
            url: "yuh.org",
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
            title: "Yuh",
            mission: "Fixing broken programmers",
            cause: [],
            zip: "92122",
            contact: "testemail@brokenprogrammers.org",
            url: "yuh.org",
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

    it("Organization Database mock test", async() => {
    });

});
