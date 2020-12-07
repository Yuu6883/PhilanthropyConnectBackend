const Template = require("./template");
const Joi = require("joi");

/** @type {Joi.ObjectSchema<RatingForm>} */
const schema = Joi.object({
    stars: Joi.valid(1, 2, 3, 4, 5)
        .required(),
    description: Joi.string()
        .min(2)
        .max(200)
        .required()
});

/**
 * @extends {Template<RatingForm, RatingDocument>}
 */
class Ratings extends Template {

    /**
     * Ratings schema
     * @param {import("../server/index")} app
     */
    constructor(app) {
        super(app, "ratings", schema);
    }

    /** 
     * @param {RatingForm} form
     * @returns {RatingDocument}
     */
    formToDocument(form) {
        /** @type {RatingDocument} */
        const doc = form;
        
        // Default
        doc.owner = "";  // individual's ID

        return form;
    }
}

module.exports = Ratings;