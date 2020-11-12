module.exports = class Rating {

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
}