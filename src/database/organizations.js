const Template = require("./template");
const ZIP = require("../modules/us-zip");
const Joi = require("joi");

const validZIP = ZIP.map.keys();
const validCauses = ["exampleCause", "Disaster Response"];

// TODO: define template types in globals.d.ts and object schema
/** @type {Joi.ObjectSchema<any>} */
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
    org_contact: Joi.string()
        .required(),
    org_url: Joi.string()
        .required(),
    events: Joi.array().items(
        Joi.string()
    )
});

/**
 * TODO: define template types in globals.d.ts
 * @extends {Template<any, any>}
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
     * TODO: define template types in globals.d.ts
     * @param {}
     * @returns {}
     */
    create(form) {
        
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