/** @type {APIEndpointHandler} */
module.exports = {
    method: "post",
    path: "/profile/create",
    handler: async function (req, res) {
        // Design use case 2.1
        /** @type {"individual"|"organization"} */
        const type = req.query.type;

        if (await this.db.existsProfile(req.payload.uid)) {
            return res.status(400).send({ error: "Profile already exists with the associated account" });
        }

        const db = { "individual": this.db.inds, "organization": this.db.orgs }[type];
        
        if (!db) return res.status(400).send({ error: `Unknown type: ${type}` });

        const validatedForm = db.schema.validate(req.body);
        if (validatedForm.error || validatedForm.errors) return res.status(400).send((validatedForm.error || validatedForm.errors).message);
        
        let doc = db.formToDocument(validatedForm.value);
        
        doc.id = req.payload.uid;
        doc.email = req.payload.email || "";
        doc.picture = req.payload.picture || "";

        await db.insert(doc);
        return res.sendStatus(200);
    }
}