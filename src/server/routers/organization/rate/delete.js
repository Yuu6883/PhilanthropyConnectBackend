/** @type {APIEndpointHandler} */
module.exports = {
    method: "delete",
    path: "/organization/rate/:id", // review id
    handler: async function (req, res) {
        // Design use case 7.3
        const indiDoc = await this.db.inds.byID(req.payload.uid);
        if (!indiDoc.exists) return res.sendStatus(403);

        const reviewDoc = await this.db.ratings.byID(req.params.id);
        if (!reviewDoc.exists) return res.sendStatus(404);

        const data = reviewDoc.data();
        if (data.owner != req.payload.uid) return res.sendStatus(401);

        try {
            await this.db.orgs.removeRating(reviewDoc.id);
            await reviewDoc.ref.delete();
            res.sendStatus(200);
        } catch (e) {
            res.sendStatus(500);
        }
    }
}