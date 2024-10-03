import * as dotenv from 'dotenv';
dotenv.config();

const { JWT_SECRET, JWT_LIFETIME } = process.env;
export { JWT_SECRET, JWT_LIFETIME };
