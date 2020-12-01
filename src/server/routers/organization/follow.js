/** @type {APIEndpointHandler} */
module.exports = {
    method: "post",
    path: "/organization/:id",
    handler: function (req, res) {
        // Design use case 5.2
        // /organizations/id?follow=[true/false]

        // validate it's a individual user in req.payload.uid
        // validate organization exists from req.params.id
        // call addFollower
        // done!!
        
        // TODO: follow/unfollow organization
    }
}