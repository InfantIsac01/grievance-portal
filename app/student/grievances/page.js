'use client'
import { useState, useEffect } from 'react'
const STATUS_CONFIG = { Received: { color: '#1d4ed8', bg: '#eff6ff' }, 'Under Review': { color: '#b45309', bg: '#fffbeb' }, 'In Progress': { color: '#7c3aed', bg: '#f5f3ff' }, Resolved: { color: '#15803d', bg: '#f0fdf4' }, Rejected: { color: '#dc2626', bg: '#fef2f2' } }
const CAT_ICONS = { 'Academic': '📚', 'Examination & Results': '📝', 'Fee & Finance': '💳', 'Hostel & Accommodation': '🏠', 'Faculty & Staff Conduct': '👨‍🏫', 'Infrastructure & Facilities': '🏛️', 'Library': '📖', 'Transportation': '🚌', 'Sports & Extracurricular': '⚽', 'Scholarship': '🎓', 'Canteen & Food': '🍽️', 'IT & Internet': '💻', 'Other': '📌' }
export default function GrievancesPage() {
  const [grievances, setGrievances] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')
  const [selected, setSelected] = useState(null)
  const [student, setStudent] = useState(null)
  useEffect(() => { const s = sessionStorage.getItem('hit_student'); if (s) setStudent(JSON.parse(s)) }, [])
  useEffect(() => {
    if (!student) return
    fetch(`/api/grievances?studentId=${student.id}`).then(r => r.json()).then(data => { setGrievances(data); setLoading(false) }).catch(() => setLoading(false))
  }, [student])
  const FILTERS = ['All', 'Received', 'Under Review', 'In Progress', 'Resolved', 'Rejected']
  const filtered = filter === 'All' ? grievances : grievances.filter(g => g.status === filter)
  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '36px 24px' }}>
      <div className="fade-up" style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600, marginBottom: 4 }}>Your Grievances</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <h1 style={{ fontFamily: 'Plus Jakarta Sans', fontSize: 28, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px' }}>My Grievances</h1>
          <a href="/student/submit" className="btn btn-blue" style={{ textDecoration: 'none', padding: '10px 20px' }}>✦ Submit New</a>
        </div>
      </div>
      <div className="fade-up-1" style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {FILTERS.map(f => {
          const count = f === 'All' ? grievances.length : grievances.filter(g => g.status === f).length
          return (
            <button key={f} onClick={() => { setFilter(f); setSelected(null) }}
              style={{ padding: '7px 16px', borderRadius: 999, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans', border: '1.5px solid', transition: 'all 0.15s', background: filter === f ? '#0f172a' : '#fff', color: filter === f ? '#fff' : '#64748b', borderColor: filter === f ? '#0f172a' : '#e2e8f0' }}>
              {f} {count > 0 && <span style={{ fontSize: 11, marginLeft: 4, opacity: 0.7 }}>({count})</span>}
            </button>
          )
        })}
      </div>
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>{[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 90, borderRadius: 14 }} />)}</div>
      ) : filtered.length === 0 ? (
        <div className="card fade-up-2" style={{ textAlign: 'center', padding: 60, border: '2px dashed #e2e8f0', background: '#fafafa' }}>
          <span style={{ fontSize: 52, display: 'block', marginBottom: 12 }}>📭</span>
          <p style={{ fontWeight: 700, fontSize: 18, color: '#334155', marginBottom: 6 }}>{filter === 'All' ? 'No grievances yet' : `No ${filter} grievances`}</p>
          <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 24 }}>{filter === 'All' ? 'Submit your first grievance to get started.' : 'No grievances with this status.'}</p>
          {filter === 'All' && <a href="/student/submit" className="btn btn-blue" style={{ textDecoration: 'none' }}>Submit Grievance →</a>}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 1fr' : '1fr', gap: 20 }} className="fade-up-2">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map(g => {
              const sc = STATUS_CONFIG[g.status] || STATUS_CONFIG.Received
              return (
                <div key={g.id} onClick={() => setSelected(g.id === selected?.id ? null : g)}
                  className="card" style={{ padding: '18px 20px', cursor: 'pointer', transition: 'all 0.2s', borderLeft: `4px solid ${selected?.id === g.id ? sc.color : '#e2e8f0'}`, background: selected?.id === g.id ? '#fafeff' : '#fff' }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{ width: 42, height: 42, background: '#f8fafc', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0, border: '1px solid #f1f5f9' }}>{CAT_ICONS[g.category] || '📌'}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 6, flexWrap: 'wrap' }}>
                        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#cbd5e1' }}>{g.id}</span>
                        <span className="badge" style={{ background: sc.bg, color: sc.color }}>{g.status}</span>
                        <span className={`badge badge-p${g.urgency}`}>P{g.urgency}</span>
                        {g.attachments?.length > 0 && <span style={{ fontSize: 10, color: '#94a3b8' }}>📎 {g.attachments.length}</span>}
                      </div>
                      <p style={{ fontWeight: 700, fontSize: 14, color: '#0f172a', marginBottom: 4 }}>{g.title}</p>
                      <p style={{ fontSize: 12, color: '#94a3b8' }}>{g.category} · {new Date(g.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                    <span style={{ color: selected?.id === g.id ? sc.color : '#cbd5e1', fontSize: 16 }}>{selected?.id === g.id ? '×' : '›'}</span>
                  </div>
                </div>
              )
            })}
          </div>
          {selected && (
            <div className="slide-in" style={{ position: 'sticky', top: 80, alignSelf: 'start' }}>
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ background: 'linear-gradient(135deg, #020817, #0f172a)', padding: '20px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#fbbf24' }}>{selected.id}</span>
                    <button onClick={() => setSelected(null)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', cursor: 'pointer', borderRadius: 6, padding: '4px 8px', fontSize: 12, fontFamily: 'Plus Jakarta Sans' }}>Close ×</button>
                  </div>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
                    {(() => { const sc = STATUS_CONFIG[selected.status] || STATUS_CONFIG.Received; return <span className="badge" style={{ background: sc.bg, color: sc.color }}>{selected.status}</span> })()}
                    <span className={`badge badge-p${selected.urgency}`}>Priority {selected.urgency}</span>
                  </div>
                  <h3 style={{ fontFamily: 'Plus Jakarta Sans', fontSize: 17, fontWeight: 700, color: '#fff', lineHeight: 1.3 }}>{selected.title}</h3>
                </div>
                <div style={{ padding: '20px 24px', maxHeight: '65vh', overflowY: 'auto' }}>
                  {selected.status !== 'Rejected' && (() => {
                    const steps = ['Received', 'Under Review', 'In Progress', 'Resolved']
                    const cur = steps.indexOf(selected.status)
                    return (
                      <div style={{ marginBottom: 20 }}>
                        <p className="label">Progress</p>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          {steps.map((s, i) => (
                            <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 'none' }}>
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                                <div style={{ width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, border: '2px solid', background: i < cur ? '#dcfce7' : i === cur ? '#2563eb' : '#f1f5f9', borderColor: i < cur ? '#86efac' : i === cur ? '#2563eb' : '#e2e8f0', color: i < cur ? '#15803d' : i === cur ? '#fff' : '#94a3b8' }}>{i < cur ? '✓' : i + 1}</div>
                                <p style={{ fontSize: 9, color: i <= cur ? '#0f172a' : '#94a3b8', marginTop: 4, textAlign: 'center', fontWeight: i === cur ? 700 : 400 }}>{s}</p>
                              </div>
                              {i < steps.length - 1 && <div style={{ flex: 1, height: 2, background: i < cur ? '#2563eb' : '#f1f5f9', margin: '0 4px', marginBottom: 18, borderRadius: 2 }} />}
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })()}
                  <div style={{ marginBottom: 16 }}>
                    <p className="label">Description</p>
                    <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.6, background: '#f8fafc', padding: '12px 14px', borderRadius: 10, border: '1px solid #f1f5f9' }}>{selected.description}</p>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                    {[['Category', selected.category], ['Submitted', new Date(selected.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })], ['Urgency Reason', selected.urgency_reason], ['AI Summary', selected.summary]].map(([l, v], i) => (
                      <div key={l} style={{ gridColumn: i >= 2 ? 'span 2' : 'auto', background: '#f8fafc', borderRadius: 10, padding: '10px 12px', border: '1px solid #f1f5f9' }}>
                        <p style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>{l}</p>
                        <p style={{ fontSize: 13, color: '#334155', lineHeight: 1.4 }}>{v || '—'}</p>
                      </div>
                    ))}
                  </div>
                  {selected.attachments?.length > 0 && (
                    <div style={{ marginBottom: 16 }}>
                      <p className="label">Attachments ({selected.attachments.length})</p>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {selected.attachments.map((f, i) => (
                          <a key={i} href={f.path} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: '6px 12px', fontSize: 12, color: '#1d4ed8', textDecoration: 'none', fontWeight: 500 }}>
                            {f.type?.startsWith('image/') ? '🖼️' : f.type?.startsWith('video/') ? '🎥' : f.type?.startsWith('audio/') ? '🎵' : '📄'} {f.name}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                  <div>
                    <p className="label">Status Timeline</p>
                    <div style={{ position: 'relative', paddingLeft: 18 }}>
                      <div style={{ position: 'absolute', left: 6, top: 6, bottom: 6, width: 1.5, background: '#e2e8f0', borderRadius: 4 }} />
                      {selected.status_history.map((h, i) => {
                        const sc2 = STATUS_CONFIG[h.status] || STATUS_CONFIG.Received
                        return (
                          <div key={i} style={{ position: 'relative', marginBottom: 14 }}>
                            <div style={{ position: 'absolute', left: -14, top: 6, width: 10, height: 10, borderRadius: '50%', border: '2px solid #fff', background: i === selected.status_history.length - 1 ? '#2563eb' : '#10b981' }} />
                            <div style={{ background: '#f8fafc', borderRadius: 10, padding: '10px 12px', border: '1px solid #f1f5f9' }}>
                              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4, flexWrap: 'wrap' }}>
                                <span className="badge" style={{ background: sc2.bg, color: sc2.color, fontSize: 10 }}>{h.status}</span>
                                <span style={{ fontSize: 10, color: '#94a3b8' }}>{new Date(h.timestamp).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                              <p style={{ fontSize: 12, color: '#475569', lineHeight: 1.5 }}>{h.note}</p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
