const assert = require("assert");
const runner = require("./setup/runner");
const fetch = require("node-fetch");

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
                if (!success) console.log(`Failed to delete ${key}#${id}`);
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

        // Insert 3 orgs: damn bruh this aint sustainable
        const validOrgform1 = {
            title: "Yuh",
            mission: "Fixing broken programmers",
            causes: [],
            zip: "92037",
            contact: "testemail@brokenprogrammers.org",
            url: "yuh.org",
            events: []
        };
        await insert("orgs", validOrgform1, `test-org-1-${Date.now()}`);

        const validOrgform2 = {
            title: "Branson Foundation",
            mission: "Spreading the love for green",
            causes: [],
            zip: "92037",
            contact: "testemail@branson.org",
            url: "branson.org",
            events: []
        };
        await insert("orgs", validOrgform2, `test-org-2-${Date.now()}`);

        const validOrgform3 = {
            title: "Vivian Foundation",
            mission: "Giving spaghetti to all people with spaghetti code",
            causes: [],
            zip: "92037",
            contact: "testemail@vivian.org",
            url: "vivian.org",
            events: []
        };
        await insert("orgs", validOrgform3, `test-org-3-${Date.now()}`);

        // TODO: Insert 1 event each

        // TODO: Add events to orgs


        // Insert individual
        const validIndiform = {
            firstname: "Branson",
            lastname: "Beihl",
            causes: ["Disaster Response"],
            zip: "92037",
            skills: ["exampleSkill"],
            age: "20-29"
        };
        await insert("inds", validIndiform, `test-indi-${Date.now()}`);

        // TODO: Make individual follow the orgs

        // TODO: Test GET request from individual to their feed
    });

    it("Org Feed Test", async() => {

        // Insert org
        const validOrgform = {
            title: "Yuh",
            mission: "Fixing broken programmers",
            causes: [],
            zip: "92037",
            contact: "testemail@brokenprogrammers.org",
            url: "yuh.org",
            events: []
        };
        await insert("orgs", validOrgform, `test-org-${Date.now()}`);
        // TODO: Insert 1 event each

        // TODO: Test GET request from organization to their feed
    });

});
