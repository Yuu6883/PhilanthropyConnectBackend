/**
 * @template F form that need's to be validated
 * @template D document that this template work with
 */
class Template {
    /** 
     * @param {import("../../server/index")} app server instance
     * @param {string} name collection name
     * @param {import("joi").ObjectSchema<F>} schema schema used to validate form
     */
    constructor(app, name, schema) {
        this.app = app;
        /** @type {import("@google-cloud/firestore").CollectionReference<D>} */
        this.ref = app.firestore.collection(app.isProd ? name : `dev-${name}`);
        this.schema = schema;
    }

    /** 
     * @param {F} form
     * @returns {D} document parsed/transformed 
     */
    create(form) { throw new Error("Form transformation not implemented.") }

    /** 
     * @param {F} form
     * @returns document validated
     */
    validate(form) { return this.schema.validate(form); }

    /** @param {string} id */
    byID(id) {
        return this.ref.doc(id).get();
    }

    /** Returns all the documents */
    all() {
        return this.ref.get();
    }

    /** 
     * Inserts a document
     * @param {D & ID} doc
     * @returns a boolean if no id is in the document, 
     * or the document reference created with generated id.
     */
    async insert(doc) {
        const id = doc.id;
        if (id) {
            const dup = await this.byID(id);
            if (dup.exists) return false;
            delete doc.id;
            return (await this.ref.doc(id).set(doc), true);
        } else {
            return await this.ref.add(doc);
        }
    }

    /**
     * Deletes a doc by the id
     * @param {string} id
     * @returns if the document is found and deleted
     */
    async delete(id) {
        const doc = await this.byID(id);
        return doc.exists ? (await doc.ref.delete(), true) : false;     
    }
}

module.exports = Template;