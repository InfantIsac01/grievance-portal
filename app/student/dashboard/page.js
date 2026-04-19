'use client'
import { useState, useEffect } from 'react'
const STATUS_CONFIG = { Received: { color: '#1d4ed8', bg: '#eff6ff' }, 'Under Review': { color: '#b45309', bg: '#fffbeb' }, 'In Progress': { color: '#7c3aed', bg: '#f5f3ff' }, Resolved: { color: '#15803d', bg: '#f0fdf4' }, Rejected: { color: '#dc2626', bg: '#fef2f2' } }
const CAT_ICONS = { 'Academic': '📚', 'Examination & Results': '📝', 'Fee & Finance': '💳', 'Hostel & Accommodation': '🏠', 'Faculty & Staff Conduct': '👨‍🏫', 'Infrastructure & Facilities': '🏛️', 'Library': '📖', 'Transportation': '🚌', 'Sports & Extracurricular': '⚽', 'Scholarship': '🎓', 'Canteen & Food': '🍽️', 'IT & Internet': '💻', 'Other': '📌' }
export default function StudentDashboard() {
  const [student, setStudent] = useState(null)
  const [grievances, setGrievances] = useState([])
  const [loading, setLoading] = useState(true)
  const [greeting, setGreeting] = useState('Good day')
  useEffect(() => {
    const s = sessionStorage.getItem('hit_student')
    if (s) setStudent(JSON.parse(s))
    const h = new Date().getHours()
    setGreeting(h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening')
  }, [])
  useEffect(() => {
    if (!student) return
    fetch(`/api/grievances?studentId=${student.id}`).then(r => r.json()).then(data => { setGrievances(data); setLoading(false) }).catch(() => setLoading(false))
  }, [student])
  const stats = [
    { label: 'Total Submitted', value: grievances.length, icon: '📋', color: '#2563eb', bg: '#eff6ff' },
    { label: 'Pending', value: grievances.filter(g => g.status === 'Received' || g.status === 'Under Review').length, icon: '⏳', color: '#b45309', bg: '#fffbeb' },
    { label: 'In Progress', value: grievances.filter(g => g.status === 'In Progress').length, icon: '⚙️', color: '#7c3aed', bg: '#f5f3ff' },
    { label: 'Resolved', value: grievances.filter(g => g.status === 'Resolved').length, icon: '✅', color: '#15803d', bg: '#f0fdf4' },
  ]
  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '36px 24px' }}>
      <div className="fade-up" style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <p style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600, marginBottom: 4 }}>{greeting} 👋</p>
            <h1 style={{ fontFamily: 'Plus Jakarta Sans', fontSize: 30, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px', marginBottom: 6 }}>{student?.name}</h1>
            <p style={{ fontSize: 14, color: '#64748b' }}>{student?.department} · {student?.year} · <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>{student?.rollNumber}</span></p>
          </div>
          <a href="/student/submit" className="btn btn-blue" style={{ textDecoration: 'none', padding: '12px 24px' }}>✦ Submit New Grievance</a>
        </div>
      </div>
      <div className="fade-up-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        {stats.map(s => (
          <div key={s.label} className="card" style={{ padding: '20px 22px', display: 'flex', gap: 14, alignItems: 'center' }}>
            <div style={{ width: 44, height: 44, background: s.bg, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{s.icon}</div>
            <div>
              <p style={{ fontFamily: 'Plus Jakarta Sans', fontSize: 26, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</p>
              <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 3 }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24 }}>
        <div className="fade-up-2">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ fontWeight: 700, fontSize: 16, color: '#0f172a' }}>Recent Grievances</h2>
            <a href="/student/grievances" style={{ fontSize: 13, color: '#2563eb', textDecoration: 'none', fontWeight: 600 }}>View all →</a>
          </div>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>{[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 80, borderRadius: 14 }} />)}</div>
          ) : grievances.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '48px 24px', border: '2px dashed #e2e8f0', background: '#fafafa' }}>
              <span style={{ fontSize: 48, display: 'block', marginBottom: 12 }}>📭</span>
              <p style={{ fontWeight: 600, fontSize: 16, color: '#334155', marginBottom: 6 }}>No grievances yet</p>
              <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 20 }}>Submit your first grievance and we'll get it resolved.</p>
              <a href="/student/submit" className="btn btn-blue" style={{ textDecoration: 'none', padding: '10px 20px' }}>Submit Grievance →</a>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {grievances.slice(0, 5).map(g => {
                const sc = STATUS_CONFIG[g.status] || STATUS_CONFIG.Received
                return (
                  <a key={g.id} href="/student/grievances" style={{ textDecoration: 'none' }}>
                    <div className="card card-hover" style={{ padding: '16px 20px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                      <div style={{ width: 40, height: 40, background: '#f1f5f9', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{CAT_ICONS[g.category] || '📌'}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#cbd5e1' }}>{g.id}</span>
                          <span className="badge" style={{ background: sc.bg, color: sc.color }}>{g.status}</span>
                          <span className={`badge badge-p${g.urgency}`}>P{g.urgency}</span>
                        </div>
                        <p style={{ fontWeight: 600, fontSize: 14, color: '#0f172a', marginBottom: 3 }}>{g.title}</p>
                        <p style={{ fontSize: 12, color: '#94a3b8' }}>{g.category} · {new Date(g.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      </div>
                      <span style={{ color: '#cbd5e1', fontSize: 16 }}>›</span>
                    </div>
                  </a>
                )
              })}
            </div>
          )}
        </div>
        <div className="fade-up-3" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card" style={{ padding: 20 }}>
            <p style={{ fontWeight: 700, fontSize: 14, color: '#0f172a', marginBottom: 14 }}>Quick Actions</p>
            {[{ href: '/student/submit', icon: '✦', label: 'Submit New Grievance', color: '#2563eb', bg: '#eff6ff' }, { href: '/student/grievances', icon: '◎', label: 'View All Grievances', color: '#7c3aed', bg: '#f5f3ff' }].map(a => (
              <a key={a.href} href={a.href} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 10, textDecoration: 'none', marginBottom: 8, background: a.bg, transition: 'all 0.15s' }}>
                <span style={{ fontSize: 16, color: a.color }}>{a.icon}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: a.color }}>{a.label}</span>
                <span style={{ marginLeft: 'auto', color: a.color, fontSize: 14 }}>→</span>
              </a>
            ))}
          </div>
          <div className="card" style={{ padding: 20, background: 'linear-gradient(135deg, #020817, #1e1b4b)', border: 'none' }}>
            <p style={{ fontWeight: 700, fontSize: 13, color: '#fbbf24', marginBottom: 14 }}>How it works</p>
            {[{ step: '1', text: 'Submit your grievance with details and attachments' }, { step: '2', text: 'AI analyzes, categorizes and scores urgency' }, { step: '3', text: 'Routed to the right department admin' }, { step: '4', text: 'Track resolution status in real time' }].map(s => (
              <div key={s.step} style={{ display: 'flex', gap: 10, marginBottom: 12, alignItems: 'flex-start' }}>
                <div style={{ width: 20, height: 20, background: 'rgba(245,158,11,0.2)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#fbbf24', fontWeight: 700, flexShrink: 0, marginTop: 1 }}>{s.step}</div>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 1.5 }}>{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
