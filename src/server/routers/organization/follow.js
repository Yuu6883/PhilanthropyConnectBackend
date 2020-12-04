/** @type {APIEndpointHandler} */
module.exports = {
    method: "post",
    path: "/organization/:id",
    handler: async function (req, res) {
        // Design use case 5.2
        // /organizations/id?follow=[true/false]
        const type = req.query.follow;
        
        // validate it's a individual user in req.payload.uid
        const indi = await this.db.inds.byID(req.payload.uid);
        if (!indi.exists) return res.sendStatus(401);
        // validate organization exists from req.params.id
        const org = await this.db.orgs.byID(req.params.id);
        if (!org.exists) return res.sendStatus(404);
        
        // call addFollower
        if (type == "true") {
            if (org.data().followers.includes(indi.id) && indi.data().following.includes(org.id)) {
                return res.sendStatus(409); // conflict! already followed
            } else {
                if (!org.data().followers.includes(indi.id)) await this.db.orgs.addFollower(org.id, indi.id);
                if (!indi.data().following.includes(org.id)) await this.db.inds.follow(indi.id, org.id);
                res.sendStatus(200);
            }
        } else if (type == "false") {
            if (!org.data().followers.includes(indi.id) && !indi.data().following.includes(org.id)) {
                return res.sendStatus(409); // conflict! already followed
            } else {
                if (org.data().followers.includes(indi.id)) await this.db.orgs.removeFollower(org.id, indi.id);
                if (indi.data().following.includes(org.id)) await this.db.inds.unfollow(indi.id, org.id);
                res.sendStatus(200);
            }
        } else return res.sendStatus(400);
    }
}