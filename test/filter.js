const assert = require("assert");
const runner = require("./setup/runner");
const fetch = require("node-fetch");

describe("Basic Search Filter Test", async function() {

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
                if (!success) console.log(`Failed to delete ${key}#${id}`);
            }
        }
    };

    after(async () => (await cleanup(), await app.stop()));

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

    it("Causes (orgs) filter endpoint test", async() => {
        const testPayload = app.testPayload = {
            "uid": `indi-test-${Date.now()}`,
            "name": "Branson Beihl",
            "picture": "",
            "email": "example@ucsd.edu",
            "emailVerified": true
        };

        // Frontend form to create
        const testIndividualDoc = {
            firstname: "Branson",
            lastname: "Beihl",
            causes: ["Medical"],
            zip: "92037",
            skills: ["Cooking"],
            age: "18-30"
        };
        await insert("inds", testIndividualDoc, testPayload.uid);

        // Create the organizations we will search for
        const orgForm1 = {
            title: "Yuh",
            mission: "Fixing broken programmers",
            causes: ["Medical"],
            zip: "92037",
            contact: "testemail@brokenprogrammers.org",
            url: "yuh.org"
        };
        await insert("orgs", orgForm1, `org-cause-test-1-${Date.now()}`);
        /** @type {OrganizationDocument} */
        // const data1 = (await ref1.get()).data();
        // console.log(data1);
        
        const orgForm2 = {
            title: "Yuh",
            mission: "Fixing broken programmers",
            causes: ["Food"],
            zip: "92037",
            contact: "testemail@brokenprogrammers.org",
            url: "yuh.org"
        };
        await insert("orgs", orgForm2, `org-cause-test-2-${Date.now()}`);

        const validFilters = {
            causes: ["Food"]
        };

        /** @type {Response} */
        let res = await fetch(`http://localhost:${app.config.port}/api/filter?type=organization`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(validFilters)
        });
        assert(res.status == 200, `Filter endpoint ${res.status}`);
        let jsonRes = await res.json();
        assert(jsonRes[0].causes[0] == validFilters.causes[0], "Cause should match");
    });

    
    it("Skills (events) & distance filter endpoint test", async() => {

        // Set up a sample database to filter through
        // Should be one individual and around 10 organizations (each meeting different search constraints), 5 events to be used multiple times

        // Create the events we will use
        let eventForm = {
            title: "Brush with Kindness",
            details: "Help volunteer painting homes of those who can't do it themselves.",
            zip: "92037",
            skills: ["Art skills"],
            date: Date.now()
        };

        await insert("events", eventForm, `event-skills-test-1-${Date.now()}`);

        eventForm = {
            title: "Protest at Google",
            details: "FIREBASE BAD",
            zip: "92037",
            skills: ["Programming"],
            date: Date.now()
        };

        await insert("events", eventForm, `event-skills-test-2-${Date.now()}`);

        eventForm = {
            title: "CSE 110 Meetings",
            details: "Help students of those who can't do it themselves.",
            zip: "92037",
            skills: ["Programming", "Engineering"],
            date: Date.now()
        };

        await insert("events", eventForm, `event-skills-test-2-${Date.now()}`);

        eventForm = {
            title: "MonkaS kitchen",
            details: "Feeding poor software developers who can't cook like me.",
            zip: "92037",
            skills: ["Cooking"],
            date: Date.now()
        };

        await insert("events", eventForm, `event-skills-test-3-${Date.now()}`);

        eventForm = {
            title: "CSE 110 Meetings but on east coast",
            details: "Lmao",
            zip: "10001",
            skills: ["Programming", "Engineering"],
            date: Date.now()
        };

        await insert("events", eventForm, `event-skills-test-4-${Date.now()}`);

        const testPayload = app.testPayload = {
            "uid": `indi-test-${Date.now()}`,
            "name": "Branson Beihl",
            "picture": "",
            "email": "example@ucsd.edu",
            "emailVerified": true
        };

        // Frontend form to create
        const testIndividualDoc = {
            firstname: "Branson",
            lastname: "Beihl",
            causes: ["Medical"],
            zip: "92037",
            skills: ["Cooking"],
            age: "18-30"
        };
        await insert("inds", testIndividualDoc, testPayload.uid);

        /** @type {Response} */
        let res = await fetch(`http://localhost:${app.config.port}/api/filter?type=events`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ skills: ["Programming", "Engineering"] })
        });
        assert(res.status == 200, "Filter endpoint 200");
        let jsonRes = await res.json();
        assert(jsonRes.length == 2 &&
            jsonRes[0].title == "CSE 110 Meetings" &&
            jsonRes[1].title == "Protest at Google", `Filters returned unexpected result: ${JSON.stringify(jsonRes)}`);

        /** @type {Response} */
        res = await fetch(`http://localhost:${app.config.port}/api/filter?type=events`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({})
        });
        assert(res.status == 200, "Filter endpoint 200");
        jsonRes = await res.json();
        assert(jsonRes.length == 1 &&
            jsonRes[0].title == "MonkaS kitchen", "Filters should work x2");
        
        /** @type {Response} */
        res = await fetch(`http://localhost:${app.config.port}/api/filter?type=events`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ skills: ["Programming", "Engineering"], distance: 10000000 })
        });
        jsonRes = await res.json();
        assert(jsonRes.length == 3, "Filters should work x3");
    });
});
