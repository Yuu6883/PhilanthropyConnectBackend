/** @type {APIEndpointHandler} */
module.exports = {
    method: "post",
    path: "/events/create",
    handler: async function (req, res) {

        // Design use case 4.1
        const orgDoc = await this.db.orgs.byID(req.payload.uid);
        if (!orgDoc.exists) return res.sendStatus(403);

        const validatedForm = this.db.events.schema.validate(req.body);
        if (validatedForm.error || validatedForm.errors) {
            console.error(validatedForm.error || validatedForm.errors);
            return res.sendStatus(400);
        }
        const docToInsert = this.db.events.formToDocument(validatedForm.value);
        docToInsert.owner = req.payload.uid;
        const ref = await this.db.events.insert(docToInsert);
        res.send({ success: true, id: ref.id });
    }
}