/** @type {APIEndpointHandler} */
module.exports = {
    method: "put",
    path: "/profile/:id",
    handler: async function (req, res) {
        // Design use case 2.2
        /** @type {"individual"|"organization"} */
        const type = req.query.type;

        // Forbidden to update profile for others
        if (req.params.id != "@me") return res.sendStatus(403);
        
        const db = { "individual": this.db.inds, "organization": this.db.orgs }[type];
        
        if (!db) return res.sendStatus(400);

        const validatedForm = db.schema.validate(req.body);
        if (validatedForm.error || validatedForm.errors) return res.sendStatus(400);
        
        let doc = db.formToDocument(validatedForm.value);
        
        doc.email = req.payload.email || "";
        doc.picture = req.payload.picture || "";

        try {
            await db.update(req.payload.uid, doc);
            return res.sendStatus(200);
        } catch (e) {
            // uid doesn't exist
            return res.sendStatus(404);
        }
    }
}