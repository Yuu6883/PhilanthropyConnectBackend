const Template = require("./template");
const ZIPCodes = require("../modules/us-zip");

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
            .min(2)
            .max(40)
    ),
    zip: Joi.string()
        .valid(...validZIPCodes)
        .required()
        .error(() => new Error("Invalid US zip code"))
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
        // TODO: transform the form (add location etc)
        /** @type {IndividualDocument} */
        const doc = form;
        
        doc.ratings = [];
        doc.following = [];

        const point = ZIPCodes.map.get(doc.zip);
        doc.location = new GeoPoint(...point);

        return doc;
    }
}

module.exports = Individual;