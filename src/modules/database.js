const Inds    = require("../database/individuals");
const Orgs    = require("../database/organizations");
const Events  = require("../database/events");
const Ratings = require("../database/ratings");

module.exports = class DB {
    /** @param {import("../server/index")} app */
    constructor(app) {
        this.inds    = new Inds(app);
        this.orgs    = new Orgs(app);
        this.events  = new Events(app);
        this.ratings = new Ratings(app);
    }

    /** @param {string} id */
    async existsProfile(id) {
        return (await this.inds.byID(id)).exists || (await this.orgs.byID(id)).exists;
    }
}