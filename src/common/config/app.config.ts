import { ConfigModuleOptions } from '@nestjs/config';
import { Environment, validateEnvironmentVariables } from './env.validation';
import { z } from 'zod'


export const appConfig: ConfigModuleOptions = {
  isGlobal: true,
  validationSchema: z.object({
    NODE_ENV: z.enum([Environment.Development, Environment.Production, Environment.Test]).default(Environment.Development),
    PORT: z.number().positive().min(4).default(3000),
    DB_HOST: z.string().min(1, "Should have the DB HOST"),
    DB_PORT: z.number().positive().min(4).default(5432),
    DB_USERNAME: z.string().min(1, "Should have the DB USERNAME").default("postgres"),
    DB_PASSWORD: z.string().min(1, "Should have the DB PASSWORD"),
    DB_DATABASE: z.string().min(1, "Should have the DB DATABASE").default('postgres'),
    DB_SSL: z.boolean().default(false),
    DB_POOL_SIZE: z.number().positive().max(2).default(10),
    JWT_SECRET: z.string().min(1),
    JWT_EXPIRATION: z.string().default('1h'),
    JWT_EXPIRATION_SECONDS: z.number().default(3600),
  }),
  validationOptions: {
    abortEarly: true,
  },
  validate: validateEnvironmentVariables,
  envFilePath: ['.env']
}
