const { validCauses, validSkills } = require("../constants");
const Joi = require("joi");
const { withinRadius } = require("geolib");
const ZIPCodes = require("../modules/us-zip");
const { GeoPoint } = require("@google-cloud/firestore");

/** @type {APIEndpointHandler} */
module.exports = {
    method: "get",
    path: "/organization",
    handler: function (req, res) {
        // Design use case 3.1 - 3.3
        // /api/organizations/filter?=["filter1","filter2","etc"]
        
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

        // Query individual db for user location
        let user = (await this.db.inds.byID(req.payload.uid));
        if (!user.exists) return res.sendStatus(403);
        user = user.data();
        

        // Validate the filter query
        const validatedForm = schema.validate(req.body);
        if (validatedForm.error || validatedForm.errors) return res.sendStatus(400);
        
        // Query only within followed orgs
        if (req.body.followed) {
            // Query parameters: Defaults to all valid filters if parameter is empty
            const causesQuery = req.body.causes.length ? req.body.causes : validCauses;
            const skillsQuery = req.body.mySkills ? user.skills : req.body.skills ? req.body.skills : validSkills;
            const distQuery   = req.body.distance ? req.body.distance * 1.609 : 50 * 1.609;

            // Query db for all followed organizations and filter it based on given filters
            const query       = await Promise.all(user.following.map(id => this.db.orgs.byID(id)));
            let followedOrgs  = query.map(org => org.data());
            const result = followedOrgs.filter(_ = (org) => {

                /**
                 * Search intended functionality:
                 * - If any of the queries are empty, assume the org always meets
                 *   this query requirement (if no causes specified then only filter by skill/distance)
                 * - If say cause1 was a search parameter and 50 miles was a search parameter, then
                 *   only orgs that include cause1 AND are within 50 miles are returned
                 * - If cause1 and cause2 were search parameters, orgs with cause1 OR cause2 are
                 *   returned
                 * - If cause1 and cause2 and 50 miles were parameters, then orgs with cause1 OR
                 *   cause2 AND within 50 miles are returned
                 * - The cases extend to all the search parameters
                 */

                // Check for cause matches
                retval = false;
                for(key in causesQuery) {
                    if(org.cause.includes(key)) {
                        retval = true;
                        break;
                    }
                }
                
                // Cause was required but org did not match
                if(!retval) return false;
                
                // Check for skills matches
                retval = false;
                for(key in skillsQuery) {
                    if(org.cause.includes(key)) {
                        retval = true;
                        break;
                    }
                }

                // Check for distance matches (convert our miles to km to work with GeoLib)
                orgLoc = new GeoPoint(...(ZIPCodes.map.get(org.zip)));
                indLoc = new GeoPoint(...(ZIPCodes.map.get(user.zip)));
                return retval ? withinRadius(orgLoc, indLoc, distQuery) : false;
            });
            return res.send(result);
        
        // User is calling for all organizations
        } else {
            // Query parameters: Defaults to all valid filters if parameter is empty
            const causesQuery = req.body.causes.length ? req.body.causes : validCauses;
            const skillsQuery = req.body.mySkills ? user.skills : req.body.skills ? req.body.skills : validSkills;
            const distQuery   = req.body.distance ? req.body.distance * 1.609 : 50 * 1.609;

            // Query db for causes
            const query       = this.db.orgs.where("causes", "array-contains-any", causesQuery);
            let   result      = query.map(org => org.data());

            // Filter db for distance and skills
            result            = result.filter( _ = (org) => {

                // Check for skills filter
                let retval = false;
                for(key in skillsQuery) {
                    if(org.skills.includes(key)) {
                        retval = true;
                        break;
                    }
                }
                
                // Check for distance matches (convert our miles to km to work with GeoLib)
                orgLoc = new GeoPoint(...(ZIPCodes.map.get(org.zip)));
                indLoc = new GeoPoint(...(ZIPCodes.map.get(user.zip)));
                return retval ? withinRadius(orgLoc, indLoc, distQuery) : false;
            });
            return res.send(result);
        }
    }
}