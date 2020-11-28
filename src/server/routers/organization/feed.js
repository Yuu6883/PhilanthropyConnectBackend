const Individual = require("../../../database/individuals");
const Organizations = require("../../../database/organizations");

/** @type {APIEndpointHandler} */
module.exports = {
    method: "get",
    path: "/organization/feed",
    handler: function (req, res) {
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
            const indiFollowing = indiDoc.following;

            // TODO: For each org, get the org's events
            // Map the org id's to their document?

        // If db is org: send back array of their own events' documents
        } else if (db == Organizations) {

            // Get the org's events
            const org = await this.db.orgs.byID(req.payload.uid);
            if (!org.exists) return res.sendStatus(403);
            const orgDoc = org.data();

            // Map the event id's to their document
            const events = await Promise.all(orgDoc.events.map(id => this.db.events.byID(id)));
            res.send(events.map(r => r.data()));

            /* Trash code
            orgEvents.forEach(eventID => {
                let eventRes = await fetch(`http://localhost:${app.config.port}/api/events/${eventID}`, {
                    method: "GET"
                });
                if (!eventRes.exists) return res.sendStatus(404);
                let finalJSON = finalJSON | {eventRes};
            });
            res.send(finalJSON);
            */
        }
    }
}