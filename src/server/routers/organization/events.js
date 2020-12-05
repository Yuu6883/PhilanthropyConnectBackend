/** @type {APIEndpointHandler} */
module.exports = {
    method: "get",
    path: "/organization/events/:id", // org id
    handler: async function (req, res) {
        // Design use case 4.4 & 4.5

        const doc = await this.db.orgs.byID(req.params.id);
        // Unknown type in the query string
        if (!doc.exists) return res.sendStatus(404);

        const events = await Promise.all(doc.data().events.map(id => this.db.events.byID(id)));
        res.send(events.map(e => e.data()));
    }
}