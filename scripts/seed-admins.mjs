import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import 'dotenv/config'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

const ADMINS = [
  { username: 'superadmin', password: 'super100',  name: 'Super Administrator',       role: 'super',    category: null },
  { username: 'admin1',     password: 'admin100',  name: 'Academic Admin',             role: 'category', category: 'Academic' },
  { username: 'admin2',     password: 'admin200',  name: 'Examination Admin',          role: 'category', category: 'Examination & Results' },
  { username: 'admin3',     password: 'admin300',  name: 'Finance Admin',              role: 'category', category: 'Fee & Finance' },
  { username: 'admin4',     password: 'admin400',  name: 'Hostel Admin',               role: 'category', category: 'Hostel & Accommodation' },
  { username: 'admin5',     password: 'admin500',  name: 'Faculty Admin',              role: 'category', category: 'Faculty & Staff Conduct' },
  { username: 'admin6',     password: 'admin600',  name: 'Infrastructure Admin',       role: 'category', category: 'Infrastructure & Facilities' },
  { username: 'admin7',     password: 'admin700',  name: 'Library Admin',              role: 'category', category: 'Library' },
  { username: 'admin8',     password: 'admin800',  name: 'Transport Admin',            role: 'category', category: 'Transportation' },
  { username: 'admin9',     password: 'admin900',  name: 'Sports Admin',               role: 'category', category: 'Sports & Extracurricular' },
  { username: 'admin10',    password: 'admin1000', name: 'Scholarship Admin',          role: 'category', category: 'Scholarship' },
  { username: 'admin11',    password: 'admin1100', name: 'Canteen Admin',              role: 'category', category: 'Canteen & Food' },
  { username: 'admin12',    password: 'admin1200', name: 'IT Admin',                   role: 'category', category: 'IT & Internet' },
]

async function seed() {
  console.log('Seeding admins...')
  for (const admin of ADMINS) {
    await prisma.admin.upsert({
      where: { username: admin.username },
      update: { password: admin.password, name: admin.name, role: admin.role, category: admin.category },
      create: { username: admin.username, password: admin.password, name: admin.name, role: admin.role, category: admin.category },
    })
    console.log(`✓ ${admin.username}`)
  }
  console.log('\nAll 13 admins seeded successfully!')
  await prisma.$disconnect()
  await pool.end()
}

seed().catch(e => { console.error(e); process.exit(1) })
