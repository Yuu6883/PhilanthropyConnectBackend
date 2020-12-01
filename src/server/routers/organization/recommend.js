/** @type {APIEndpointHandler} */
module.exports = {
    method: "GET",
    path: "/organization/recommend",
    handler: function (req, res) {
        // Design use case 6.1
        // TODO: get organization recommendations
        // All frontend has to do is send a request here
        // And all we have to do is get ALL the orgs database
        // Just return X number of organizations that the user isn't already following
    }
}