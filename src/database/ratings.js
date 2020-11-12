const Template = require("./template");
const Joi = require("joi");

// TODO: define template types in globals.d.ts and object schema
/** @type {Joi.ObjectSchema<any>} */
const schema = Joi.object({
    // :)
});

/**
 * TODO: define template types in globals.d.ts
 * @extends {Template<any, any>}
 */
class Organizations extends Template {

    /**
     * Organization schema
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
        // TODO: transform the form (add location etc)
        return form;
    }
}

module.exports = Organizations;