import { PrismaClient } from '@prisma/client';
import getEnvVars from '../config/env';

const env = getEnvVars();

// Initialize Prisma Client
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: env.DATABASE_URL
    }
  }
});

export default prisma; 