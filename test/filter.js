const assert = require("assert");
const runner = require("./setup/runner");
const fetch = require("node-fetch");
const Joi = require("joi");
const { validCauses, validSkills } = require("../src/constants");

describe("Basic Search Filter Test", async function() {

    const app = await runner();
    
    after(async () => await app.stop());
    
    /**
     * Testing filter form validity:
     * EXPECTED BEHAVIOR:
     * 
     * Required parameters:
     * - followed: Boolean signifying whether to filter followed orgs
     *             or all orgs
     * - mySkills: Boolean signifying whether to filter using user skills
     *             or search specified skills
     * 
     * Optional Parameters:
     * - causes: Causes to search for (Array of valid cause strings)
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
            followed: Joi.boolean()
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
        // Invalid user
        // No followed
        // No mySkills
        // Invalid cause
        // Invalid skills
        // Invalid distance
    });

    it("Followed Causes filter test", async() => {
        // Set up a sample database to filter through

        // TESTS:
        // Filter by distance only
        // Filter by skills only
        // Filter by causes only
        // Filter by two or more filters (multiple tests)
        // Filter by multiple skills or multiple causes
        // Filter by default functionality (no distance skill or cause specified)

    });

    it("All Causes filter test", async() => {
        // Set up a sample database to filter through

        // TESTS:
        // Filter by distance only
        // Filter by skills only
        // Filter by causes only
        // Filter by two or more filters (multiple tests)
        // Filter by multiple skills or multiple causes
        // Filter by default functionality (no distance skill or cause specified)

        // Clear sample database initialized in Followed Causes to conclude test
    });
});
