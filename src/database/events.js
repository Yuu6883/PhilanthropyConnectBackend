class Events {

    /** @param {import("@google-cloud/firestore").CollectionReference} ref */
    constructor(ref) {
        this.ref = ref;
    }

    /**
     * Gets an event doc by the event id
     * @param {string}
     * @returns {}
     */
    getByID(id) {
        // TODO: implement
    }

    /** 
     * Gets an events doc by the org id
     * @param {string}
     * @returns {[]}
     */
    getByOrgID(id) {
        // TODO: implement
    }
}

module.exports = Events;