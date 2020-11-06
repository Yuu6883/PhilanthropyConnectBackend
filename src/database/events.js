// TODO: import firebase and stuff...

module.exports = class OrgEvents {

    constructor() {
        this.id = "";
        this.title = "";
        this.zip = 0;
        /** @type {string[]} */
        this.skills = [];
        this.date = 0;
        throw new Error("Schema Object constructor should not be called. Use prototype instead");
    }

    /** 
     * Gets an event doc by the event id
     * @param {string}
     * @returns {OrgEvents}
     */
    static getByID(id) {
        // TODO: implement
    }

    /** 
     * Gets an events doc by the org id
     * @param {string}
     * @returns {OrgEvents[]}
     */
    static getByOrgID(id) {
        // TODO: implement
    }

    static post() {
        
    }
}