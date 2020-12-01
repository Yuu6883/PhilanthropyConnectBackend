const Template = require("./template");
const ZIPCodes = require("../modules/us-zip");
const Joi = require("joi");
const firestore = require("@google-cloud/firestore");

const { validCauses } = require("../constants");
const { GeoPoint } = require("@google-cloud/firestore");

const validZIP = ZIPCodes.map.keys();

/** @type {Joi.ObjectSchema<OrganizationForm>} */
const schema = Joi.object({
    title: Joi.string()
        .required(),
    mission: Joi.string()
        .required(),
    causes: Joi.array().items(
        Joi.string()
            .valid(...validCauses)
    ),
    zip: Joi.string()
        .required()
        .custom((value, helpers) => ZIPCodes.map.has(value) ? value : helpers.error("Invalid ZIP code")),
    contact: Joi.string()
        .required(),
    url: Joi.string()
        .required(),
    events: Joi.array().items(
        Joi.string()
    )
});

/**
 * @extends {Template<OrganizationForm, OrganizationDocument>}
 */
class Organizations extends Template {

    /**
     * Events schema
     * @param {import("../server/index")} app
     */
    constructor(app) {
        super(app, "organizations", schema);
    }

    /** 
     * @param {OrganizationForm}
     * @returns {OrganizationDocument}
     */
    formToDocument(form) {
        
        /** @type {OrganizationDocument} */
        const doc = form;
        
        // Defaults
        doc.email = "";
        doc.picture = "";
        doc.ratings = doc.ratings || [];
        doc.followers = doc.followers || [];
        
        const point = ZIPCodes.map.get(doc.zip);
        doc.location = new GeoPoint(...point);

        return doc;
    }

    delete(id) {
        if (this.app.isProd) this.app.logger.onError("Should not attempt to delete orgnization document in production");
        else return super.delete(id);
    }

    /**
     * @param {string} org organization id
     * @param {string} id rating id
     */
    addRating(org, id) {
        return this.ref.doc(org).update({
            ratings: firestore.FieldValue.arrayUnion(id)
        });
    }

    /**
     * @param {string} id rating id
     */
    async removeRating(id) {
        // Find Org ID first
        const result = await this.ref.where("ratings", "array-contains", id).get();
        const doc = result.docs[0];
        return await doc.ref.update({
            ratings: firestore.FieldValue.arrayRemove(id)
        });
    }

    /**
     * @param {string} org organization id
     * @param {string} id individual id
     */
    addFollower(org, id) {
        return this.ref.doc(org).update({
            followers: firestore.FieldValue.arrayUnion(id)
        });
    }

    /**
     * @param {string} org organization id
     * @param {string} id individual id
     */
    removeFollower(org, id) {
        return this.ref.doc(org).update({
            followers: firestore.FieldValue.arrayRemove(id)
        });
    }

    /**
     * @param {IndividualDocument} indi 
     * @param {number} radius 
     * @return {Promise<FirebaseFirestore.QuerySnapshot<D>>}
     */
    getOrgsWithin(indi, radius) {
        // TODO: write the query
    }
}

module.exports = Organizations;