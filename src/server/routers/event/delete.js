/** @type {APIEndpointHandler} */
module.exports = {
    method: "delete",
    path: "/events/:id",
    handler: async function (req, res) {
        // Design use case 4.3
        const eventDoc = await this.db.events.byID(req.params.id);

        if (!eventDoc.exists) return res.sendStatus(404);
        if (eventDoc.data().owner != req.payload.uid) return res.sendStatus(401);

        try {
            await this.db.orgs.removeEvent(req.payload.uid, req.params.id);
            await eventDoc.ref.delete();
            res.sendStatus(200);
        } catch (e) {
            res.sendStatus(500);
        }
    }
}