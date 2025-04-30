import Joi from "joi";

export const schemaSignup = Joi.object({
  username: Joi.string()
    .min(5)
    .max(30)
    .required()
    .pattern(new RegExp("^[a-zA-Z][a-zA-Z0-9 ]*$")), // Fixed regex
  email: Joi.string().min(6).max(60).required().email(),
  password: Joi.string()
    .min(6)
    .max(60)
    .required()
    .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$")), // Fixed regex
});

export const schemaLogin = Joi.object({
  email: Joi.string().min(6).max(60).required().email(),
  password: Joi.string()
    .min(6)
    .max(60)
    .required()
    .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$")), // Fixed regex
});

export const schemaAcceptToken = Joi.object({
  email: Joi.string().min(6).max(60).required().email(),
  verificationToken: Joi.string().required(),
});
