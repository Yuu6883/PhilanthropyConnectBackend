const assert = require("assert");
const runner = require("./setup/runner");
const fetch = require("node-fetch");
const Joi = require("joi");
const { validCauses, validSkills } = require("../src/constants");

describe("Basic Search Filter Test", async function() {

    const app = await runner();
    
    after(async () => await app.stop());

    let orgIDs = [];
    let eventIDs = [];
    
    /**
     * Testing filter form validity:
     * EXPECTED BEHAVIOR:
     * 
     * Required parameters:
     * - myCauses: Boolean signifying whether to filter followed orgs
     *             or all orgs
     * - mySkills: Boolean signifying whether to filter using user skills
     *             or search specified skills
     * 
     * Optional Parameters:
     * - causes: Causes to search for (Array of valid causes strings)
     * - skills: Skills to search for (Array of valid skill strings)
     * - distance: Radius area to search within  (Integer, in miles)
     */
    it("Filter form validation", () => {

        // Locally instantiate implemented schema as filter.schema is 
        // not accessible by this test function
        /**
         * @type {Joi.ObjectSchema} 
         * Format the frontend follows when sending a request
         * to this endpoint
         */
        const schema = Joi.object({

            // User calling from Causes or My Causes
            myCauses: Joi.boolean()
                .required(),
            
            // User queries for causes
            causes: Joi.array().items(
                Joi.string()
                    .valid(...validCauses)
            ),

            // User wants to use the skills listed on their profile
            mySkills: Joi.boolean()
                .required(),

            // User queries for skills
            skills: Joi.array().items( 
                Joi.string()
                    .valid(...validSkills)
            ),

            // User queries for distance in miles
            distance: Joi.number()
        });

        // Empty form 
        const emptyForm = {};
        let res = schema.validate(emptyForm);
        assert(!!(res.error || res.errors), "Empty form should throw an error");

        // No followed
        const noFollowed = {
            myCauses: null,
            causes: [], 
            mySkills: true,
            skills: [],
            distance: 50
        }
        res = schema.validate(noFollowed);
        assert(!!(res.error || res.errors), "Followed should be a required field");

        // No mySkills
        const noMySkills = {
            myCauses: true,
            causes: [], 
            mySkills: null,
            skills: [],
            distance: 50
        }
        res = schema.validate(noMySkills);
        assert(!!(res.error || res.errors), "MySkills should be a required field");

        // Invalid causes
        const badCause = {
            myCauses: true,
            causes: ["badcause"], 
            mySkills: true,
            skills: [],
            distance: 50
        }
        res = schema.validate(badCause);
        assert(!!(res.error || res.errors), "Bad causes should not validate");

        // Invalid skills
        const badSkill = {
            myCauses: true,
            causes: [], 
            mySkills: true,
            skills: ["badskill"],
            distance: 50
        }
        res = schema.validate(badSkill);
        assert(!!(res.error || res.errors), "Bad skill should not validate");

        // Invalid distance
        const badDist = {
            myCauses: true,
            causes: [], 
            mySkills: true,
            skills: [],
            distance: "not a distance"
        }
        res = schema.validate(badDist);
        assert(!!(res.error || res.errors), "Bad distance should not validate");

        // Valid form
        const validForm = {
            myCauses: true,
            causes: ["Education"], 
            mySkills: true,
            skills: ["Cooking"],
            distance: 50
        }
        res = schema.validate(validForm);
        assert(!(res.error || res.errors), "Form should be good");
    });

    it("Filter endpoint test", async() => {
        // Invalid user
        let testPayload = app.testPayload = {
            "uid": `FC filter test`,
            "name": "Branson Beihl",
            "picture": "",
            "email": "example@ucsd.edu",
            "emailVerified": true
        };

        const validForm = {
            myCauses: true,
            causes: ["Education"], 
            mySkills: true,
            skills: ["Cooking"],
            distance: 50
        }

        let res = await fetch(`http://localhost:${app.config.port}/api/organization/filter?=${encodeURIComponent(JSON.stringify(validForm))}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });
        
        assert(res.status == 403, `Calling filter from a nonexistent user should return 403 instead of ${res.status}`);

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
        let docToInsert = app.db.events.formToDocument(eventForm);
        eventIDs.push((await app.db.events.insert(docToInsert)).id);

        eventForm = {
            title: "Brush with Kindness",
            details: "Help volunteer painting homes of those who can't do it themselves.",
            zip: "92037",
            skills: ["Cooking"],
            date: Date.now()
        };
        docToInsert = app.db.events.formToDocument(eventForm);
        eventIDs.push((await app.db.events.insert(docToInsert)).id);

        // Create the organizations we will search for
        let orgForm = {
            title: "Yuh",
            mission: "Fixing broken programmers",
            causes: ["Medical"],
            zip: "92037",
            contact: "testemail@brokenprogrammers.org",
            url: "yuh.org",
            events: [eventIDs[0]]
        };
        app.testPayload.uid = "Filter Test 1";
        orgIDs.push(app.testPayload.uid);
        res = await fetch(`http://localhost:${app.config.port}/api/profile/create?type=organization`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(orgForm)
        });

        orgForm = {
            title: "Yuh",
            mission: "Fixing broken programmers",
            causes: ["Food"],
            zip: "92037",
            contact: "testemail@brokenprogrammers.org",
            url: "yuh.org",
            events: [eventIDs[0]]
        };
        app.testPayload.uid = "Filter Test 2";
        orgIDs.push(app.testPayload.uid);
        res = await fetch(`http://localhost:${app.config.port}/api/profile/create?type=organization`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(orgForm)
        });

        orgForm = {
            title: "Yuh",
            mission: "Fixing broken programmers",
            causes: ["Environment"],
            zip: "93722",
            contact: "testemail@brokenprogrammers.org",
            url: "yuh.org",
            events: [eventIDs[1]]
        };
        app.testPayload.uid = "Filter Test 3";
        orgIDs.push(app.testPayload.uid);
        res = await fetch(`http://localhost:${app.config.port}/api/profile/create?type=organization`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(orgForm)
        });

        orgForm = {
            title: "Yuh",
            mission: "Fixing broken programmers",
            causes: ["Medical"],
            zip: "92037",
            contact: "testemail@brokenprogrammers.org",
            url: "yuh.org",
            events: [eventIDs[0]]
        };
        app.testPayload.uid = "Filter Test 4";
        orgIDs.push(app.testPayload.uid);
        res = await fetch(`http://localhost:${app.config.port}/api/profile/create?type=organization`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(orgForm)
        });

        orgForm = {
            title: "Yuh",
            mission: "Fixing broken programmers",
            causes: ["Food"],
            zip: "93722",
            contact: "testemail@brokenprogrammers.org",
            url: "yuh.org",
            events: [eventIDs[0]]
        };
        app.testPayload.uid = "Filter Test 5";
        orgIDs.push(app.testPayload.uid);
        res = await fetch(`http://localhost:${app.config.port}/api/profile/create?type=organization`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(orgForm)
        });

        // Frontend form to create
        const userForm = {
            firstname: "Branson",
            lastname: "Beihl",
            causes: ["Medical"],
            zip: "92122",
            skills: ["Cooking"],
            age: "18-30"
        };
        app.testPayload.uid = "Filter Endpoint User 1";
        // Create the individual who we are searching with
        res = await fetch(`http://localhost:${app.config.port}/api/profile/create?type=individual`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userForm)
        });

        res = await fetch(`http://localhost:${app.config.port}/api/profile/${testPayload.uid}`), {
            method: "GET", 
            headers: { "Content-Type": "application/json" }
        }
        
        
        // TESTS:
        // Filter by distance only
        const distForm = {
            myCauses: false,
            causes: [], 
            mySkills: false,
            skills: [],
            distance: 100
        }

        res = await fetch(`http://localhost:${app.config.port}/api/organization/filter?=${encodeURIComponent(JSON.stringify(distForm))}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });
        let result = await res.json();
        //console.log(result.body);
        assert(result.body.length == 3, "We should only have 3 results");

        // Filter by skills only (distance will be large enough to not matter)
        const skillForm = {
            myCauses: false,
            mySkills: false,
            skills: ["Art skills"],
            distance: 1000
        }

        res = await fetch(`http://localhost:${app.config.port}/api/organization/filter?=${encodeURIComponent(JSON.stringify(skillForm))}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });
        result = await res.json();
        assert(result.body.length == 4, "We should only have 4 results");
        

        // Filter by causes only (skills empty, distance large enough)
        const causeForm = {
            myCauses: false,
            causes: ["Food"], 
            mySkills: false,
            skills: [],
            distance: 5000
        }

        res = await fetch(`http://localhost:${app.config.port}/api/organization/filter?=${encodeURIComponent(JSON.stringify(causeForm))}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });
        result = await res.json();
        //console.log(result)
        assert(result.body.length == 2, "We should only have 2 results");

        // Filter by two or more filters (multiple tests)
        // Filter by multiple skills or multiple causes
        // Filter by myCauses (distance will be large enough to not matter)
        // Filter by mySkills
        // Filter by default functionality (no distance skill or causes specified)
        
        // Delete all created test profiles and events
        await app.db.inds.delete(testPayload.uid);
        await Promise.all(orgIDs.map(id => app.db.orgs.delete(id)));
        await Promise.all(eventIDs.map(id => app.db.events.delete(id)));
    });
});
