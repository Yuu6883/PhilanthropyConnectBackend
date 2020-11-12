const IndividualSchema = require("./schema/individual");

module.exports = class Individual {

    /** @param {import("@google-cloud/firestore").CollectionReference} ref */
    constructor(ref) {
        this.ref = ref;
    }

    get schema() { return IndividualSchema; }

    /**
     * Gets a user doc by uid
     * @param {string} id
     */
    getByID(id) {
        return this.ref.doc(id).get();
    }

    getAll() {
        return this.ref.get();
    }

    /** @param {IndividualDocument} doc */
    async insert(doc) {
        const id = doc.id;
        const dup = await this.getByID(id);
        if (dup.exists) return false;
        delete doc.id;
        return await this.ref.doc(id).set(doc);
    }

    /**
     * Deletes a user doc by the uid
     * (not wanted in production?)
     * @param {string} id
     */
    async delete(id) {
        const doc = await this.ref.doc(id).get();
        return doc.exists ? (await doc.ref.delete(), true) : false;     
    }
}