/** @type {APIEndpointHandler} */
module.exports = {
    method: "post",
    path: "/organization/:id",
    handler: function (req, res) {
        // Design use case 5.2
        // /organizations/id?follow=[true/false]
        // TODO: follow/unfollow organization
    }
}