const Template = require("./template");
const ZIPCodes = require("../modules/us-zip");

const { validCauses, validSkills, ageCats } = require("../constants");
const { GeoPoint } = require("@google-cloud/firestore");
const Joi = require("joi");

const validZIPCodes = ZIPCodes.map.keys();

/** @type {Joi.ObjectSchema<IndividualForm>} */
const schema = Joi.object({
    firstname: Joi.string()
        .alphanum()
        .min(2)
        .max(40)
        .required(),
    lastname: Joi.string()
        .alphanum()
        .min(2)
        .max(40)
        .required(),
    cause: Joi.array().items(
        Joi.string()
            .valid(...validCauses)
            .error(() => new Error("Invalid cause"))
    ),
    zip: Joi.string()
        .valid(...validZIPCodes)
        .required()
        .error(() => new Error("Invalid US zip code")),
    skills: Joi.array().items(
        Joi.string()
            .valid(...validSkills)
    ),
    age: Joi.string() // drop down menu figure out how to do this (10-19, 20-29, etc)
        .valid(...ageCats)
        .required()
        .error(() => new Error("Invalid age range"))
});

/**
 * @extends {Template<IndividualForm, IndividualDocument>}
 */
class Individual extends Template {

    /**
     * Individual schema
     * @param {import("../server/index")} app
     */
    constructor(app) {
        super(app, "individuals", schema);
    }

    /** 
     * @param {IndividualForm} form
     * @returns {IndividualDocument}
     */
    create(form) {
        // Tasks left: populate email field of form from somewhere
        /** @type {IndividualDocument} */
        const doc = form;
        
        // Default to empty array
        doc.ratings = doc.ratings || [];
        doc.following = doc.following || [];

        const point = ZIPCodes.map.get(doc.zip);
        doc.location = new GeoPoint(...point);

        return doc;
    }
}

module.exports = Individual;