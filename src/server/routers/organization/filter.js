const { validCauses, validSkills } = require("../../../constants");
const Joi = require("joi");
const { isPointWithinRadius } = require("geolib");
const ZIPCodes = require("../../../modules/us-zip");
const { GeoPoint } = require("@google-cloud/firestore");

/** @type {APIEndpointHandler} */
module.exports = {
    method: "get",
    path: "/organization/filter",
    handler: async function (req, res) {
        // Design use case 3.1 - 3.3
        // /api/organizations/filter?skills=["filter1","filter2","etc"]&causes=[]
    
        // Query individual db for user location
        const userDoc = await this.db.inds.byID(req.payload.uid);
        if (!userDoc.exists) return res.sendStatus(400);
        const user = userDoc.data();
        
        /**
         * @type {Joi.ObjectSchema<FilterOptions>} 
         * Format the frontend follows when sending a request
         * to this endpoint
         */
        const schema = Joi.object({
            // User queries for causes
            causes: Joi.array().items(
                Joi.string()
                    .valid(...validCauses)
                    .default(user.causes)
            ),
            // User queries for skills
            skills: Joi.array().items( 
                Joi.string()
                    .valid(...validSkills)
                    .default(user.skills)
            ),
            // User queries for distance in miles
            distance: Joi.number()
        });

        // Validate the filter query
        const validatedForm = schema.validate(decodedFilter);
        if (validatedForm.error || validatedForm.errors) return res.sendStatus(400);
        decodedFilter = validatedForm.value;
        decodedFilter.causes = decodedFilter.causes || [];
        decodedFilter.skills = decodedFilter.skills || [];
        decodedFilter.distance = decodedFilter.distance || 50;
        
        // Query parameters: Defaults to all valid filters if parameter is empty
        const causesQuery = decodedFilter.myCauses ? user.causes : (decodedFilter.causes.length) ? decodedFilter.causes : validCauses;
        const skillsQuery = decodedFilter.mySkills ? user.skills : (decodedFilter.skills.length) ? decodedFilter.skills : validSkills;
        const distQuery   = decodedFilter.distance * 1609; // Converts miles to meters

        // Query db for causes
        let result      = [];
        let query       = await this.db.orgs.ref.where("causes", "array-contains-any", causesQuery)
            .get()
            .then(_ = (querySnapshot) => {
                querySnapshot.forEach(_ = (doc) => {
                    result.push(doc.data());
                });
            });
        if(result.length == 0) return false;
        
        const filteredResult = async (arr, predicate) => {
            const results = await Promise.all(arr.map(predicate));
            return results;
        }
        const pred = await filteredResult(result, async(org) => {

            // Check for skills filter
            let retval = false;
            let eventQuery = await Promise.all(org.events.map(id => this.db.events.byID(id)));
            let orgEvents = eventQuery.map(i => i.data());
            for(const id of orgEvents) {
                if(skillsQuery.some(i => id.skills.includes(i))) {
                    retval = true;
                    break;
                }
            }
            // Check for distance matches (convert our miles to km to work with GeoLib)
            orgLoc = { latitude: ZIPCodes.map.get(org.zip)[0], longitude: ZIPCodes.map.get(org.zip)[1] };
            indLoc = { latitude: ZIPCodes.map.get(user.zip)[0], longitude: ZIPCodes.map.get(user.zip)[1] };
            return retval ? isPointWithinRadius(orgLoc, indLoc, distQuery) : false;
        });
        
        const results = result.filter((value, i) => pred[i]);
        return res.send({body: results});
    }
}