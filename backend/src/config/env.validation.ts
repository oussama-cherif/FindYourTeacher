import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  DATABASE_URL: Joi.string().required(),
  JWT_ACCESS_SECRET: Joi.string().min(32).required(),
  JWT_REFRESH_SECRET: Joi.string().min(32).required(),
  JWT_ACCESS_EXPIRATION: Joi.string().default('15m'),
  JWT_REFRESH_EXPIRATION: Joi.string().default('7d'),
  PORT: Joi.number().default(3001),
  FRONTEND_URL: Joi.string().required(),
  FLOUCI_APP_TOKEN: Joi.string().required(),
  FLOUCI_APP_SECRET: Joi.string().required(),
  FLOUCI_BASE_URL: Joi.string().default('https://developers.flouci.com'),
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
});
