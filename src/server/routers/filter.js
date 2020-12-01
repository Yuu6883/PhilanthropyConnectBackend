const { validCauses, validSkills } = require("../../constants");
const Joi = require("joi");
const { GeoPoint } = require("@google-cloud/firestore");
const { isPointWithinRadius, getBoundsOfDistance } = require("geolib");

/**
 * @param {[]} arr1
 * @param {[]} arr2
 */
const arrayIntersection = (arr1, arr2) => arr1.reduce((prev, curr) => prev += arr2.includes(curr) ? 1 : 0, 0);

/** @type {APIEndpointHandler} */
module.exports = {
    method: "post",
    path: "/filter",
    handler: async function (req, res) {
        // Design use case 3.1 - 3.3
        // /api/organizations/filter?skills=["filter1","filter2","etc"]&causes=[]

        /** @type {"events"|"organization"} */
        const type = req.query.type;
        const db = { "events": this.db.events, "organization": this.db.orgs }[type];
        const matchField = { "events": "skills", "organization": "causes" }[type];
        if (!db) return res.sendStatus(400);
        
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
            ).default(user.causes || []),
            // User queries for skills
            skills: Joi.array().items( 
                Joi.string()
                    .valid(...validSkills)
            ).default(user.skills || []),
            // User queries for distance in miles
            distance: Joi.number().default(50)
        });

        // Validate the filter query
        const validatedForm = schema.validate(req.body);
        if (validatedForm.error || validatedForm.errors) return res.sendStatus(400);
        /** @type {FilterOptions} */
        const filters = validatedForm.value;
        
        // Query db by distance
        const bounds = getBoundsOfDistance([user.location.longitude, user.location.latitude], filters.distance);
        const query = await db.ref
            .where("location",  ">=", new GeoPoint(bounds[0].latitude, bounds[0].longitude))
            .where("location",  "<=", new GeoPoint(bounds[1].latitude, bounds[1].longitude))
            .get();

        const result = query.docs
            // map document to data to be filtered
            .map(snapshot => {
                /** @type {OrgEventDocument|OrganizationDocument} */
                const doc = snapshot.data();
                // console.log(`doc[${matchField}] = ${doc[matchField]}, filters[${matchField}] = ${filters[matchField]}`);
                return {
                    matches: arrayIntersection(doc[matchField], filters[matchField]), 
                    keep: isPointWithinRadius([doc.location.longitude, doc.location.latitude],
                        [user.location.longitude, user.location.latitude], filters.distance),
                    doc
                };
            })
            // filter values
            .filter(r => r.keep && r.matches)
            // sort on how many matches there are
            .sort((a, b) => b.matches - a.matches)
            // map it back to the document
            .map(r => r.doc);

        return res.send(result);
    }
}