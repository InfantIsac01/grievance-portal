import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

// Get connection string from environment
const connectionString = process.env.DATABASE_URL

// Setup pg pool
const pool = new Pool({ connectionString })

// Setup adapter
const adapter = new PrismaPg(pool)

// Prevent multiple instances of Prisma Client in development
const globalForPrisma = globalThis

export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
