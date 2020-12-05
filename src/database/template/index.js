const Joi = require("joi");

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
    formToDocument(form) { throw new Error("Form transformation not implemented.") }

    /** 
     * @param {F} form
     * @returns {Joi.ValidationResult} document validated
     */
    validate(form) { return this.schema.validate(form, { stripUnknown: true }); }

    /** @param {string} id */
    byID(id) {
        return this.ref.doc(id).get();
    }

    /** 
     * @param {string} id
     * @param {D} data
     */
    update(id, data) {
        return this.ref.doc(id).update(data);
    }

    /** Returns all the documents */
    all() {
        return this.ref.get();
    }

    /** 
     * Inserts a document
     * @param {D & ID} doc
     * @returns document reference, or null if id is duplicated.
     */
    async insert(doc) {
        const id = doc.id;
        if (id) {
            const dup = await this.byID(id);
            if (dup.exists) return null;
            delete doc.id;
            const docRef = this.ref.doc(id);
            await docRef.set(doc);
            return docRef;
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