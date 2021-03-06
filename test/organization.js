const assert = require("assert");
const runner = require("./setup/runner");
const fetch = require("node-fetch");

describe("Basic Organization Test", async function() {

    const app = await runner();
    
    after(async () => await app.stop());
    
    it("Organization form validation", () => {
        const invalidForm = {};
        let res = app.db.orgs.validate(invalidForm);
        assert(!!(res.error || res.errors), "Form shouldn't work");

        const emptyTitle = {
            title: "",
            mission: "Fixing broken programmers",
            causes: [],
            zip: "92037",
            contact: "testemail@brokenprogrammers.org",
            url: "yuh.org"
        };
        res = app.db.orgs.validate(emptyTitle);
        assert(!!(res.error || res.errors), "Expecting error");

        const emptyMission = {
            title: "Yuh",
            mission: "",
            causes: [],
            zip: "92037",
            contact: "testemail@brokenprogrammers.org",
            url: "yuh.org"
        };
        res = app.db.orgs.validate(emptyMission);
        assert(!!(res.error || res.errors), "Expecting error");

        const emptyContact = {
            title: "Yuh",
            mission: "Fixing broken programmers",
            causes: [],
            zip: "92037",
            contact: "",
            url: "yuh.org"
        };
        res = app.db.orgs.validate(emptyContact);
        assert(!!(res.error || res.errors), "Expecting error");

        const emptyUrl = {
            title: "Yuh",
            mission: "Fixing broken programmers",
            causes: [],
            zip: "92037",
            contact: "testemail@brokenprogrammers.org",
            url: ""
        };
        res = app.db.orgs.validate(emptyUrl);
        assert(!!(res.error || res.errors), "Expecting error");

        const validForm = {
            title: "Yuh",
            mission: "Fixing broken programmers",
            causes: [],
            zip: "92037",
            contact: "testemail@brokenprogrammers.org",
            url: "yuh.org"
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



        const validForm = {
            title: "Habitat For Humanity",
            mission: "Fixing homelessness one family at a time",
            causes: ["Medical"],
            zip: "92037",
            contact: "info@sandiegohabitat.org",
            url: "www.sandiegohabitat.org"
        };
        let doc = app.db.orgs.formToDocument(validForm);
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
        const updatedForm = {
            title: "Habitat For Humanity",
            mission: "Fixing homelessness one family at a time",
            causes: ["Medical"],
            zip: "92122",
            contact: "info@sandiegohabitat.org",
            url: "www.sandiegohabitat.org"
        };
        doc = app.db.orgs.formToDocument(updatedForm);
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
            "emailVerified": true
        };

        // frontend form to create
        const testAuthForm = {
            title: "Habitat For Humanity",
            mission: "Fixing homelessness one family at a time",
            causes: ["Medical"],
            zip: "92037",
            contact: "info@sandiegohabitat.org",
            url: "www.sandiegohabitat.org"
        };

        /** @type {Response} */
        let res = await fetch(`http://localhost:${app.config.port}/api/profile/create?type=organization`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(testAuthForm)
        });

        assert(res.status == 200, `Valid form should return http status 200 instead of ${res.status}`);

        const data = (await app.db.orgs.byID(testPayload.uid)).data();
        assert(data.mission == testAuthForm.mission, "Mission should match in the submitted document");

        res = await fetch(`http://localhost:${app.config.port}/api/profile/create?type=organization`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(testAuthForm)
        });

        assert(res.status == 400, `Already existing profile should return 400 instead of ${res.status}`);

        // GET the profile we created through the first test
        res = await fetch(`http://localhost:${app.config.port}/api/profile/${testPayload.uid}?type=organization`, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });
        assert(res.status == 200, `Profile GET on created document endpoint should return 200 instead of ${res.status}`);
        let jsonRes = await res.json();
        assert(jsonRes && jsonRes.contact == testAuthForm.contact, "Response should be successful and the fields matches");

        // GET the profile we created through the first test, but with type=individual query string
        res = await fetch(`http://localhost:${app.config.port}/api/profile/${testPayload.uid}?type=individual`, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });
        assert(res.status == 404, `Profile GET on endpoint with type=individual should return 404 instead of ${res.status}`);

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
        assert(jsonRes && 
            jsonRes.type == "organization" &&
            jsonRes.contact == testAuthForm.contact, "Response should be successful and the fields matches");

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

        const testIndiForm = {
            firstname: "Branson",
            lastname: "Beihl",
            causes: ["Medical"],
            zip: "92122",
            skills: ["Cooking"],
            age: "18-30"
        };
        
        const testUpdatedForm = {
            title: "Habitat For Humanity",
            mission: "Fixing homelessness one family at a time",
            causes: ["Medical"],
            zip: "92122", // zip is updated
            contact: "info@sandiegohabitat.org",
            url: "www.sandiegohabitat.org"
        };

        // PUT to @me with wrong type of profile (user somehow wants to 
        // hack their profile to become an individual or frontend error)
        res = await fetch(`http://localhost:${app.config.port}/api/profile/@me?type=individual`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(testIndiForm)
        });
        assert(res.status == 404, `Profile PUT on @me without authorization should return 404 instead of ${res.status}`);

        // PUT to @me
        res = await fetch(`http://localhost:${app.config.port}/api/profile/@me?type=organization`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(testUpdatedForm)
        });
        assert(res.status == 200, `Profile update should be successful (status: ${res.status})`);

        // GET the user's profile with @me (to test if the document updated)
        res = await fetch(`http://localhost:${app.config.port}/api/profile/@me`, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });
        assert(res.status == 200, `Profile GET on @me endpoint should return 200 instead of ${res.status}`);
        jsonRes = await res.json();
        assert(jsonRes && jsonRes.zip == testUpdatedForm.zip, "Response should have updated zip");

        await app.db.orgs.delete(testPayload.uid);
    });

    it("Endpoint Follow test", async() => {
        
        const ind1ID = `indi-test-${Date.now()}-1`;
        const ind2ID = `indi-test-${Date.now()}-2`;
        const orgID = `org-test-${Date.now()}`;
        const validInd1 = {
            firstname: "Branson",
            lastname: "Beihl",
            causes: ["Medical"],
            zip: "92037",
            skills: ["Cooking"],
            age: "18-30"
        };
        const validInd2 = {
            firstname: "Sensei",
            lastname: "John",
            causes: ["Medical"],
            zip: "92590",
            skills: ["Programming"],
            age: "18-30"
        };
        const validOrg = {
            title: "Habitat For Humanity",
            mission: "Fixing homelessness one family at a time",
            causes: ["Medical"],
            zip: "92037",
            contact: "info@sandiegohabitat.org",
            url: "www.sandiegohabitat.org"
        };
        const testPayload = app.testPayload = {
            "uid": `${ind1ID}`,
            "name": "Branson Beihl",
            "picture": "",
            "email": "example@ucsd.edu",
            "emailVerified": true
        };

        let ind1 = app.db.inds.formToDocument(validInd1);
        ind1.id = ind1ID;
        await app.db.inds.insert(ind1);
        let ind2 = app.db.inds.formToDocument(validInd2);
        ind2.id = ind2ID;
        await app.db.inds.insert(ind2);
        let org = app.db.orgs.formToDocument(validOrg);
        org.id = orgID;
        await app.db.orgs.insert(org);
        
        // calling the follow=false when not following an Org
        let res = await fetch(`http://localhost:${app.config.port}/api/organization/${orgID}?follow=false`, {
            method: "POST"
        });
        assert(res.status == 409, `Unfollowing an unfollowed org should return 409. (status: ${res.status})`);
        
        // calling the follow=true when not following an Org
        res = await fetch(`http://localhost:${app.config.port}/api/organization/${orgID}?follow=true`, {
            method: "POST"
        });
        assert(res.status == 200, `Following an unfollowed org should return 200. (status: ${res.status})`);
        let orgDoc = await app.db.orgs.byID(orgID);
        let indDoc = await app.db.inds.byID(ind1ID);
        assert(orgDoc.data().followers.includes(ind1ID), `Individual 1 should be in Org's followers.`);
        assert(!orgDoc.data().followers.includes(ind2ID), `Individual 2 shouldn't be in Org's followers.`)
        assert(indDoc.data().following.includes(orgID), `Org should be in Individual 1's followings.`);
        
        // calling the follow=true when already following an Org
        res = await fetch(`http://localhost:${app.config.port}/api/organization/${orgID}?follow=true`, {
            method: "POST",
        });
        assert(res.status == 409, `Following an already followed org should return 409. (status: ${res.status})`)

        // calling the follow=false when following an Org
        res = await fetch(`http://localhost:${app.config.port}/api/organization/${orgID}?follow=false`, {
            method: "POST",
        });
        assert(res.status == 200, `Unfollowing an followed org should return 200. (status: ${res.status})`);
        orgDoc = await app.db.orgs.byID(orgID);
        indDoc = await app.db.inds.byID(ind1ID);

        assert(!orgDoc.data().followers.includes(ind1ID), `Individual 1 shouldn't be in Org's followers.`);
        assert(!orgDoc.data().followers.includes(ind2ID), `Individual 2 shouldn't be in Org's followers.`)
        assert(!indDoc.data().following.includes(orgID), `Org shouldn't be in Individual 1's followings.`);

        await app.db.inds.delete(ind1ID);
        await app.db.inds.delete(ind2ID);
        await app.db.orgs.delete(orgID);
    });
});

