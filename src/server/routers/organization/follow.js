/** @type {APIEndpointHandler} */
module.exports = {
    method: "post",
    path: "/organization/:id",
    handler: function (req, res) {
        // Design use case 5.2
        // /organizations/id?follow=[true/false]
        const type = req.query.follow;
        
        // validate organization exists from req.params.id
        const org = await this.db.orgs.byID(req.params.id);
        if (!org.exists) return res.sendStatus(400);
        const orgDoc = org.data();
        // validate it's a individual user in req.payload.uid
        const follower = await this.db.inds.byID(req.payload.uid);
        if (!follower.exists) return res.sendStatus(401);
        // call addFollower
        if(type) {
            await this.db.orgs.addFollower(org, follower);
        } else {
            await this.db.orgs.removeFollower(org, follower);
        }    
        // done!!
        
        // TODO: follow/unfollow organization
    }
}