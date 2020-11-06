// TODO: import firebase and stuff...

module.exports = class Individual {

    constructor() {
        this.id = "";
        this.username = "";
        this.f_name = "";
        this.l_name = "";
        this.zip = 0;
        /** @type {string[]} */
        this.cause = [];
        /** @type {string[]} */
        this.skills = [];
        this.gender = "";
        /** @type {string[]} */
        this.ratings = [];
        /** @type {string[]} */
        this.following = [];
        throw new Error("Schema Object constructor should not be called. Use prototype instead");
    }

    /**
     * Gets an individual's document by the event id
     * @param {string}
     * @returns {Individual}
     */
    static getByID(id) {
        // TODO: implement
    }
}