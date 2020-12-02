const assert = require("assert");
const runner = require("./setup/runner");
const fetch = require("node-fetch");
const { firestore } = require("firebase-admin");

describe("Feed Test", async function() {

    const app = await runner();

    const tempInserted = {
        "inds": [],
        "orgs": [],
        "events": [],
        "ratings": []
    }

    const cleanup = async () => {
        for (const key in tempInserted) {
            for (const id of tempInserted[key]) {
                const success = await app.db[key].delete(id);
                // if (!success) console.log(`Failed to delete ${key}#${id}`);
            }
        }
    };

    /** 
     * @param {DatabaseNames} dbName 
     * @param {F} form
     * @param {string} id
     */
    const insert = async (dbName, form, id) => {
        const db = app.db[dbName];
        const doc = db.formToDocument(form);
        if (id) doc.id = id;
        const ref = await db.insert(doc);
        // console.log(`Inserted ${dbName}#${ref.id}`);
        tempInserted[dbName].push(ref.id);
        return ref;
    }

    after(async () => (await cleanup(), await app.stop()));
    
    it("Individual Feed Test", async() => {

        // Insert 3 orgs
        const orgID1 = `test-org-1-${Date.now()}`;
        const validOrgform1 = {
            title: "Yuh",
            mission: "Fixing broken programmers",
            causes: [],
            zip: "92037",
            contact: "testemail@brokenprogrammers.org",
            url: "yuh.org"
        };
        await insert("orgs", validOrgform1, orgID1);

        const orgID2 = `test-org-2-${Date.now()}`;
        const validOrgform2 = {
            title: "Branson Foundation",
            mission: "Spreading the love for green",
            causes: [],
            zip: "92037",
            contact: "testemail@branson.org",
            url: "branson.org"
        };
        await insert("orgs", validOrgform2, orgID2);

        const orgID3 = `test-org-3-${Date.now()}`;
        const validOrgform3 = {
            title: "Vivian Foundation",
            mission: "Giving spaghetti to all people with spaghetti code",
            causes: [],
            zip: "92037",
            contact: "testemail@vivian.org",
            url: "vivian.org"
        };
        await insert("orgs", validOrgform3, orgID3);

        // Insert 1 event to each org
        const eventForm1 = {
            title: "Programming Detox",
            details: "Help programming destress and heal",
            zip: "92037",
            skills: ["Medical Skills"],
            date: Date.now()
        };
        const event1 = await insert("events", eventForm1);
        event1.owner = orgID1;
        await app.db.orgs.addEvent(orgID1, event1.id);

        const eventForm2 = {
            title: "Group Gardening",
            details: "Plant native vegetables in the local community garden!",
            zip: "92037",
            skills: ["Caretaking"],
            date: Date.now()
        };
        const event2 = await insert("events", eventForm2);
        event2.owner = orgID2;
        await app.db.orgs.addEvent(orgID2, event2.id);

        const eventForm3 = {
            title: "Spaghetti Frenzy",
            details: "Help prepare bulk spaghetti!",
            zip: "92037",
            skills: ["Cooking"],
            date: Date.now()
        };
        const event3 = await insert("events", eventForm3);
        event3.owner = orgID3;
        await app.db.orgs.addEvent(orgID3, event3.id);

        // Insert individual
        const testPayload = app.testPayload = {
            "uid": `indi-test-${Date.now()}`,
            "name": "Branson Beihl",
            "picture": "",
            "email": "example@ucsd.edu",
            "emailVerified": true
        };

        const validIndiform = {
            firstname: "Branson",
            lastname: "Beihl",
            causes: ["Disaster Response"],
            zip: "92037",
            skills: ["exampleSkill"],
            age: "20-29"
        };
        await insert("inds", validIndiform, testPayload.uid);

        // Make individual follow the orgs
        await app.db.inds.follow(testPayload.uid, orgID1);
        await app.db.orgs.addFollower(orgID1, testPayload.uid);
        await app.db.inds.follow(testPayload.uid, orgID2);
        await app.db.orgs.addFollower(orgID2, testPayload.uid);
        await app.db.inds.follow(testPayload.uid, orgID3);
        await app.db.orgs.addFollower(orgID3, testPayload.uid);

        // Test GET request from individual to their event feed
        let res = await fetch(`http://localhost:${app.config.port}/api/organization/feed?type=individual`);

        assert(res.status == 200, "Feed endpoint 200");
        let jsonRes = await res.json();
        assert(jsonRes.length == 3 &&
            jsonRes[0].title == "Programming Detox" &&
            jsonRes[1].title == "Group Gardening" &&
            jsonRes[2].title == "Spaghetti Frenzy", `Individual's feed returns unexpected result: ${JSON.stringify(jsonRes, null, 4)}`);

        await cleanup();
    });

    it("Org Feed Test", async() => {

        // Insert org
        const testPayload = app.testPayload = {
            "uid": `test-org-${Date.now()}`,
            "name": "Vivian Chiong",
            "picture": "",
            "email": "example@ucsd.edu",
            "emailVerified": true
        };
        const validOrgform = {
            title: "Vivian Foundation",
            mission: "Giving spaghetti to all people with spaghetti code",
            causes: [],
            zip: "92037",
            contact: "testemail@vivian.org",
            url: "vivian.org"
        };
        await insert("orgs", validOrgform, testPayload.uid);

        // Insert 3 events
        const eventID1 = `event-test-1-${Date.now()}`;
        const eventForm1 = {
            title: "Spaghetti Photoshoot",
            details: "Help take aesthetic pictures of spaghetti for our website!",
            zip: "92037",
            skills: ["Photography", "Multimedia"],
            date: Date.now()
        };
        const event1 = await insert("events", eventForm1, eventID1);
        event1.owner = testPayload.uid;
        await app.db.orgs.addEvent(testPayload.uid, eventID1);

        const eventID2 = `event-test-2-${Date.now()}`;
        const eventForm2 = {
            title: "Refactoring Spaghetti Code",
            details: "Help junior developers fix their spaghetti code!",
            zip: "92037",
            skills: ["Programming", "Teaching/Tutoring"],
            date: Date.now()
        };
        const event2 = await insert("events", eventForm2, eventID2);
        event2.owner = testPayload.uid;
        await app.db.orgs.addEvent(testPayload.uid, eventID2);

        const eventID3 = `event-test-3-${Date.now()}`;
        const eventForm3 = {
            title: "Spaghetti Frenzy",
            details: "Help prepare bulk spaghetti!",
            zip: "92037",
            skills: ["Cooking"],
            date: Date.now()
        };
        const event3 = await insert("events", eventForm3, eventID3);
        event3.owner = testPayload.uid;
        await app.db.orgs.addEvent(testPayload.uid, eventID3);

        // Test GET request from organization to their feed
        /** @type {Response} */
        let res = await fetch(`http://localhost:${app.config.port}/api/organization/feed?type=organization`, {
            method: "GET",
        });

        assert(res.status == 200, "Feed endpoint 200");
        let jsonRes = await res.json();
        assert(jsonRes.length == 3 &&
            jsonRes[0].title == "Spaghetti Photoshoot" &&
            jsonRes[1].title == "Refactoring Spaghetti Code" &&
            jsonRes[2].title == "Spaghetti Frenzy", "Org's feed should work");
        
        await cleanup();
    });
});