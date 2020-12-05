/** @type {APIEndpointHandler} */
module.exports = {
    method: "put",
    path: "/rate/:id", // id here is review id
    handler: async function (req, res) {
        // Design use case 8.2

        // No need to verify individual because we assume create endpoint works
        // and we check the payload uid later

        // const indiDoc = await this.db.inds.byID(req.payload.uid);
        // if (!indiDoc.exists) return res.sendStatus(403);

        // Get the document
        const reviewDoc = await this.db.ratings.byID(req.params.id);
        if (!reviewDoc.exists) return res.sendStatus(404);
        
        // Only owner can update their review
        const data = reviewDoc.data();
        if (data.owner != req.payload.uid) return res.sendStatus(401);

        // validate rating form
        const validatedForm = this.db.ratings.validate(req.body);
        if (validatedForm.error || validatedForm.errors) return res.sendStatus(400);

        const docToUpdate = this.db.ratings.formToDocument(validatedForm.value);
        docToUpdate.owner = data.owner;

        // update rating document in database
        try {
            await reviewDoc.ref.update(docToUpdate);
            res.sendStatus(200);
        } catch (e) {
            res.sendStatus(500);
        }
    }
}