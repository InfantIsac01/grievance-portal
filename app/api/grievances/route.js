import { prisma } from '../../../lib/prisma'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')
    
    let grievances = []
    if (studentId) {
      grievances = await prisma.grievance.findMany({
        where: { studentId },
        orderBy: { createdAt: 'desc' }
      })
    } else {
      grievances = await prisma.grievance.findMany({
        orderBy: { createdAt: 'desc' }
      })
    }
    
    // Parse the JSON string fields back to objects for the frontend
    const parsed = grievances.map(g => ({
      ...g,
      attachments: JSON.parse(g.attachments || '[]'),
      status_history: JSON.parse(g.status_history || '[]')
    }))
    
    return Response.json(parsed)
  } catch (err) { 
    console.error(err)
    return Response.json([]) 
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    
    if (body.action === 'add') {
      const g = body.grievance
      await prisma.grievance.create({
        data: {
          id: g.id,
          studentId: g.studentId,
          studentName: g.studentName,
          studentEmail: g.studentEmail,
          studentDept: g.studentDept,
          rollNumber: g.rollNumber,
          year: g.year,
          category: g.category,
          title: g.title,
          description: g.description,
          attachments: JSON.stringify(g.attachments || []),
          urgency: g.urgency,
          urgency_reason: g.urgency_reason,
          is_duplicate: g.is_duplicate,
          duplicate_group: g.duplicate_group,
          summary: g.summary,
          status: g.status,
          status_history: JSON.stringify(g.status_history || [])
        }
      })
      return Response.json({ success: true })
    }
    
    if (body.action === 'update') {
      const current = await prisma.grievance.findUnique({ where: { id: body.id } })
      if (!current) return Response.json({ success: false, message: 'Not found' })
      
      const history = JSON.parse(current.status_history || '[]')
      history.push({ 
        status: body.status, 
        note: body.note || `Status updated to ${body.status}.`, 
        timestamp: new Date().toISOString() 
      })
      
      await prisma.grievance.update({
        where: { id: body.id },
        data: {
          status: body.status,
          status_history: JSON.stringify(history)
        }
      })
      return Response.json({ success: true })
    }
    
    if (body.action === 'delete') {
      await prisma.grievance.delete({ where: { id: body.id } })
      return Response.json({ success: true })
    }
    
    return Response.json({ success: false }, { status: 400 })
  } catch (err) { 
    console.error(err)
    return Response.json({ success: false }, { status: 500 }) 
  }
}
