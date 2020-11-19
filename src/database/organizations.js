const Template = require("./template");
const ZIP = require("../modules/us-zip");
const Joi = require("joi");
const firestore = require("@google-cloud/firestore");

const { validCauses } = require("../constants");

const validZIP = ZIP.map.keys();

/** @type {Joi.ObjectSchema<OrganizationForm>} */
const schema = Joi.object({
    title: Joi.string()
        .required(),
    mission: Joi.string()
        .required(),
    cause: Joi.array().items(
        Joi.string()
            .valid(...validCauses)
    ),
    zip: Joi.string()
        .valid(...validZIP)
        .required()
        .error(() => new Error("Invalid US zip code")),
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
     * @param {string} org organization id
     * @param {string} id rating id
     */
    removeRating(org, id) {
        return this.ref.doc(org).update({
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