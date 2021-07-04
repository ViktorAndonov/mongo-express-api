const Joi = require('joi');

// Register Validation
const registerValidation = data => {
    const schema = Joi.object({
        name: Joi.string().min(6).required(),
        email: Joi.string().min(6).required().email(),
        password: Joi.string().min(6).required()
    });
    // .options({
    //     abortEarly: false
    // });
    return schema.validate(data);
}

// Update Validation
const updateValidation = data => {
    const schema = Joi.object({
        name: Joi.string().min(6),
        email: Joi.string().min(6).email(),
        password: Joi.string().min(6)
    });
    
    return schema.validate(data);
}

// Login Validation
const loginValidation = data => {
    const schema = Joi.object({
        email: Joi.string().min(6).required().email(),
        password: Joi.string().min(6).required()
    });
    return schema.validate(data);
}

module.exports.registerValidation = registerValidation;
module.exports.updateValidation = updateValidation;
module.exports.loginValidation = loginValidation;