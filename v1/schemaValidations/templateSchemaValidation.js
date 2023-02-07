const Joi = require('@hapi/joi');

const schema = {
    login: Joi.object({
        email: Joi.string()
            .email()
            .required()
            .messages({
                "string.email": "Invalid email",
                "any.required": "Email is required"
            }),
        password: Joi.string()
            .min(3)
            .max(150)
            .required()
            .messages({
                "any.required": "password is required"
            }),
        device_id: Joi.string()
            .optional()
            .allow('')
            .allow(null),
        ip: Joi.string()
            .optional()
            .allow('')
            .allow(null),
        role: Joi.string()
            .optional()
            .allow('')
            .allow(null)

    })
}
module.exports = { schema };