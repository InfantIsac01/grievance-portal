import { prisma } from '../../../lib/prisma'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const table = searchParams.get('table')
    
    if (table === 'students') {
      const data = await prisma.student.findMany()
      // Remove passwords before sending to client
      const safeData = data.map(({ password, ...rest }) => rest)
      return Response.json({ success: true, data: safeData, count: safeData.length })
    }
    
    if (table === 'grievances') {
      const data = await prisma.grievance.findMany()
      const parsedData = data.map(g => ({
        ...g,
        attachments: JSON.parse(g.attachments || '[]'),
        status_history: JSON.parse(g.status_history || '[]')
      }))
      return Response.json({ success: true, data: parsedData, count: parsedData.length })
    }
    
    return Response.json({ success: false, message: 'Invalid table' }, { status: 400 })
  } catch (e) {
    return Response.json({ success: false, message: e.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { table, action, id, record } = body

    if (action === 'delete_all') {
      if (table === 'students') await prisma.student.deleteMany()
      if (table === 'grievances') await prisma.grievance.deleteMany()
      return Response.json({ success: true })
    }

    if (!id) return Response.json({ success: false, message: 'ID required' }, { status: 400 })

    if (action === 'delete') {
      if (table === 'students') {
        // Delete related grievances first
        await prisma.grievance.deleteMany({ where: { studentId: id } })
        await prisma.student.delete({ where: { id } })
      }
      if (table === 'grievances') await prisma.grievance.delete({ where: { id } })
      return Response.json({ success: true })
    }

    if (action === 'update') {
      if (table === 'students') {
        const updated = await prisma.student.update({
          where: { id },
          data: record
        })
        const { password: _, ...safe } = updated
        return Response.json({ success: true, record: safe })
      }
      if (table === 'grievances') {
        // If attachments or status history are sent as objects, we need to stringify them
        const dataToUpdate = { ...record }
        if (dataToUpdate.attachments && typeof dataToUpdate.attachments !== 'string') {
          dataToUpdate.attachments = JSON.stringify(dataToUpdate.attachments)
        }
        if (dataToUpdate.status_history && typeof dataToUpdate.status_history !== 'string') {
          dataToUpdate.status_history = JSON.stringify(dataToUpdate.status_history)
        }
        
        const updated = await prisma.grievance.update({
          where: { id },
          data: dataToUpdate
        })
        
        return Response.json({ success: true, record: {
          ...updated,
          attachments: JSON.parse(updated.attachments || '[]'),
          status_history: JSON.parse(updated.status_history || '[]')
        } })
      }
    }

    return Response.json({ success: false, message: 'Unknown action' }, { status: 400 })
  } catch (e) {
    return Response.json({ success: false, message: e.message }, { status: 500 })
  }
}
