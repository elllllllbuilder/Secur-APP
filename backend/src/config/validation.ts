import * as Joi from 'joi';

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(3333),

  API_URL: Joi.string().allow('', null),
  FRONTEND_ORIGIN: Joi.string().allow('', null),

  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRES: Joi.string().default('15m'),
  JWT_REFRESH_SECRET: Joi.string().required(),
  JWT_REFRESH_EXPIRES: Joi.string().default('30d'),

  STORAGE_DRIVER: Joi.string().valid('local', 's3').default('local'),
  UPLOAD_DIR: Joi.string().default('./uploads'),

  PAGARME_API_KEY: Joi.string().allow('', null),
  PAGARME_BASE_URL: Joi.string().default('https://api.pagar.me/1'),

  DATABASE_URL: Joi.string().required(),
});
