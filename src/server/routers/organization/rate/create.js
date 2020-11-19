/** @type {APIEndpointHandler} */
module.exports = {
    method: "post",
    path: "/organization/rate/:id", // id here is org id
    handler: async function (req, res) {
        
        // Design use case 8.1
        const indiDoc = await this.db.inds.byID(req.payload.uid);
        if (!indiDoc.exists) return res.sendStatus(403);

        // validate rating form
        const validatedForm = this.db.ratings.schema.validate(req.body);
        if (validatedForm.error || validatedForm.errors) return res.sendStatus(400);

        // insert rating document into database
        const docToInsert = this.db.ratings.formToDocument(validatedForm.value);
        docToInsert.owner = req.payload.uid;

        // TODO: call method to add rating to org

        const ref = await this.db.ratings.insert(docToInsert);

        res.send({ success: true, id: ref.id });
    }
}