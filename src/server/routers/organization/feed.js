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
        if (type == "individual") {

            // Get list of following orgs
            const indi = await this.db.inds.byID(req.payload.uid);
            if (!indi.exists) return res.sendStatus(400);
            const indiDoc = indi.data();

            // Map the org id's to their document
            const query = await Promise.all(indiDoc.following.map(id => this.db.orgs.byID(id)));
            /** @type {OrgEventDocument[]} */
            let allEvents = [];  // all events from followed orgs
            
            const simplifiedOrgDocs = []
            // For each org, add their events to final allEvents array
            for (const index in query) {
  
                const orgDoc = query[index];
                const events = await Promise.all(orgDoc.data().events.map(id => this.db.events.byID(id)));
                const eventDocs  = events.map(event => {
                    const data = event.data();
                    data.org = index;
                    return data;
                });
                const orgData = orgDoc.data();
                const simpleOrg = {};
                simpleOrg.id = orgDoc.id;
                simpleOrg.title = orgData.title;
                simpleOrg.picture = orgData.picture;
                simpleOrg.mission = orgData.mission;
                simpleOrg.contact = orgData.contact;
                simplifiedOrgDocs.push(simpleOrg);
                
                allEvents = allEvents.concat(eventDocs);
            }

            // Sort OrgEventDocuments by date: lowest timestamp first
            const events = allEvents
                .filter(e => e.date > Date.now())
                .sort((a, b) => a.date - b.date)
                .slice(0, 50);

            // Get 50 most recent events from allEvents to send back as response
            res.send({ events, orgs: simplifiedOrgDocs });

        // If db is org: send back array of their own events' documents
        } else if (type == "organization") {

            const org = await this.db.orgs.byID(req.payload.uid);
            if (!org.exists) return res.sendStatus(400);
            const orgDoc = org.data();

            const events = await Promise.all(orgDoc.events.map(id => this.db.events.byID(id)));
            res.send(events.map(orgEvent => {
                const data = orgEvent.data();
                data.id = orgEvent.id;
                return data;
            }));
        }
    }
}