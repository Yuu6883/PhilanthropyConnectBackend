const { GeoPoint } = require("@google-cloud/firestore");
const { isPointWithinRadius, getBoundsOfDistance } = require("geolib");
const follow = require("./organization/follow");


/**
 * @param {[]} arr1
 * @param {[]} arr2
 */
const arrayIntersection = (arr1, arr2) => arr1.reduce((prev, curr) => prev += arr2.includes(curr) ? 1 : 0, 0);

/**
 * @param {[]} arr1
 * @param {[]} arr2
 */
const arrayIntersection = (arr1, arr2) => arr1.reduce((prev, curr) => prev += arr2.includes(curr) ? 1 : 0, 0);

/** @type {APIEndpointHandler} */
module.exports = {
    method: "get",
    path: "/recommend",
    handler: async function (req, res) {
        // Design use case 6.1

        // /api/organizations/filter?type=organization for organization
        // /api/organizations/filter?type=events for events recommendations

        // All frontend has to do is send a request here
        // And all we have to do is get ALL the orgs database
        // Just return X number of organizations that the user isn't already following
        // User id is guaranteed here since we don't have any allowance for guest user on this tab

        /** @type {"events"|"organization"} */
        const type = req.query.type;
        const db = { "events": this.db.events, "organization": this.db.orgs }[type];
        const matchField = { "events": "skills", "organization": "causes" }[type];
        
        if (!db) return res.sendStatus(400);
        
        // Query individual db for user location
        const userDoc = await this.db.inds.byID(req.payload.uid);
        if (!userDoc.exists) return res.sendStatus(400);
        const user = userDoc.data();

        // Filters: cause defaults to all followed org causes
        const followedQuery = await Promise.all(user.following.map(id => this.db.orgs.byID(id)));
        const followedCauses = type == "organization" ? [...new Set(followedQuery.map(r => r.data()).map(org => org.causes).flat())] : [];

        /** @type { FilterOptions } */
        const filters = {
            causes: user.causes.length ? user.causes : followedCauses,
            skills: user.skills || [],
            distance: 100
        }

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
                const followingField = {"events": doc.owner, "organization": snapshot.id }[type];
                // console.log(`doc[${matchField}] = ${doc[matchField]}, filters[${matchField}] = ${filters[matchField]}`);
                return {
                    matches: arrayIntersection(doc[matchField], filters[matchField]), 
                    keep: isPointWithinRadius([doc.location.longitude, doc.location.latitude],
                        [user.location.longitude, user.location.latitude], filters.distance) && 
                        !(user.following.includes(followingField)),
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