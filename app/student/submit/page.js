'use client'
import { useState, useEffect, useRef } from 'react'
const CATEGORIES = [
  { name: 'Academic', icon: '📚', desc: 'Curriculum, attendance, marks' },
  { name: 'Examination & Results', icon: '📝', desc: 'Exams, results, revaluation' },
  { name: 'Fee & Finance', icon: '💳', desc: 'Fee issues, receipts, refunds' },
  { name: 'Hostel & Accommodation', icon: '🏠', desc: 'Room, food, facilities' },
  { name: 'Faculty & Staff Conduct', icon: '👨‍🏫', desc: 'Behaviour, teaching quality' },
  { name: 'Infrastructure & Facilities', icon: '🏛️', desc: 'Buildings, labs, equipment' },
  { name: 'Library', icon: '📖', desc: 'Books, resources, access' },
  { name: 'Transportation', icon: '🚌', desc: 'Bus routes, timing, safety' },
  { name: 'Sports & Extracurricular', icon: '⚽', desc: 'Clubs, events, facilities' },
  { name: 'Scholarship', icon: '🎓', desc: 'Scholarship issues, delays' },
  { name: 'Canteen & Food', icon: '🍽️', desc: 'Food quality, hygiene, pricing' },
  { name: 'IT & Internet', icon: '💻', desc: 'WiFi, computers, software' },
  { name: 'Other', icon: '📌', desc: 'Any other concern' },
]
function genId() { return 'GR-' + Math.random().toString(36).substr(2, 8).toUpperCase() }
export default function SubmitPage() {
  const [step, setStep] = useState(1)
  const [category, setCategory] = useState('')
  const [form, setForm] = useState({ title: '', description: '' })
  const [files, setFiles] = useState([])
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [student, setStudent] = useState(null)
  const fileRef = useRef()
  useEffect(() => { const s = sessionStorage.getItem('hit_student'); if (s) setStudent(JSON.parse(s)) }, [])
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))
  const handleFiles = newFiles => {
    const arr = Array.from(newFiles).filter(f => f.size < 50 * 1024 * 1024)
    setFiles(prev => [...prev, ...arr.map(f => ({ file: f, preview: f.type.startsWith('image/') ? URL.createObjectURL(f) : null, name: f.name, type: f.type, size: f.size }))])
  }
  const removeFile = i => setFiles(prev => prev.filter((_, idx) => idx !== i))
  const handleDrop = e => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files) }
  const submit = async () => {
    if (!form.title.trim() || form.title.trim().length < 5) { setError('Title must be at least 5 characters.'); return }
    if (!form.description.trim() || form.description.trim().length < 20) { setError('Description must be at least 20 characters.'); return }
    setError(''); setLoading(true)
    try {
      let uploadedFiles = []
      if (files.length > 0) {
        const fd = new FormData()
        files.forEach(f => fd.append('files', f.file))
        const upRes = await fetch('/api/upload', { method: 'POST', body: fd }).then(r => r.json())
        if (upRes.success) uploadedFiles = upRes.files
      }
      const existing = await fetch('/api/grievances').then(r => r.json()).catch(() => [])
      const aiRes = await fetch('/api/analyze', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: form.title, description: form.description, category, existing }) }).then(r => r.json())
      const ai = aiRes.success ? aiRes.result : { urgency: 3, urgency_reason: 'Manually assessed', is_duplicate: false, duplicate_group: null, summary: form.title, ack_message: 'Your grievance has been received and will be reviewed shortly.' }
      const grievance = { id: genId(), studentId: student.id, studentName: student.name, studentEmail: student.email, studentDept: student.department, rollNumber: student.rollNumber, year: student.year, category, title: form.title, description: form.description, attachments: uploadedFiles, urgency: ai.urgency, urgency_reason: ai.urgency_reason, is_duplicate: ai.is_duplicate, duplicate_group: ai.duplicate_group, summary: ai.summary, status: 'Received', status_history: [{ status: 'Received', note: ai.ack_message, timestamp: new Date().toISOString() }], createdAt: new Date().toISOString() }
      await fetch('/api/grievances', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'add', grievance }) })
      setResult(grievance)
    } catch { setError('Something went wrong. Please try again.') }
    setLoading(false)
  }
  if (result) return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '36px 24px' }}>
      <div className="fade-up" style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{ width: 72, height: 72, background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)', borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, margin: '0 auto 16px', border: '1px solid #86efac' }}>✅</div>
        <h1 style={{ fontFamily: 'Plus Jakarta Sans', fontSize: 26, fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>Grievance Submitted!</h1>
        <p style={{ fontSize: 14, color: '#64748b' }}>Your grievance has been received and analyzed by AI.</p>
      </div>
      <div className="fade-up-1" style={{ background: 'linear-gradient(135deg, #020817, #1e1b4b)', borderRadius: 18, padding: 28, textAlign: 'center', marginBottom: 20 }}>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Your Tracking ID</p>
        <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 34, fontWeight: 700, color: '#fbbf24', letterSpacing: '0.1em', marginBottom: 12 }}>{result.id}</p>
        <button onClick={() => navigator.clipboard?.writeText(result.id)} style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', color: '#fbbf24', padding: '6px 16px', borderRadius: 8, fontSize: 12, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans' }}>Copy ID</button>
      </div>
      <div className="card fade-up-2" style={{ marginBottom: 16 }}>
        <p style={{ fontWeight: 700, fontSize: 14, color: '#0f172a', marginBottom: 16 }}>🤖 AI Analysis</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[['Urgency Score', `${result.urgency}/5 — ${['','Minimal','Low','Medium','High','Critical'][result.urgency]}`], ['Duplicate', result.is_duplicate ? `Yes — "${result.duplicate_group}"` : 'No — Unique'], ['Summary', result.summary], ['Acknowledgement', result.status_history[0].note]].map(([l, v], i) => (
            <div key={l} style={{ gridColumn: i >= 2 ? 'span 2' : 'auto', background: '#f8fafc', borderRadius: 10, padding: '10px 14px', border: '1px solid #f1f5f9' }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{l}</p>
              <p style={{ fontSize: 13, fontWeight: 500, color: '#334155', lineHeight: 1.5 }}>{v}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="fade-up-3" style={{ display: 'flex', gap: 12 }}>
        <button onClick={() => { setResult(null); setStep(1); setCategory(''); setForm({ title: '', description: '' }); setFiles([]) }} className="btn btn-white" style={{ flex: 1 }}>Submit Another</button>
        <a href="/student/grievances" className="btn btn-blue" style={{ flex: 1, textDecoration: 'none' }}>View My Grievances →</a>
      </div>
    </div>
  )
  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '36px 24px' }}>
      <div className="fade-up" style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600, marginBottom: 4 }}>New Grievance</p>
        <h1 style={{ fontFamily: 'Plus Jakarta Sans', fontSize: 28, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px' }}>Submit a Grievance</h1>
      </div>
      <div className="fade-up-1" style={{ display: 'flex', alignItems: 'center', marginBottom: 32 }}>
        {[{ n: 1, label: 'Select Category' }, { n: 2, label: 'Describe Issue' }, { n: 3, label: 'Review & Submit' }].map((s, i) => (
          <div key={s.n} style={{ display: 'flex', alignItems: 'center', flex: i < 2 ? 1 : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              <div className={`step-dot ${step > s.n ? 'done' : step === s.n ? 'active' : 'pending'}`}>{step > s.n ? '✓' : s.n}</div>
              <span style={{ fontSize: 13, fontWeight: 600, color: step >= s.n ? '#0f172a' : '#94a3b8', whiteSpace: 'nowrap' }}>{s.label}</span>
            </div>
            {i < 2 && <div style={{ flex: 1, height: 2, background: step > s.n + 1 ? '#2563eb' : '#e2e8f0', margin: '0 12px', borderRadius: 2, transition: 'all 0.3s' }} />}
          </div>
        ))}
      </div>
      {step === 1 && (
        <div className="fade-in">
          <p style={{ fontSize: 14, color: '#64748b', marginBottom: 20 }}>What is your grievance about?</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
            {CATEGORIES.map(c => (
              <div key={c.name} className={`cat-card ${category === c.name ? 'selected' : ''}`} onClick={() => setCategory(c.name)} style={{ padding: 18 }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{c.icon}</div>
                <p style={{ fontWeight: 700, fontSize: 13, color: '#0f172a', marginBottom: 3 }}>{c.name}</p>
                <p style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.4 }}>{c.desc}</p>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={() => { if (!category) { alert('Please select a category.'); return } setStep(2) }} className="btn btn-blue" style={{ padding: '12px 28px' }}>Continue →</button>
          </div>
        </div>
      )}
      {step === 2 && (
        <div className="fade-in">
          <div className="card" style={{ padding: 28, marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, padding: '10px 14px', background: '#eff6ff', borderRadius: 10, border: '1px solid #bfdbfe' }}>
              <span style={{ fontSize: 20 }}>{CATEGORIES.find(c => c.name === category)?.icon}</span>
              <div>
                <p style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>Selected category</p>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#1d4ed8' }}>{category}</p>
              </div>
              <button onClick={() => setStep(1)} style={{ marginLeft: 'auto', fontSize: 12, color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans', fontWeight: 600 }}>Change</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <label className="label">Grievance Title *</label>
                <input value={form.title} onChange={set('title')} placeholder="Brief title (min 5 characters)" className="input" />
              </div>
              <div>
                <label className="label">Detailed Description *</label>
                <textarea value={form.description} onChange={set('description')} rows={6} placeholder="Describe in detail — include dates, names, expected resolution… (min 20 characters)" className="input" style={{ resize: 'vertical', lineHeight: 1.6 }} />
                <p style={{ fontSize: 11, color: form.description.length >= 20 ? '#15803d' : '#94a3b8', marginTop: 4, textAlign: 'right' }}>{form.description.length} chars {form.description.length >= 20 ? '✓' : '(min 20)'}</p>
              </div>
            </div>
          </div>
          <div className="card" style={{ padding: 24, marginBottom: 20 }}>
            <label className="label" style={{ marginBottom: 12 }}>Attachments (optional)</label>
            <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 14 }}>Upload images, videos, audio or PDF documents. Max 50MB per file.</p>
            <div className={`upload-zone ${dragging ? 'drag' : ''}`} onClick={() => fileRef.current.click()} onDragOver={e => { e.preventDefault(); setDragging(true) }} onDragLeave={() => setDragging(false)} onDrop={handleDrop}>
              <input ref={fileRef} type="file" multiple accept="image/*,video/*,audio/*,.pdf,.doc,.docx" style={{ display: 'none' }} onChange={e => handleFiles(e.target.files)} />
              <div style={{ fontSize: 36, marginBottom: 10 }}>📎</div>
              <p style={{ fontWeight: 600, fontSize: 14, color: '#334155', marginBottom: 4 }}>Drop files here or click to browse</p>
              <p style={{ fontSize: 12, color: '#94a3b8' }}>Images · Videos · Audio · PDFs · Documents · Max 50MB each</p>
            </div>
            {files.length > 0 && (
              <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {files.map((f, i) => (
                  <div key={i} className="file-preview">
                    {f.preview ? <img src={f.preview} alt="" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }} /> : <div style={{ width: 40, height: 40, background: '#f1f5f9', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{f.type.startsWith('video/') ? '🎥' : f.type.startsWith('audio/') ? '🎵' : '📄'}</div>}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 500, color: '#334155', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</p>
                      <p style={{ fontSize: 11, color: '#94a3b8' }}>{(f.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <button onClick={() => removeFile(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontSize: 16, padding: '4px', flexShrink: 0 }}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>
          {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#dc2626', marginBottom: 16 }}>⚠️ {error}</div>}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'space-between' }}>
            <button onClick={() => setStep(1)} className="btn btn-white">← Back</button>
            <button onClick={() => { if (!form.title.trim() || form.title.trim().length < 5) { setError('Title must be at least 5 characters.'); return } if (!form.description.trim() || form.description.trim().length < 20) { setError('Description must be at least 20 characters.'); return } setError(''); setStep(3) }} className="btn btn-blue" style={{ padding: '12px 28px' }}>Review →</button>
          </div>
        </div>
      )}
      {step === 3 && (
        <div className="fade-in">
          <div className="card" style={{ padding: 28, marginBottom: 20 }}>
            <p style={{ fontWeight: 700, fontSize: 15, color: '#0f172a', marginBottom: 20 }}>Review your grievance</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[['Category', `${CATEGORIES.find(c => c.name === category)?.icon} ${category}`], ['Title', form.title], ['Description', form.description]].map(([l, v]) => (
                <div key={l} style={{ background: '#f8fafc', borderRadius: 10, padding: '12px 16px', border: '1px solid #f1f5f9' }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{l}</p>
                  <p style={{ fontSize: 14, fontWeight: 500, color: '#334155', lineHeight: 1.6 }}>{v}</p>
                </div>
              ))}
              {files.length > 0 && (
                <div style={{ background: '#f8fafc', borderRadius: 10, padding: '12px 16px', border: '1px solid #f1f5f9' }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Attachments ({files.length})</p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {files.map((f, i) => <div key={i} style={{ fontSize: 12, background: '#eff6ff', padding: '4px 10px', borderRadius: 6, color: '#475569' }}>{f.type.startsWith('image/') ? '🖼️' : f.type.startsWith('video/') ? '🎥' : f.type.startsWith('audio/') ? '🎵' : '📄'} {f.name}</div>)}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 12, padding: '14px 18px', marginBottom: 20, display: 'flex', gap: 10 }}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>🤖</span>
            <div>
              <p style={{ fontWeight: 600, fontSize: 13, color: '#92400e', marginBottom: 2 }}>AI Analysis will run on submission</p>
              <p style={{ fontSize: 12, color: '#b45309' }}>Your grievance will be automatically scored for urgency and checked for duplicates using Groq AI.</p>
            </div>
          </div>
          {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#dc2626', marginBottom: 16 }}>⚠️ {error}</div>}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'space-between' }}>
            <button onClick={() => setStep(2)} className="btn btn-white">← Back</button>
            <button onClick={submit} disabled={loading} className="btn btn-blue" style={{ padding: '12px 32px', fontSize: 15, minWidth: 200 }}>
              {loading ? <><span className="spin" style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block' }} />Submitting & Analyzing…</> : '🚀 Submit Grievance'}
            </button>
          </div>
          {loading && <p style={{ textAlign: 'center', fontSize: 12, color: '#94a3b8', marginTop: 10 }}>Uploading files · Running AI analysis · Saving grievance…</p>}
        </div>
      )}
    </div>
  )
}
