const validate = require("validate.js");
const ZIP = require("../../modules/us-zip");

validate.validators.stringArray = arrayItems => Array.isArray(arrayItems) ? 
    (arrayItems.every(s => typeof s == "string") ? null : "Not all items are strings") : "Not Array";

const constraints = {
    firstname: {
        type: "string",
        presence: true,
        length: {
            minimum: 1,
            maximum: 100
        }
    },
    lastname: {
        type: "string",
        presence: true,
        length: {
            minimum: 1,
            maximum: 100
        }
    },
    cause: {
        type: "array",
        presence: true,
        stringArray: true
    }
}

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
        try {
            return validate(form, constraints);
        } catch (e) { return e; }
    }
}

module.exports = IndividualSchema;