/** @type {APIEndpointHandler} */
module.exports = {
    method: "post",
    path: "/events/create/:id", // id here is org id",
    handler: async function (req, res) {

        // Design use case 4.1
        const orgDoc = await this.db.orgs.byID(req.payload.uid);
        if (!orgDoc.exists) return res.sendStatus(403);

        // validate event form
        const validatedForm = this.db.events.schema.validate(req.body);
        if (validatedForm.error || validatedForm.errors) return res.sendStatus(400);
        
        // insert event document into database
        const docToInsert = this.db.events.formToDocument(validatedForm.value);
        docToInsert.owner = req.payload.uid;
        const ref = await this.db.events.insert(docToInsert);

        // try to add event to org, if it exists
        try {
            await this.db.orgs.addEvent(req.params.id, ref.id);
            res.send({ success: true, id: ref.id });
        } catch (e) {
            // Remove the event if we failed to add it to some org document
            await ref.delete().catch(() => {});
            res.sendStatus(404);
        }
    }
}