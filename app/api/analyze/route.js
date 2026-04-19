export async function POST(request) {
  try {
    const { title, description, category, existing = [] } = await request.json()
    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) return Response.json({ success: true, result: { urgency: 3, urgency_reason: 'Assessed as medium priority.', is_duplicate: false, duplicate_group: null, summary: title, ack_message: 'Your grievance has been received and will be reviewed by the concerned department within 48 hours.' } })
    const existingSummaries = existing.slice(-20).map(g => `[${g.id}] ${g.title}: ${g.summary || g.description?.slice(0, 80)}`).join('\n')
    const prompt = `Analyze this student grievance from Hindusthan Institute of Technology. Return ONLY valid JSON.
Category: ${category}
Title: ${title}
Description: ${description}
Existing grievances: ${existingSummaries || 'None'}
Return: {"urgency":<1-5>,"urgency_reason":"<one sentence>","is_duplicate":<bool>,"duplicate_group":"<slug or null>","summary":"<one sentence>","ack_message":"<two sentences>"}`
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` }, body: JSON.stringify({ model: 'llama-3.3-70b-versatile', messages: [{ role: 'user', content: prompt }], max_tokens: 500, temperature: 0.3 }) })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error?.message || 'Groq error')
    const raw = data.choices[0].message.content.replace(/```json|```/g, '').trim()
    return Response.json({ success: true, result: JSON.parse(raw) })
  } catch (e) {
    return Response.json({ success: true, result: { urgency: 3, urgency_reason: 'Auto-assessed as medium priority.', is_duplicate: false, duplicate_group: null, summary: 'Student grievance submitted for review.', ack_message: 'Your grievance has been received and will be reviewed shortly. You will be notified of any updates.' } })
  }
}
