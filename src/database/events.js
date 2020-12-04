const Template = require("./template");
const ZIPCodes = require("../modules/us-zip");

const { validSkills } = require("../constants");
const { GeoPoint } = require("@google-cloud/firestore");
const Joi = require("joi");

/** @type {Joi.ObjectSchema<OrgEventForm>} */
const schema = Joi.object({
    title: Joi.string()
        .min(2)
        .max(40)
        .required(),
    details: Joi.string()
        .min(2)
        .max(200)
        .required(),
    zip: Joi.string()
        .required()
        .custom((value, helpers) => ZIPCodes.map.has(value) ? value : helpers.message("Invalid ZIP code")),
    skills: Joi.array().unique().items(
        Joi.string()
            .valid(...validSkills)
    ),
    date: Joi.date().timestamp()
        .required()
});

/**
 * @extends {Template<OrgEventForm, OrgEventDocument>}
 */
class Events extends Template {

    /**
     * Events schema
     * @param {import("../server/index")} app
     */
    constructor(app) {
        super(app, "events", schema);
    }

    /** 
     * @param {OrgEventForm} form
     * @returns {OrgEventDocument}
     */
    formToDocument(form) {
        /** @type {OrgEventDocument} */
        const doc = form;

        // Default
        doc.owner = "";  // org's ID
        
        const point = ZIPCodes.map.get(doc.zip);
        doc.location = new GeoPoint(...point);

        return doc;
    }
}

module.exports = Events;