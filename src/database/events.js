const Template = require("./template");
const ZIPCodes = require("../modules/us-zip");
const { GeoPoint } = require("@google-cloud/firestore");
const Joi = require("joi");

const validZIPCodes = ZIPCodes.map.keys();

// TODO: define template types in globals.d.ts and object schema
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
        .valid(...validZIPCodes)
        .required()
        .error(() => new Error("Invalid US zip code")),
    skills: Joi.array().items(
        Joi.string()
            .min(2)
            .max(40)
    ),
    date: Joi.date().timestamp()
        .required()
});

/**
 * TODO: define template types in globals.d.ts
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
     * TODO: define template types in globals.d.ts
     * @param {OrgEventForm}
     * @returns {OrgEventDocument}
     */
    create(form) {
        // TODO: transform the form (add location etc)
        /** @type {OrgEventDocument} */
        const doc = form;

        doc.owner = "";  // org's ID
        
        const point = ZIPCodes.map.get(doc.zip);
        doc.location = new GeoPoint(...point);

        return doc;
    }
}

module.exports = Events;