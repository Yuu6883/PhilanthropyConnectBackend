const { ageCats } = require("../../../constants");

/** @type {APIEndpointHandler} */
module.exports = {
    method: "get",
    path: "/organization/stats/:id", // org id
    handler: async function (req, res) {
        // Design use case 4.4 & 4.5

        const doc = await this.db.orgs.byID(req.params.id == "@me" ? req.payload.uid : req.params.id);
        // Unknown type in the query string
        if (!doc.exists) return res.sendStatus(404);

        const followers = await Promise.all(doc.data().followers.map(id => this.db.inds.byID(id)));
        const ratings = await Promise.all(doc.data().ratings.map(id => this.db.ratings.byID(id)));

        const ageCount = Object.fromEntries(ageCats.map(age => [age, 0]));
        followers.forEach(v => ageCount[v.data().age]++);

        const ratingCount = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        ratings.forEach(v => ratingCount[v.data().stars]++);

        res.send({
            followers: followers.length,
            ratingsCount: ratings.length,
            age: ageCount,
            ratings: ratingCount,
        });
    }
}