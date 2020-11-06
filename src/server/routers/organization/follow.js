/** @type {APIEndpointHandler} */
module.exports = {
    method: "post",
    path: "/organization/follow/:id",
    handler: function (req, res) {
        // Design use case 5.2
        // /organizations/follow/id?f=[true/false]
        // TODO: follow/unfollow organization
    }
}