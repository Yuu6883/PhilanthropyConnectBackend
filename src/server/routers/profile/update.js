/** @type {APIEndpointHandler} */
module.exports = {
    method: "put",
    path: "/profile/:id",
    handler: function (req, res) {
        // Design use case 2.2
        // TODO: Update the profile in the database with the new data from request 
        const type = req.body.type;
        if (type == "individual") {
            const validatedForm = this.db.inds.schema.validate(req.body);
            if (validatedForm.error || validatedForm.errors) return res.sendStatus(400);

        }
        // Organization implementation of update goes here
        const validatedForm = this.db.orgs.schema.validate(req.body);
        if (validatedForm.error || validatedForm.errors) return res.sendStatus(400);

    }
}