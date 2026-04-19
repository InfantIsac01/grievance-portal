import { prisma } from '../../../lib/prisma'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

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

      // Send Email Notification
      if (current.studentEmail) {
        try {
          await resend.emails.send({
            from: 'HIT Grievance Portal <onboarding@resend.dev>',
            to: current.studentEmail,
            subject: `Update on your Grievance: ${current.title}`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
                <h2 style="color: #0f172a;">Grievance Status Update</h2>
                <p>Hello,</p>
                <p>Your grievance (ID: <strong>${current.id}</strong>) has been updated.</p>
                <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <p style="margin: 0; font-size: 14px; color: #64748b; text-transform: uppercase; font-weight: bold;">New Status</p>
                  <p style="margin: 5px 0 0; font-size: 18px; color: #2563eb; font-weight: bold;">${body.status}</p>
                </div>
                <p><strong>Administrator's Note:</strong></p>
                <p style="background: #fff; border-left: 4px solid #e2e8f0; padding: 10px 15px; font-style: italic;">${body.note || 'No additional notes provided.'}</p>
                <p style="margin-top: 30px; font-size: 12px; color: #94a3b8;">This is an automated notification from the HIT Grievance Portal. Please do not reply to this email.</p>
              </div>
            `
          })
        } catch (emailErr) {
          console.error('Failed to send email:', emailErr)
        }
      }

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
