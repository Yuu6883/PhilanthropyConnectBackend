const Joi = require("joi");
const ZIP = require("../../modules/us-zip");
const validZIP = ZIP.map.keys();

const schema = Joi.object({
    // TODO:
});

class EventSchema {
    
    /** 
     * @param {} form
     * @return {}
     */
    static from(form) {
        return form;
    }

    /** @param {} form */
    static validate(form) {
        return schema.validate(form);
    }
}

module.exports = EventSchema;