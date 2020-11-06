/** @type {APIEndpointHandler} */
module.exports = {
    method: "get",
    path: "/profile/:id",
    handler: function (req, res) {

        this.logger.warn(`User is getting profile of id: ${req.params.id}`);
        // Design use case 2.3
        // TODO: edit the user profile based on the form submitted
    }
}