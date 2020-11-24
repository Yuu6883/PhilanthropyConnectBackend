/** @type {APIEndpointHandler} */
module.exports = {
    allowGuest: true,
    method: "get",
    path: "/organization/rate/:id", // id here is org id
    handler: async function (req, res) {
        // Returns all the ratings of an org.
        // We don't need an endpoint for a single rating since we will never display it alone 
        const orgDoc = await this.db.orgs.byID(req.params.id);

        if (!orgDoc.exists) return res.sendStatus(404);
        const data = orgDoc.data();

        // Map the rating id's to their document
        const ratings = await Promise.all(data.ratings.map(id => this.db.ratings.byID(id)));
        res.send({ success: true, ratings: ratings.map(r => r.data()) });
    }
}