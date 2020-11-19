/** @type {APIEndpointHandler} */
module.exports = {
    allowGuest: true,
    method: "get",
    path: "/profile/:id",
    handler: async function (req, res) {
        // Design use case 2.3

        // User wants their own profile (called after login)
        if (req.params.id == "@me") {
            // User not logged in but try to get own profile
            if (!req.payload || !req.payload.uid) return res.sendStatus(401);
            // Get from either collections
            let doc = (await this.db.inds.byID(req.payload.uid)).data() || 
                      (await this.db.orgs.byID(req.payload.uid)).data();

            if (!doc) return res.sendStatus(500);
            return res.send({
                success: true, 
                // Quick hack to distinguish 2 types of profile
                type: doc.url ? "organization" : "individual", 
                profile: doc
            });
        }

        // User wants to get others' profile (knowing what type it is)
        /** @type {"individual"|"organization"} */
        const type = req.query.type;
        const db = { "individual": this.db.inds, "organization": this.db.orgs }[type];
        
        // Unknown type in the query string
        if (!db) return res.sendStatus(400);
        
        // Send the document back to client if it exists
        const doc = await db.byID(req.params.id);
        if (!doc.exists) return res.sendStatus(404);
        else return res.send({ success: true, type, profile: doc.data() });
    }
}