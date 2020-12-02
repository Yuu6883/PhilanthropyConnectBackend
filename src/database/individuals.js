const Template = require("./template");
const ZIPCodes = require("../modules/us-zip");

const { validCauses, validSkills, ageCats } = require("../constants");
const { GeoPoint } = require("@google-cloud/firestore");
const Joi = require("joi");
const { firestore } = require("firebase-admin");

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
    causes: Joi.array().unique().items(
        Joi.string()
            .valid(...validCauses)
            .error(() => new Error("Invalid causes"))
    ),
    zip: Joi.string()
        .required()
        .custom((value, helpers) => ZIPCodes.map.has(value) ? value : helpers.error("Invalid ZIP code")),
    skills: Joi.array().unique().items(
        Joi.string()
            .valid(...validSkills)
    ),
    age: Joi.string() // drop down menu figure out how to do this (10-19, 20-29, etc)
        .valid(...ageCats)
        // .required()
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
    formToDocument(form) {
        // Tasks left: populate email field of form from somewhere
        /** @type {IndividualDocument} */
        const doc = form;
        
        // Defaults
        doc.email = "";
        doc.picture = "";
        doc.following = doc.following || [];

        const point = ZIPCodes.map.get(doc.zip);
        doc.location = new GeoPoint(...point);

        return doc;
    }

    follow(id, orgID) {
        return this.ref.doc(id).update({
            following: firestore.FieldValue.arrayUnion(orgID)
        });
    }

    unfollow(id, orgID) {
        return this.ref.doc(id).update({
            following: firestore.FieldValue.arrayRemove(orgID)
        });
    }

    delete(id) {
        if (this.app.isProd) this.app.logger.onError("Should not attempt to delete individual document in production");
        else return super.delete(id);
    }
}

module.exports = Individual;