import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const config = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  MONGO_URI: process.env.MONGO_URI,
  
  JWT_SECRET: process.env.JWT_SECRET || '5570d9d3751e6be5126f5858a2a509c8f752560de4a12849ea558de251b7c5b7342968291f7988302dce7a626b9eed947164ed23445c9447e9e7636778d9097b',
  JWT_EXPIRE: process.env.JWT_EXPIRE || '30d',
  
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@rebelfitness.lk',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'admin1234',
  
  API_PREFIX: '/api/v1',
  
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*'
};

const requiredEnvVars = ['MONGO_URI'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

if (config.NODE_ENV === 'development') {
  console.log('Environment:', {
    NODE_ENV: config.NODE_ENV,
    PORT: config.PORT,
    MONGO_URI: config.MONGO_URI ? 'Configured' : 'Not configured',
  });
}

export const {
  PORT,
  NODE_ENV,
  MONGO_URI,
  JWT_SECRET,
  JWT_EXPIRE,
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  API_PREFIX,
  CORS_ORIGIN
} = config;

export default config;