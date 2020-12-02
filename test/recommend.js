const assert = require("assert");
const runner = require("./setup/runner");
const fetch = require("node-fetch");
const { firestore } = require("firebase-admin");

describe("Basic Recommend Test", async function() {

    const app = await runner();
    
    const tempInserted = {
        "inds": [],
        "orgs": [],
        "events": [],
        "ratings": []
    }

    const cleanup = async () => {
        for (const key in tempInserted) {
            while (tempInserted[key].length) {
                const success = await app.db[key].delete(tempInserted[key].pop());
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

    it("Recommend by Causes (orgs) recommend endpoint test", async() => {
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
            title: "God Help Us All",
            mission: "Praying the Rona Away",
            causes: ["Medical"],
            zip: "92037",
            contact: "essentialoils@ponzi.legit",
            url: "totallynothighwayrobbery.xd"
        };
        await insert("orgs", orgForm1, `org-cause-test-1-${Date.now()}`);
        /** @type {OrganizationDocument} */
        
        const orgForm2 = {
            title: "Tutors Pity Us Charity",
            mission: "Obtaining a good grade",
            causes: ["Food"],
            zip: "92037",
            contact: "dubsforquaranteam@brokenprogrammers.moe",
            url: "gibaplus.pls"
        };
        await insert("orgs", orgForm2, `org-cause-test-2-${Date.now()}`);

        const orgForm3 = {
            title: "Branson I don't feel so good",
            mission: "Snapping 2020 away",
            causes: ["Medical"],
            zip: "92037",
            contact: "thanos@retiredmcuvillains.gov",
            url: "newhandmodel.abercrombie"
        };
        await insert("orgs", orgForm3, `org-cause-test-3-${Date.now()}`);

        const orgForm4 = {
            title: "Suspicious Code",
            mission: "Berating programmers for creating bugs",
            causes: ["Food"],
            zip: "92037",
            contact: "redsus@among.us",
            url: "spaghetti.code"
        };
        await insert("orgs", orgForm4, `org-cause-test-4-${Date.now()}`);

        // TEST cause recommendation based on user.causes
        /** @type {Response} */
        let res = await fetch(`http://localhost:${app.config.port}/api/recommend?type=organization`, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });
        assert(res.status == 200, "Filter endpoint 200");
        let jsonRes = await res.json();
        assert(jsonRes[0].title == "God Help Us All" && 
               jsonRes[1].title == "Branson I don't feel so good" &&
               jsonRes.length == 2, "We should be going off of user causes for this test");

        // Setup next test (following one should not show up)
        await app.db.inds.ref.doc(tempInserted["inds"][0]).update({
            following: firestore.FieldValue.arrayUnion(tempInserted["orgs"][0])
        });
        await app.db.orgs.ref.doc(tempInserted["orgs"][0]).update({
            followers: firestore.FieldValue.arrayUnion(tempInserted["inds"][0])
        });

        /** @type {Response} */
        res = await fetch(`http://localhost:${app.config.port}/api/recommend?type=organization`, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });
        assert(res.status == 200, "Filter endpoint 200");
        jsonRes = await res.json();
        assert(jsonRes[0].title == "Branson I don't feel so good" && jsonRes.length == 1, "Cause should match");

        // Setup next test (following one non user cause should do nothing to the search)
        await app.db.inds.ref.doc(tempInserted["inds"][0]).update({
            following: firestore.FieldValue.arrayUnion(tempInserted["orgs"][1])
        });
        await app.db.orgs.ref.doc(tempInserted["orgs"][1]).update({
            followers: firestore.FieldValue.arrayUnion(tempInserted["inds"][0])
        });

        /** @type {Response} */
        res = await fetch(`http://localhost:${app.config.port}/api/recommend?type=organization`, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });
        assert(res.status == 200, "Filter endpoint 200");
        jsonRes = await res.json();
        assert(jsonRes[0].title == "Branson I don't feel so good" && 
               jsonRes.length == 1, "Results should not have changed from prev test");
        
        // Setup next test (following with no user causes should recommend everything else in db)
        await app.db.inds.ref.doc(tempInserted["inds"][0]).update({
            causes: []
        });

        /** @type {Response} */
        res = await fetch(`http://localhost:${app.config.port}/api/recommend?type=organization`, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });
        assert(res.status == 200, "Filter endpoint 200");
        jsonRes = await res.json();
        assert(jsonRes[0].title == "Branson I don't feel so good" && 
               jsonRes[1].title == "Suspicious Code" && 
               jsonRes.length == 2, "Results should include org3 and org4");

        // Setup next test (an org out of distance range should not show in search)
        const orgForm5 = {
            title: "Definitely not interesting",
            mission: "Not get in the next search",
            causes: ["Food"],
            zip: "10001",
            contact: "hiders@lurk.ca",
            url: "weasel.gg"
        };
        await insert("orgs", orgForm5, `org-cause-test-5-${Date.now()}`);

        res = await fetch(`http://localhost:${app.config.port}/api/recommend?type=organization`, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });
        assert(res.status == 200, "Filter endpoint 200");
        jsonRes = await res.json();
        assert(jsonRes[0].title == "Branson I don't feel so good" && 
               jsonRes[1].title == "Suspicious Code" && 
               jsonRes.length == 2, "Results should not include org1, 2, or 5");
        
        await cleanup();
    });

    
    it("Recommend by Skills (events) endpoint test", async() => {

        // Set up a sample database to filter through
        // The area code 10001 should never show up in recommended

        // Create the events we will use
        /** @type { OrgEventDocument } */
        let eventDoc = {
            title: "Brush with Kindness",
            details: "Help volunteer painting homes of those who can't do it themselves.",
            zip: "92037",
            skills: ["Art skills"],
            date: Date.now()
        };

        await insert("events", eventDoc, `event-skills-test-1-${Date.now()}`);
        await app.db.events.ref.doc(tempInserted["events"][0]).update({
            owner: "3"
        });

        eventDoc = {
            title: "Protest at Google",
            details: "FIREBASE BAD",
            zip: "92037",
            skills: ["Programming"],
            date: Date.now()
        };

        await insert("events", eventDoc, `event-skills-test-2-${Date.now()}`);
        await app.db.events.ref.doc(tempInserted["events"][1]).update({
            owner: "1"
        });

        eventDoc = {
            title: "CSE 110 Meetings",
            details: "Help students of those who can't do it themselves.",
            zip: "92037",
            skills: ["Programming", "Engineering"],
            date: Date.now()
        };

        await insert("events", eventDoc, `event-skills-test-3-${Date.now()}`);
        await app.db.events.ref.doc(tempInserted["events"][2]).update({
            owner: "2"
        });

        eventDoc = {
            title: "MonkaS kitchen",
            details: "Feeding poor software developers who can't cook like me.",
            zip: "92037",
            skills: ["Cooking"],
            date: Date.now()
        };

        await insert("events", eventDoc, `event-skills-test-4-${Date.now()}`);
        await app.db.events.ref.doc(tempInserted["events"][3]).update({
            owner: "2"
        });

        eventDoc = {
            title: "CSE 110 Meetings but on east coast",
            details: "Lmao",
            zip: "10001",
            skills: ["Programming", "Engineering"],
            date: Date.now()
        };
        
        await insert("events", eventDoc, `event-skills-test-5-${Date.now()}`);
        await app.db.events.ref.doc(tempInserted["events"][4]).update({
            owner: "1"
        });

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
            skills: ["Programming", "Engineering"],
            age: "18-30"
        };
        await insert("inds", testIndividualDoc, testPayload.uid);

        // TEST 1: Standard recommendation, no follows, should show all possible results in this set
        /** @type {Response} */
        let res = await fetch(`http://localhost:${app.config.port}/api/recommend?type=events`, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });
        assert(res.status == 200, "Filter endpoint 200");
        let jsonRes = await res.json();
        assert(jsonRes.length == 2 &&
            jsonRes[0].title == "CSE 110 Meetings" &&
            jsonRes[1].title == "Protest at Google", "Filters should work");
        
        // Setup next test: follow one and make sure the events drop from recommended
        await app.db.inds.ref.doc(tempInserted["inds"][0]).update({
            following: ["1"]
        });
        
        // TEST 2: Follow one
        /** @type {Response} */
        res = await fetch(`http://localhost:${app.config.port}/api/recommend?type=events`, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });
        assert(res.status == 200, "Filter endpoint 200");
        jsonRes = await res.json();
        assert(jsonRes.length == 1 &&
               jsonRes[0].title == "CSE 110 Meetings", "Protest at Google is from a followed org");
        
        // Setup next test: user updates skills
        await app.db.inds.ref.doc(tempInserted["inds"][0]).update({
            skills: ["Art skills"]
        });

        // TEST 3: User updated skills
        /** @type {Response} */
        res = await fetch(`http://localhost:${app.config.port}/api/recommend?type=events`, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });
        jsonRes = await res.json();
        assert(jsonRes.length == 1 && 
               jsonRes[0].title == "Brush with Kindness", 
               "User updated profile");

        // Setup next test: user unfollows an organization
        await app.db.inds.ref.doc(tempInserted["inds"][0]).update({
            following: [],
            skills: ["Programming", "Engineering"]
        });
        
        // TEST 4: User unfollowed an organization
        /** @type {Response} */
        res = await fetch(`http://localhost:${app.config.port}/api/recommend?type=events`, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });
        assert(res.status == 200, "Filter endpoint 200");
        jsonRes = await res.json();
        assert(jsonRes.length == 2 &&
            jsonRes[0].title == "CSE 110 Meetings" &&
            jsonRes[1].title == "Protest at Google", "Filters should work");
    });
});
