/** @type {APIEndpointHandler} */
module.exports = {
    method: "put",
    path: "/events/:id",
    handler: async function (req, res) {
        // Design use case 4.2
        const eventDoc = await this.db.events.byID(req.params.id);
        if (!eventDoc.exists) return res.sendStatus(404);

        const data = eventDoc.data();
        if (data.owner != req.payload.uid) return res.sendStatus(401);

        // validate event form
        const validatedForm = this.db.events.schema.validate(req.body);
        if (validatedForm.error || validatedForm.errors) return res.sendStatus(400);
        
        // insert event document into database
        const docToUpdate = this.db.events.formToDocument(validatedForm.value);
        docToUpdate.owner = req.payload.uid;

        try {
            await eventDoc.ref.update(docToUpdate);
            res.sendStatus(200);
        } catch (e) {
            res.sendStatus(500);
        }
    }
}