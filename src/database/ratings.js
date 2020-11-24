const Template = require("./template");
const Joi = require("joi");

/** @type {Joi.ObjectSchema<RatingForm>} */
const schema = Joi.object({
    stars: Joi.number()
        .min(1)
        .max(5)
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
     * @param {RatingForm}
     * @returns {RatingDocument}
     */
    formToDocument(form) {
        /** @type {RatingDocument} */
        const doc = form;
        
        // Default
        doc.owner = "";  // individual's ID

        return form;
    }

    delete(id) {
        if (this.app.isProd) this.app.logger.onError("Should not attempt to delete orgnization document in production");
        else return super.delete(id);
    }
}

module.exports = Ratings;