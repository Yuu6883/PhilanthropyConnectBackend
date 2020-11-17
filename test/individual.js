const assert = require("assert");
const runner = require("./setup/runner");
const fetch = require("node-fetch");

const TEST_AUTH_TOKEN = "eyJhbGciOiJSUzI1NiIsImtpZCI6IjNlNTQyN2NkMzUxMDhiNDc2NjUyMDhlYTA0YjhjYTZjODZkMDljOTMiLCJ0eXAiOiJKV1QifQ.eyJuYW1lIjoiSm9obiBHZSIsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS0vQU9oMTRHaGxsZ2hlYmh2ZTV3akF4dm40NGRhWWlONEc5ZTljc1VnVnF6Q0E9czk2LWMiLCJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vcGhpbGFudGhyb3B5LWNvbm5lY3QiLCJhdWQiOiJwaGlsYW50aHJvcHktY29ubmVjdCIsImF1dGhfdGltZSI6MTYwNTU5NTA1NywidXNlcl9pZCI6ImpFeUlaaWJUTzJkdEhrRGZucW05WG1tNkptQTIiLCJzdWIiOiJqRXlJWmliVE8yZHRIa0RmbnFtOVhtbTZKbUEyIiwiaWF0IjoxNjA1NTk1MDU3LCJleHAiOjE2MDU1OTg2NTcsImVtYWlsIjoicWdlQHVjc2QuZWR1IiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnsiZ29vZ2xlLmNvbSI6WyIxMTQ0MjAyMDM5OTI3NzQxNDM5ODAiXSwiZW1haWwiOlsicWdlQHVjc2QuZWR1Il19LCJzaWduX2luX3Byb3ZpZGVyIjoiZ29vZ2xlLmNvbSJ9fQ.l9dGS4i7Jy0Efa-0_HfTFYcRHom07QJLUugh8CNc3tsQAfNUDRBEPZf9bkfuuA6zqu-BWeIfKs0HEsYj1lZwZRyWK3psSpRaNofVbXMt63chQMYnJx8cAPIKvTIs4ZbadV3J0oXSYDbIamNixzAseh7F-5JAh4LStyCXAPxZG5TVHClSJPFcDPjG-XrBCGNJu4ihPx8o9b66xutbnuwu_5T3XPK4AHg5CmsS9X4e2Z6C7x6L3qpLIyMVq5OziAAmX4RB4KsuhuGGMiF10H9wlU4hYODqfRIKHtv7s_-t6NB5JX8g2dXYGBTymW5jWlsjcIlj6Tgl86g5O54ey7cpWQ";
const TEST_AUTH_ID = "jEyIZibTO2dtHkDfnqm9Xmm6JmA2";

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

        // frontend form to create
        const test_auth_form = {
            type: "individual", 
            firstname: "Branson",
            lastname: "Beihl",
            cause: ["Disaster Response"],
            zip: "92122",
            skills: ["exampleSkill"],
            age: "20-29",
            token: TEST_AUTH_TOKEN
        };

        /** @type {Response} */
        const res = await fetch("http://localhost:3000/api/profile/create", {
            method: 'POST', // *GET, POST, PUT, DELETE, etc.
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(test_auth_form) // body data type must match "Content-Type" header
        });

        assert(res.status == 200, `Invalid form should return http status 200 instead of ${res.status}`);

        const data = (await app.db.inds.byID(TEST_AUTH_ID)).data();
        assert(data.age == test_auth_form.age, "Age should match in the submitted document");

        await app.db.inds.delete(TEST_AUTH_ID);

        // TODO: test other individual endpoints
    });

});
