/** @type {APIEndpointHandler} */
module.exports = {
    allowGuest: true,
    method: "get",
    path: "/events/:id",
    handler: async function (req, res) {
        // Design use case 4.4
        const eventDoc = await this.db.events.byID(req.params.id);

        if (!eventDoc.exists) return res.sendStatus(404);
        return res.send(eventDoc.data());
    }
}