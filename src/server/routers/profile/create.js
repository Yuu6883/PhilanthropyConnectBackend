/** @type {APIEndpointHandler} */
module.exports = {
    method: "post",
    path: "/profile/create",
    handler: async function (req, res) {
        // Design use case 2.1
        // TODO: validate user registration form and create either an individual or an organization record
        const type = req.query.type;

        if (type == "individual") {
            
            const validatedForm = this.db.inds.schema.validate(req.body);
            if (validatedForm.error || validatedForm.errors) {
                console.error(validatedForm.error || validatedForm.errors);
                return res.sendStatus(400);
            }
            
            let doc = this.db.inds.formToDocument(validatedForm.value);
            
            doc.id = req.payload.uid;
            doc.email = req.payload.email;

            await this.db.inds.insert(doc);
            return res.sendStatus(200);

        } else if (type == "organization") {

            // Organization implementation of create goes here
            const validatedForm = this.db.orgs.schema.validate(req.body);
            if (validatedForm.error || validatedForm.errors) return res.sendStatus(400);
        } else return res.sendStatus(400);

        // TODO: Create an organization record
        // const validatedDocument = this.db.orgs.formToDocument(validatedForm);
        // await this.db.orgs.insert(validatedForm);
        // return res.sendStatus(200);

    }
}