import 'dotenv/config';
import * as Joi from 'joi';

interface EnvironmentVariables {
  NODE_ENV: 'development' | 'production' | 'test' | 'provision';
  PORT_DEVELOPMENT: number;
  PORT_PRODUCTION: number;
  AUTH_MICROSERVICE_HOST: string;
  AUTH_MICROSERVICE_PORT: number;
  AUTH_SERVICE: string;
  QR_CODE_MICROSERVICE_HOST: string;
  QR_CODE_MICROSERVICE_PORT: number;
  QR_CODE_SERVICE: string;
  READING_MICROSERVICE_HOST: string;
  READING_MICROSERVICE_PORT: number;
  READING_SERVICE: string;
  KAFKA_BROKER_URL: string;
  AUTH_KAFKA_CLIENT_ID: string;
  AUTH_KAFKA_GROUP_ID: string;
  AUTH_KAFKA_CLIENT: string;
  QRCODE_KAFKA_CLIENT_ID: string;
  QRCODE_KAFKA_GROUP_ID: string;
  QRCODE_KAFKA_CLIENT: string;
  READING_KAFKA_CLIENT_ID: string;
  READING_KAFKA_GROUP_ID: string;
  READING_KAFKA_CLIENT: string;
  QRCODE_SCANNER_KAFKA_GROUP_ID: string;
}

const envVarsSchema: Joi.ObjectSchema<EnvironmentVariables> = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test', 'provision')
    .default('development'),
  PORT_DEVELOPMENT: Joi.number(),
  PORT_PRODUCTION: Joi.number(),
  AUTH_MICROSERVICE_HOST: Joi.string(),
  AUTH_MICROSERVICE_PORT: Joi.number(),
  AUTH_SERVICE: Joi.string(),
  QR_CODE_MICROSERVICE_HOST: Joi.string(),
  QR_CODE_MICROSERVICE_PORT: Joi.number(),
  QR_CODE_SERVICE: Joi.string(),
  READING_MICROSERVICE_HOST: Joi.string(),
  READING_MICROSERVICE_PORT: Joi.number(),
  READING_SERVICE: Joi.string(),
  KAFKA_BROKER_URL: Joi.string(),
  AUTH_KAFKA_CLIENT_ID: Joi.string(),
  AUTH_KAFKA_GROUP_ID: Joi.string(),
  AUTH_KAFKA_CLIENT: Joi.string(),
  QRCODE_KAFKA_CLIENT_ID: Joi.string(),
  QRCODE_KAFKA_GROUP_ID: Joi.string(),
  QRCODE_KAFKA_CLIENT: Joi.string(),
  READING_KAFKA_CLIENT_ID: Joi.string(),
  READING_KAFKA_GROUP_ID: Joi.string(),
  READING_KAFKA_CLIENT: Joi.string(),
  QRCODE_SCANNER_KAFKA_GROUP_ID: Joi.string(),
}).unknown();

const { error, value: envVars } = envVarsSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

export const environments = {
  NODE_ENV: envVars.NODE_ENV,
  PORT:
    envVars.NODE_ENV === 'production'
      ? envVars.PORT_PRODUCTION
      : envVars.PORT_DEVELOPMENT,
  AUTH_MICROSERVICE_HOST: envVars.AUTH_MICROSERVICE_HOST,
  AUTH_MICROSERVICE_PORT: envVars.AUTH_MICROSERVICE_PORT,
  AUTH_SERVICE: envVars.AUTH_SERVICE,
  QR_CODE_MICROSERVICE_HOST: envVars.QR_CODE_MICROSERVICE_HOST,
  QR_CODE_MICROSERVICE_PORT: envVars.QR_CODE_MICROSERVICE_PORT,
  QR_CODE_SERVICE: envVars.QR_CODE_SERVICE,
  READING_MICROSERVICE_HOST: envVars.READING_MICROSERVICE_HOST,
  READING_MICROSERVICE_PORT: envVars.READING_MICROSERVICE_PORT,
  READING_SERVICE: envVars.READING_SERVICE,
  KAFKA_BROKER_URL: envVars.KAFKA_BROKER_URL,
  AUTH_KAFKA_CLIENT_ID: envVars.AUTH_KAFKA_CLIENT_ID,
  AUTH_KAFKA_GROUP_ID: envVars.AUTH_KAFKA_GROUP_ID,
  AUTH_KAFKA_CLIENT: envVars.AUTH_KAFKA_CLIENT,
  QRCODE_KAFKA_CLIENT_ID: envVars.QRCODE_KAFKA_CLIENT_ID,
  QRCODE_KAFKA_GROUP_ID: envVars.QRCODE_KAFKA_GROUP_ID,
  QRCODE_KAFKA_CLIENT: envVars.QRCODE_KAFKA_CLIENT,
  READING_KAFKA_CLIENT_ID: envVars.READING_KAFKA_CLIENT_ID,
  READING_KAFKA_GROUP_ID: envVars.READING_KAFKA_GROUP_ID,
  READING_KAFKA_CLIENT: envVars.READING_KAFKA_CLIENT,
  QRCODE_SCANNER_KAFKA_GROUP_ID: envVars.QRCODE_SCANNER_KAFKA_GROUP_ID,
};  