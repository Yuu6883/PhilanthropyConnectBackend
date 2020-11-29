const Individual = require("../../../database/individuals");
const Organizations = require("../../../database/organizations");

/** @type {APIEndpointHandler} */
module.exports = {
    method: "get",
    path: "/organization/feed",
    handler: async function (req, res) {
        // Design use case 4.4 & 4.5

        // Check if person requesting is an org or individual
        /** @type {"individual"|"organization"} */
        const type = req.query.type;
        const db = { "individual": this.db.inds, "organization": this.db.orgs }[type];

        // Unknown type in the query string
        if (!db) return res.sendStatus(400);

        // If db is individual: send back array of following org's events' documents
        if (db == Individual) {

            // Get list of following orgs
            const indi = await this.db.inds.byID(req.payload.uid);
            if (!indi.exists) return res.sendStatus(403);
            const indiDoc = indi.data();

            // Map the org id's to their document
            const query = await Promise.all(indiDoc.following.map(id => this.db.orgs.byID(id)));
            let followedOrgs  = query.map(org => org.data());

            /** @type {OrgEventDocument[]} */
            const allEvents = [];  // all events from followed orgs
            
            // For each org, add their events to final allEvents array
            for (orgDoc in followedOrgs) {
  
                const events = await Promise.all(orgDoc.events.map(id => this.db.events.byID(id)));
                let eventDocs  = events.map(org => org.data());
                
                allEvents = allEvents || eventDocs;
            }

            // Sort OrgEventDocuments by date: lowest timestamp first
            allEvents.sort(function(a, b) {return a.date - b.date});

            // Get 50 most recent events from allEvents to send back as response
            res.send(allEvents.slice(0, 49));

        // If db is org: send back array of their own events' documents
        } else if (db == Organizations) {

            const org = await this.db.orgs.byID(req.payload.uid);
            if (!org.exists) return res.sendStatus(403);
            const orgDoc = org.data();

            const events = await Promise.all(orgDoc.events.map(id => this.db.events.byID(id)));
            res.send(events.map(orgEvent => orgEvent.data()));
        }
    }
}