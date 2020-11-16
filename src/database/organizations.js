const Template = require("./template");
const ZIP = require("../modules/us-zip");
const Joi = require("joi");

const validZIP = ZIP.map.keys();
const validCauses = ["exampleCause", "Disaster Response"];

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
        
        // Default to empty array
        doc.ratings = doc.ratings || [];
        doc.followers = doc.followers || [];
        return doc;
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