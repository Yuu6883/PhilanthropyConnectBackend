const Joi = require("joi");
const ZIP = require("../../modules/us-zip");

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
    )
});

class IndividualSchema {
    
    /** 
     * @param {IndividualForm} form
     * @return {IndividualDocument}
     */
    static from(form) {
        return form;
    }

    /** @param {IndividualForm} form */
    static validate(form) {
        return schema.validate(form);
    }
}

module.exports = IndividualSchema;