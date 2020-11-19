const assert = require("assert");
const runner = require("./setup/runner");
const fetch = require("node-fetch");

describe("Basic Individual Test", async function() {

    const app = await runner();
    
    after(async () => await app.stop());
    
    /**
     * Testing individual fields within the user form
     * Expected behavior: 
     * First and Last: required, alphanumeric
     * and 2 < length < 40
     * Cause: can be empty, must be within the supported
     * valid causes
     * Zip: Required, must be valid zip code
     * Skills: can be empty, must be within supported 
     * valid skills
     * Age: Must be one of the valid age ranges, required
     */
    it("Individual User form validation", () => {
        const invalid_form = {};
        let res = app.db.inds.validate(invalid_form);
        assert(!!(res.error || res.errors), "Expecting error");

        const empty_first = {
            firstname: "",
            lastname: "Beihl",
            cause: [],
            zip: "92037",
            skills: ["exampleSkill"],
            age: "20-29"
        };
        res = app.db.inds.validate(empty_first);
        assert(!!(res.error || res.errors), "Expecting error");

        const invalid_first = {
            firstname: "Branson@",
            lastname: "Beihl",
            cause: [],
            zip: "92037",
            skills: ["exampleSkill"],
            age: "20-29"
        };
        res = app.db.inds.validate(invalid_first);
        assert(!!(res.error || res.errors), "Expecting error");

        const empty_last = {
            firstname: "Branson@",
            lastname: "Beihl",
            cause: [],
            zip: "92037",
            skills: ["exampleSkill"],
            age: "20-29"
        };
        res = app.db.inds.validate(empty_last);
        assert(!!(res.error || res.errors), "Expecting error");

        const invalid_last = {
            firstname: "Branson",
            lastname: "Beihl@",
            cause: [],
            zip: "92037",
            skills: ["exampleSkill"],
            age: "20-29"
        };
        res = app.db.inds.validate(invalid_last);
        assert(!!(res.error || res.errors), "Expecting error");

        const empty_cause = {
            firstname: "Branson",
            lastname: "Beihl",
            cause: [],
            zip: "92037",
            skills: ["exampleSkill"],
            age: "20-29"
        };
        res = app.db.inds.validate(empty_cause);
        assert.ifError(res.error || res.errors);

        const invalid_cause = {
            firstname: "Branson",
            lastname: "Beihl",
            cause: ["Invalid Cause"],
            zip: "92037",
            skills: ["exampleSkill"],
            age: "20-29"
        };
        res = app.db.inds.validate(invalid_cause);
        assert(!!(res.error || res.errors), "Expecting error");

        const empty_zip = {
            firstname: "Branson",
            lastname: "Beihl",
            cause: ["Disaster Response"],
            zip: "",
            skills: ["exampleSkill"],
            age: "20-29"
        };
        res = app.db.inds.validate(empty_zip);
        assert(!!(res.error || res.errors), "Expecting error");

        const invalid_zip = {
            firstname: "Branson",
            lastname: "Beihl",
            cause: ["Disaster Response"],
            zip: "920371",
            skills: ["exampleSkill"],
            age: "20-29"
        };
        res = app.db.inds.validate(invalid_zip);
        assert(!!(res.error || res.errors), "Expecting error");

        const empty_skills = {
            firstname: "Branson",
            lastname: "Beihl",
            cause: ["Disaster Response"],
            zip: "92037",
            skills: [],
            age: "20-29"
        };
        res = app.db.inds.validate(empty_skills);
        assert.ifError(res.error || res.errors);
        
        const empty_age = {
            firstname: "Branson",
            lastname: "Beihl",
            cause: ["Disaster Response"],
            zip: "92037",
            skills: ["exampleSkill"],
            age: ""
        };
        res = app.db.inds.validate(empty_age);
        assert(!!(res.error || res.errors), "Expecting error");

        const invalid_age = {
            firstname: "Branson",
            lastname: "Beihl",
            cause: ["Disaster Response"],
            zip: "92037",
            skills: ["exampleSkill"],
            age: "20-295837"
        };
        res = app.db.inds.validate(invalid_age);
        assert(!!(res.error || res.errors), "Expecting error");

        const valid_form = {
            firstname: "Branson",
            lastname: "Beihl",
            cause: ["Disaster Response"],
            zip: "92037",
            skills: ["exampleSkill"],
            age: "20-29"
        };
        res = app.db.inds.validate(valid_form);
        assert.ifError(res.error || res.errors);
        
        // Do stuff with res.value
    });

    it("Individual Database CRUD tests", async() => {
        const testID = `indi-test-${Date.now()}`;

        let none = await app.db.inds.byID(testID);
        assert(!none.exists, "No document expected");

        let deleteRes = await app.db.inds.delete(testID);
        assert(!deleteRes, "No document should be deleted");

        const valid_form = {
            firstname: "Branson",
            lastname: "Beihl",
            cause: ["Disaster Response"],
            zip: "92037",
            skills: ["exampleSkill"],
            age: "20-29"
        };
        let doc = app.db.inds.formToDocument(valid_form);
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
            zip: "92122",
            skills: ["exampleSkill"],
            age: "20-29"
        };
        doc = app.db.inds.formToDocument(updated_form);
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

    it("Individual Endpoint CRUD test", async() => {

        const testPayload = app.testPayload = {
            "uid": `indi-test-${Date.now()}`,
            "name": "Branson Beihl",
            "picture": "",
            "email": "example@ucsd.edu",
            "email_verified": true
        };

        // frontend form to create
        const test_auth_form = {
            firstname: "Branson",
            lastname: "Beihl",
            cause: ["Disaster Response"],
            zip: "92122",
            skills: ["exampleSkill"],
            age: "20-29"
        };

        /** @type {Response} */
        const res = await fetch("http://localhost:3000/api/profile/create?type=individual", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(test_auth_form)
        });

        assert(res.status == 200, `Invalid form should return http status 200 instead of ${res.status}`);

        const data = (await app.db.inds.byID(testPayload.uid)).data();
        assert(data.age == test_auth_form.age, "Age should match in the submitted document");

        await app.db.inds.delete(testPayload.uid);

        // TODO: test other individual endpoints
    });

});
