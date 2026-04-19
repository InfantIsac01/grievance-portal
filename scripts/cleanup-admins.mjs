import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import 'dotenv/config'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

const OLD = ['academic_admin','exam_admin','fee_admin','hostel_admin','faculty_admin','infra_admin','library_admin','transport_admin','sports_admin','scholarship_admin','canteen_admin','it_admin']

async function run() {
  for (const u of OLD) {
    try { await prisma.admin.delete({ where: { username: u } }); console.log('deleted', u) } catch { console.log('not found:', u) }
  }
  console.log('Cleanup done')
  await prisma.$disconnect()
  await pool.end()
}
run().catch(e => { console.error(e); process.exit(1) })
