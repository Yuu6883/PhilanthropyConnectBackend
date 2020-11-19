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
        const invalidForm = {};
        let res = app.db.inds.validate(invalidForm);
        assert(!!(res.error || res.errors), "Expecting error");

        const emptyFirstnameForm = {
            firstname: "",
            lastname: "Beihl",
            cause: [],
            zip: "92037",
            skills: ["exampleSkill"],
            age: "20-29"
        };
        res = app.db.inds.validate(emptyFirstnameForm);
        assert(!!(res.error || res.errors), "Expecting error");

        const invalidFirstnameForm = {
            firstname: "Branson@",
            lastname: "Beihl",
            cause: [],
            zip: "92037",
            skills: ["exampleSkill"],
            age: "20-29"
        };
        res = app.db.inds.validate(invalidFirstnameForm);
        assert(!!(res.error || res.errors), "Expecting error");

        const emptyLastnameForm = {
            firstname: "Branson@",
            lastname: "Beihl",
            cause: [],
            zip: "92037",
            skills: ["exampleSkill"],
            age: "20-29"
        };
        res = app.db.inds.validate(emptyLastnameForm);
        assert(!!(res.error || res.errors), "Expecting error");

        const invalidLastnameForm = {
            firstname: "Branson",
            lastname: "Beihl@",
            cause: [],
            zip: "92037",
            skills: ["exampleSkill"],
            age: "20-29"
        };
        res = app.db.inds.validate(invalidLastnameForm);
        assert(!!(res.error || res.errors), "Expecting error");

        const emptyCauseForm = {
            firstname: "Branson",
            lastname: "Beihl",
            cause: [],
            zip: "92037",
            skills: ["exampleSkill"],
            age: "20-29"
        };
        res = app.db.inds.validate(emptyCauseForm);
        assert.ifError(res.error || res.errors);

        const invalidCauseForm = {
            firstname: "Branson",
            lastname: "Beihl",
            cause: ["Invalid Cause"],
            zip: "92037",
            skills: ["exampleSkill"],
            age: "20-29"
        };
        res = app.db.inds.validate(invalidCauseForm);
        assert(!!(res.error || res.errors), "Expecting error");

        const emptyZipForm = {
            firstname: "Branson",
            lastname: "Beihl",
            cause: ["Disaster Response"],
            zip: "",
            skills: ["exampleSkill"],
            age: "20-29"
        };
        res = app.db.inds.validate(emptyZipForm);
        assert(!!(res.error || res.errors), "Expecting error");

        const invalidZipForm = {
            firstname: "Branson",
            lastname: "Beihl",
            cause: ["Disaster Response"],
            zip: "920371",
            skills: ["exampleSkill"],
            age: "20-29"
        };
        res = app.db.inds.validate(invalidZipForm);
        assert(!!(res.error || res.errors), "Expecting error");

        const emptySkillsForm = {
            firstname: "Branson",
            lastname: "Beihl",
            cause: ["Disaster Response"],
            zip: "92037",
            skills: [],
            age: "20-29"
        };
        res = app.db.inds.validate(emptySkillsForm);
        assert.ifError(res.error || res.errors);
        
        const emptyAgeForm = {
            firstname: "Branson",
            lastname: "Beihl",
            cause: ["Disaster Response"],
            zip: "92037",
            skills: ["exampleSkill"],
            age: ""
        };
        res = app.db.inds.validate(emptyAgeForm);
        assert(!!(res.error || res.errors), "Expecting error");

        const invalidAgeForm = {
            firstname: "Branson",
            lastname: "Beihl",
            cause: ["Disaster Response"],
            zip: "92037",
            skills: ["exampleSkill"],
            age: "20-295837"
        };
        res = app.db.inds.validate(invalidAgeForm);
        assert(!!(res.error || res.errors), "Expecting error");

        const validForm = {
            firstname: "Branson",
            lastname: "Beihl",
            cause: ["Disaster Response"],
            zip: "92037",
            skills: ["exampleSkill"],
            age: "20-29"
        };
        res = app.db.inds.validate(validForm);
        assert.ifError(res.error || res.errors);
        
        // Do stuff with res.value
    });

    it("Individual Database CRUD tests", async() => {
        const testID = `indi-test-${Date.now()}`;

        let none = await app.db.inds.byID(testID);
        assert(!none.exists, "No document expected");

        let deleteRes = await app.db.inds.delete(testID);
        assert(!deleteRes, "No document should be deleted");

        const validForm = {
            firstname: "Branson",
            lastname: "Beihl",
            cause: ["Disaster Response"],
            zip: "92037",
            skills: ["exampleSkill"],
            age: "20-29"
        };
        let doc = app.db.inds.formToDocument(validForm);
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
        const updatedForm = {
            firstname: "Branson",
            lastname: "Beihl",
            cause: ["Disaster Response"],
            zip: "92122",
            skills: ["exampleSkill"],
            age: "20-29"
        };
        doc = app.db.inds.formToDocument(updatedForm);
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

    it("Individual Endpoint CRUD tests", async () => {

        const testPayload = app.testPayload = {
            "uid": `indi-test-${Date.now()}`,
            "name": "Branson Beihl",
            "picture": "",
            "email": "example@ucsd.edu",
            "emailVerified": true
        };

        // Frontend form to create
        const testAuthForm = {
            firstname: "Branson",
            lastname: "Beihl",
            cause: ["Disaster Response"],
            zip: "92122",
            skills: ["exampleSkill"],
            age: "20-29"
        };

        // Valid test
        /** @type {Response} */
        let res = await fetch(`http://localhost:${app.config.port}/api/profile/create?type=individual`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(testAuthForm)
        });
        assert(res.status == 200, `Valid form should return http status 200 instead of ${res.status}`);
        const data = (await app.db.inds.byID(testPayload.uid)).data();
        assert(data.age == testAuthForm.age, "Age should match in the submitted document");

        // Post to existing profile
        res = await fetch(`http://localhost:${app.config.port}/api/profile/create?type=individual`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(testAuthForm)
        });
        assert(res.status == 400, `Already existing profile should return 400 instead of ${res.status}`);

        // GET the profile we created through the first test
        res = await fetch(`http://localhost:${app.config.port}/api/profile/${testPayload.uid}?type=individual`, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });
        assert(res.status == 200, `Profile GET on created document endpoint should return 200 instead of ${res.status}`);
        let jsonRes = await res.json();
        assert(jsonRes.success && jsonRes.profile.age == testAuthForm.age, "Response should be successful and the fields matches");

        // GET the profile we created through the first test, but with type=organization query string
        res = await fetch(`http://localhost:${app.config.port}/api/profile/${testPayload.uid}?type=organization`, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });
        assert(res.status == 404, `Profile GET on endpoint with type=organization should return 404 instead of ${res.status}`);

        // GET the profile we created through the first test, but without query string
        res = await fetch(`http://localhost:${app.config.port}/api/profile/${testPayload.uid}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });
        assert(res.status == 400, `Profile GET on endpoint without query string should return 400 instead of ${res.status}`);

        // GET the user's profile with @me
        res = await fetch(`http://localhost:${app.config.port}/api/profile/@me`, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });
        assert(res.status == 200, `Profile GET on @me endpoint should return 200 instead of ${res.status}`);
        jsonRes = await res.json();
        assert(jsonRes.success && jsonRes.profile.age == testAuthForm.age, "Response should be successful and the fields matches");

        // Remove our test authorization from app
        delete app.testPayload; 
        // GET the user's profile with @me but NOT authorized (without payload)
        res = await fetch(`http://localhost:${app.config.port}/api/profile/@me`, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });
        assert(res.status == 401, `Profile GET on @me without authorization should return 401 instead of ${res.status}`);

        // Put our test authorization back to app
        app.testPayload = testPayload;

        // Update tests
        // PUT to not @me
        res = await fetch(`http://localhost:${app.config.port}/api/profile/otherUser`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(testAuthForm)
        });
        assert(res.status == 403, `Profile PUT on wrong endpoint after /api/profile should return 403 instead of ${res.status}`);

        const testOrgForm = {
            title: "Habitat For Humanity",
            mission: "Fixing homelessness one family at a time",
            cause: ["Disaster Response"],
            zip: "92037",
            contact: "info@sandiegohabitat.org",
            url: "www.sandiegohabitat.org",
            events: []
        };
        
        const testUpdatedForm = {
            firstname: "Branson",
            lastname: "Beihl",
            cause: ["Disaster Response"],
            zip: "92037", // we updated the zip
            skills: ["exampleSkill"],
            age: "20-29"
        };

        // PUT to @me with wrong type of profile (user somehow wants to 
        // hack their profile to become an organization or frontend error)
        res = await fetch(`http://localhost:${app.config.port}/api/profile/@me?type=organization`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(testOrgForm)
        });
        assert(res.status == 403, `Profile PUT on @me without authorization should return 403 instead of ${res.status}`);

        // PUT to @me
        res = await fetch(`http://localhost:${app.config.port}/api/profile/@me?type=individual`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(testUpdatedForm)
        });
        jsonRes = await res.json();
        assert(res.status == 200 && jsonRes.success, `Profile update should be successful (status: ${res.status})`);

        // GET the user's profile with @me (to test if the document updated)
        res = await fetch(`http://localhost:${app.config.port}/api/profile/@me`, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });
        assert(res.status == 200, `Profile GET on @me endpoint should return 200 instead of ${res.status}`);
        jsonRes = await res.json();
        assert(jsonRes.success && jsonRes.profile.zip == testUpdatedForm.zip, "Response should have updated zip");

        // TODO: make this run even when the test fails
        await app.db.inds.delete(testPayload.uid);
    });

});
