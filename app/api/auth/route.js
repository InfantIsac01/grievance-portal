import { prisma } from '../../../lib/prisma'

function genId() { return 'STU-' + Math.random().toString(36).substring(2, 10).toUpperCase() }

export async function POST(request) {
  try {
    const body = await request.json()
    
    if (body.action === 'register') {
      if (!body.email?.endsWith('@hit.edu.in')) {
        return Response.json({ success: false, message: 'Only @hit.edu.in emails are allowed.' })
      }
      
      const existing = await prisma.student.findUnique({
        where: { email: body.email }
      })
      
      if (existing) {
        return Response.json({ success: false, message: 'An account with this email already exists.' })
      }
      
      await prisma.student.create({
        data: {
          id: genId(),
          name: body.name,
          email: body.email,
          password: body.password,
          department: body.department,
          year: body.year,
          rollNumber: body.rollNumber
        }
      })
      
      return Response.json({ success: true })
    }
    
    if (body.action === 'login') {
      if (!body.email?.endsWith('@hit.edu.in')) {
        return Response.json({ success: false, message: 'Only @hit.edu.in emails are allowed.' })
      }
      
      const student = await prisma.student.findUnique({
        where: { email: body.email }
      })
      
      if (!student || student.password !== body.password) {
        return Response.json({ success: false, message: 'Invalid email or password.' })
      }
      
      const { password: _, ...safe } = student
      return Response.json({ success: true, student: safe })
    }
    
    if (body.action === 'admin_login') {
      if (!body.username || !body.password) {
        return Response.json({ success: false, message: 'Please fill in all fields.' })
      }
      const admin = await prisma.admin.findUnique({ where: { username: body.username } })
      if (!admin || admin.password !== body.password) {
        return Response.json({ success: false, message: 'Invalid credentials. Please check your username and password.' })
      }
      const { password: _, ...safeAdmin } = admin
      return Response.json({ success: true, admin: safeAdmin })
    }

    return Response.json({ success: false, message: 'Unknown action.' }, { status: 400 })
  } catch (err) { 
    console.error(err)
    return Response.json({ success: false, message: 'Server error.' }, { status: 500 }) 
  }
}
