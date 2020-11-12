const Inds    = require("../database/individuals");
const Orgs    = require("../database/organizations");
const Events  = require("../database/events");
const Ratings = require("../database/ratings");

module.exports = class DB {
    /** @param {import("../server/index")} app */
    constructor(app) {
        this.inds    = new Inds(app.firestore.collection("individuals"));
        this.orgs    = new Orgs(app.firestore.collection("organizations"));
        this.events  = new Events(app.firestore.collection("events"));
        this.ratings = new Ratings(app.firestore.collection("ratings"));
    }
}