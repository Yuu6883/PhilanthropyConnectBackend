/** @type {APIEndpointHandler} */
module.exports = {
    method: "post",
    path: "/events/create",
    handler: function (req, res) {
        // Design use case 4.1
        // TODO: validate user event form and create an event
        const validatedForm = this.db.events.schema.validate(req.body);
        if (validatedForm.error || validatedForm.errors) return res.sendStatus(400);
        const validatedDoc = this.db.events.create(validatedForm);
    }
}