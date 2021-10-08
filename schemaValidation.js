const Basejoi = require("joi");
const sanitizeHTML = require("sanitize-html");

const extension = (joi) => ({
    type: "string",
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHTML(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean !== value) return helpers.error('string.escapeHTML', { value })
                return clean;
            }
        }
    }
});
//so what here i am doing is defining an extension on joi.string called escapeHTML, so the idea is that then i will be able to do .escapeHTML
//on my string properties.

const joi = Basejoi.extend(extension);
//now joi equals base version of joi extended with this new extension, now that gives me option to use escapeHTml method on my joi.string

const campgroundSchema = joi.object({
    title: joi.string()
        .min(3)
        .max(60)
        .required()
        .escapeHTML(),
    location: joi.string()
        .min(3)
        .max(30)
        .required()
        .escapeHTML(),
    price: joi.number()
        .min(0)
        .required(),
    // image: joi.string()
    //     .required(),
    description: joi.string()
        .min(10)
        .optional()
        .escapeHTML(),
    deleteImages:joi.array()
});

const reviewSchema = joi.object({
    rating: joi.number()
        .required()
        .min(1)
        .max(5),
    body: joi.string()
        .min(4)
        .required()
        .escapeHTML(),
});
    
module.exports.campgroundSchema = campgroundSchema;
module.exports.reviewSchema = reviewSchema;