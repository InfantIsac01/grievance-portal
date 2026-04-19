'use client'
import { useState, useEffect } from 'react'
const CAT_CONFIG = { 'Academic': { icon: '📚', color: '#2563eb', bg: '#eff6ff' }, 'Examination & Results': { icon: '📝', color: '#7c3aed', bg: '#f5f3ff' }, 'Fee & Finance': { icon: '💳', color: '#0891b2', bg: '#ecfeff' }, 'Hostel & Accommodation': { icon: '🏠', color: '#059669', bg: '#ecfdf5' }, 'Faculty & Staff Conduct': { icon: '👨‍🏫', color: '#dc2626', bg: '#fef2f2' }, 'Infrastructure & Facilities': { icon: '🏛️', color: '#d97706', bg: '#fffbeb' }, 'Library': { icon: '📖', color: '#0284c7', bg: '#f0f9ff' }, 'Transportation': { icon: '🚌', color: '#16a34a', bg: '#f0fdf4' }, 'Sports & Extracurricular': { icon: '⚽', color: '#ea580c', bg: '#fff7ed' }, 'Scholarship': { icon: '🎓', color: '#9333ea', bg: '#faf5ff' }, 'Canteen & Food': { icon: '🍽️', color: '#b45309', bg: '#fffbeb' }, 'IT & Internet': { icon: '💻', color: '#1d4ed8', bg: '#eff6ff' }, 'Other': { icon: '📌', color: '#64748b', bg: '#f8fafc' } }
const STATUS_CONFIG = { Received: { color: '#1d4ed8', bg: '#eff6ff' }, 'Under Review': { color: '#b45309', bg: '#fffbeb' }, 'In Progress': { color: '#7c3aed', bg: '#f5f3ff' }, Resolved: { color: '#15803d', bg: '#f0fdf4' }, Rejected: { color: '#dc2626', bg: '#fef2f2' } }

export default function AdminDashboard() {
  const [admin, setAdmin] = useState(null)
  const [grievances, setGrievances] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCat, setSelectedCat] = useState(null)
  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState('')
  const [statusF, setStatusF] = useState('All')
  const [urgF, setUrgF] = useState('All')
  const [note, setNote] = useState('')
  const [newStatus, setNewStatus] = useState('')
  const [updating, setUpdating] = useState(false)
  const [updateMsg, setUpdateMsg] = useState('')

  useEffect(() => { const a = sessionStorage.getItem('hit_admin'); if (a) setAdmin(JSON.parse(a)) }, [])
  useEffect(() => {
    if (!admin) return
    fetch('/api/grievances').then(r => r.json()).then(data => {
      setGrievances(admin.role === 'super' ? data : data.filter(g => g.category === admin.category))
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [admin])

  const allCats = [...new Set(grievances.map(g => g.category))]
  const visibleGrievances = grievances.filter(g =>
    (!selectedCat || g.category === selectedCat) &&
    (statusF === 'All' || g.status === statusF) &&
    (urgF === 'All' || String(g.urgency) === urgF) &&
    (search === '' || g.title.toLowerCase().includes(search.toLowerCase()) || g.studentName?.toLowerCase().includes(search.toLowerCase()) || g.id.toLowerCase().includes(search.toLowerCase()) || g.rollNumber?.toLowerCase().includes(search.toLowerCase()))
  ).sort((a, b) => b.urgency - a.urgency || new Date(b.createdAt) - new Date(a.createdAt))

  const stats = [
    { label: 'Total', value: grievances.length, color: '#1d4ed8', bg: '#eff6ff', icon: '📋' },
    { label: 'Pending', value: grievances.filter(g => g.status === 'Received' || g.status === 'Under Review').length, color: '#b45309', bg: '#fffbeb', icon: '⏳' },
    { label: 'In Progress', value: grievances.filter(g => g.status === 'In Progress').length, color: '#7c3aed', bg: '#f5f3ff', icon: '⚙️' },
    { label: 'Resolved', value: grievances.filter(g => g.status === 'Resolved').length, color: '#15803d', bg: '#f0fdf4', icon: '✅' },
  ]

  const dupGroups = {}
  grievances.forEach(g => { if (g.duplicate_group) dupGroups[g.duplicate_group] = (dupGroups[g.duplicate_group] || 0) + 1 })
  const dups = Object.entries(dupGroups).filter(([, v]) => v > 1)

  const load = async () => {
    const data = await fetch('/api/grievances').then(r => r.json())
    setGrievances(admin.role === 'super' ? data : data.filter(g => g.category === admin.category))
  }

  const doUpdate = async () => {
    if (!newStatus || !selected) return
    setUpdating(true); setUpdateMsg('')
    try {
      const res = await fetch('/api/grievances', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'update', id: selected.id, status: newStatus, note: note || `Status updated to ${newStatus} by administrator.` }) }).then(r => r.json())
      if (res.success) {
        setUpdateMsg('success'); await load()
        const fresh = await fetch('/api/grievances').then(r => r.json())
        const filtered2 = admin.role === 'super' ? fresh : fresh.filter(g => g.category === admin.category)
        setGrievances(filtered2)
        setSelected(filtered2.find(g => g.id === selected.id) || null)
        setNote('')
      } else setUpdateMsg('error')
    } catch { setUpdateMsg('error') }
    setUpdating(false)
    setTimeout(() => setUpdateMsg(''), 3000)
  }

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh', flexDirection: 'column', gap: 12 }}><div className="spin" style={{ width: 40, height: 40, border: '3px solid #e2e8f0', borderTopColor: '#7c3aed', borderRadius: '50%' }} /><p style={{ fontSize: 14, color: '#64748b' }}>Loading grievances…</p></div>

  if (admin?.role === 'super' && !selectedCat) return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '36px 24px' }}>
      <div className="fade-up" style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600, marginBottom: 4 }}>Super Administrator</p>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontFamily: 'Plus Jakarta Sans', fontSize: 28, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px', marginBottom: 6 }}>All Departments Overview</h1>
            <p style={{ fontSize: 14, color: '#64748b' }}>Select a category or view all grievances.</p>
          </div>
          <button onClick={() => setSelectedCat('__all__')} className="btn btn-blue" style={{ padding: '10px 20px' }}>View All Grievances</button>
        </div>
      </div>
      <div className="fade-up-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        {stats.map(s => (
          <div key={s.label} className="card" style={{ display: 'flex', gap: 14, alignItems: 'center', padding: '18px 20px' }}>
            <div style={{ width: 44, height: 44, background: s.bg, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{s.icon}</div>
            <div>
              <p style={{ fontFamily: 'Plus Jakarta Sans', fontSize: 26, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</p>
              <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 3 }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>
      {dups.length > 0 && <div className="fade-up-2" style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 14, padding: '14px 20px', marginBottom: 24, display: 'flex', gap: 12 }}><span style={{ fontSize: 20, flexShrink: 0 }}>⚠️</span><div><p style={{ fontWeight: 700, fontSize: 14, color: '#92400e', marginBottom: 2 }}>Repetitive grievances detected</p><p style={{ fontSize: 13, color: '#b45309' }}>{dups.map(([k, v]) => `"${k}" — ${v} submissions`).join(' · ')}</p></div></div>}
      <div className="fade-up-2">
        <p style={{ fontWeight: 700, fontSize: 15, color: '#0f172a', marginBottom: 16 }}>Category Overview</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {Object.keys(CAT_CONFIG).filter(cat => allCats.includes(cat)).map(cat => {
            const cfg = CAT_CONFIG[cat]
            const count = grievances.filter(g => g.category === cat).length
            const urgent = grievances.filter(g => g.category === cat && g.urgency >= 4).length
            const pending = grievances.filter(g => g.category === cat && (g.status === 'Received' || g.status === 'Under Review')).length
            return (
              <div key={cat} onClick={() => setSelectedCat(cat)} className="card card-hover" style={{ cursor: 'pointer', borderLeft: `4px solid ${cfg.color}`, padding: 18 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ width: 44, height: 44, background: cfg.bg, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{cfg.icon}</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 700, fontSize: 13, color: '#0f172a', marginBottom: 4 }}>{cat}</p>
                    <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 8 }}>{count} total · {pending} pending</p>
                    {urgent > 0 && <span style={{ fontSize: 11, background: '#fef2f2', color: '#dc2626', padding: '2px 8px', borderRadius: 6, fontWeight: 600 }}>{urgent} urgent</span>}
                  </div>
                  <span style={{ color: '#cbd5e1', fontSize: 16 }}>›</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )

  const displayCategory = selectedCat === '__all__' ? 'All Departments' : (admin.role === 'category' ? admin.category : selectedCat)
  const catCfg = CAT_CONFIG[displayCategory] || { icon: '📋', color: '#1d4ed8', bg: '#eff6ff' }

  return (
    <div style={{ maxWidth: 1300, margin: '0 auto', padding: '28px 24px' }}>
      <div className="fade-up" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {admin.role === 'super' && <button onClick={() => { setSelectedCat(null); setSelected(null) }} className="btn btn-white" style={{ padding: '8px 16px', fontSize: 13 }}>← Back</button>}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ fontSize: 20 }}>{catCfg.icon}</span><h1 style={{ fontFamily: 'Plus Jakarta Sans', fontSize: 22, fontWeight: 800, color: '#0f172a', margin: 0 }}>{displayCategory}</h1></div>
            <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 2 }}>{visibleGrievances.length} grievance{visibleGrievances.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          {stats.map(s => <div key={s.label} style={{ background: s.bg, color: s.color, padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' }}>{s.icon} {s.value} {s.label}</div>)}
        </div>
      </div>
      {dups.length > 0 && <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 12, padding: '12px 16px', marginBottom: 16, fontSize: 13, color: '#b45309' }}>⚠️ <strong>Repetitive grievances:</strong> {dups.map(([k, v]) => `"${k}" ×${v}`).join(' · ')}</div>}
      <div className="fade-up-1" style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by title, name, roll number, ID…" className="input" style={{ paddingLeft: 38, height: 42 }} />
        </div>
        <select value={statusF} onChange={e => setStatusF(e.target.value)} className="input" style={{ width: 'auto', height: 42, cursor: 'pointer' }}>
          {['All', 'Received', 'Under Review', 'In Progress', 'Resolved', 'Rejected'].map(s => <option key={s} value={s}>{s === 'All' ? 'All statuses' : s}</option>)}
        </select>
        <select value={urgF} onChange={e => setUrgF(e.target.value)} className="input" style={{ width: 'auto', height: 42, cursor: 'pointer' }}>
          {['All', '5', '4', '3', '2', '1'].map((u, i) => <option key={u} value={u}>{i === 0 ? 'All urgencies' : `P${u} — ${['', 'Minimal', 'Low', 'Medium', 'High', 'Critical'][Number(u)]}`}</option>)}
        </select>
        <span style={{ alignSelf: 'center', fontSize: 12, color: '#94a3b8', whiteSpace: 'nowrap' }}>{visibleGrievances.length} shown</span>
      </div>
      {visibleGrievances.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 60, border: '2px dashed #e2e8f0', background: '#fafafa' }}>
          <span style={{ fontSize: 48, display: 'block', marginBottom: 12 }}>📭</span>
          <p style={{ fontWeight: 600, color: '#334155', fontSize: 16 }}>No grievances found</p>
          <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 6 }}>No grievances match the current filters.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 1.3fr' : '1fr', gap: 20 }} className="fade-up-2">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 'calc(100vh - 260px)', overflowY: 'auto', paddingRight: 4 }}>
            {visibleGrievances.map(g => {
              const sc = STATUS_CONFIG[g.status] || STATUS_CONFIG.Received
              const cc = CAT_CONFIG[g.category] || CAT_CONFIG.Other
              return (
                <div key={g.id} onClick={() => { setSelected(g); setNewStatus(g.status); setUpdateMsg('') }}
                  className="card" style={{ padding: '16px 18px', cursor: 'pointer', transition: 'all 0.2s', borderLeft: `4px solid ${selected?.id === g.id ? sc.color : '#f1f5f9'}`, background: selected?.id === g.id ? sc.bg : '#fff' }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <div style={{ width: 38, height: 38, background: cc.bg, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, flexShrink: 0 }}>{cc.icon}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', gap: 5, alignItems: 'center', marginBottom: 5, flexWrap: 'wrap' }}>
                        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#cbd5e1' }}>{g.id}</span>
                        <span className="badge" style={{ background: sc.bg, color: sc.color, fontSize: 10 }}>{g.status}</span>
                        <span className={`badge badge-p${g.urgency}`} style={{ fontSize: 10 }}>P{g.urgency}</span>
                        {g.is_duplicate && <span style={{ fontSize: 9, background: '#fffbeb', color: '#d97706', padding: '2px 6px', borderRadius: 5, fontWeight: 700 }}>DUP</span>}
                        {g.attachments?.length > 0 && <span style={{ fontSize: 10, color: '#94a3b8' }}>📎{g.attachments.length}</span>}
                      </div>
                      <p style={{ fontWeight: 700, fontSize: 13, color: '#0f172a', marginBottom: 3 }}>{g.title}</p>
                      <p style={{ fontSize: 11, color: '#94a3b8' }}>{g.studentName} · {g.rollNumber} · {new Date(g.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          {selected && (
            <div style={{ position: 'sticky', top: 80, alignSelf: 'start', maxHeight: 'calc(100vh - 100px)', overflowY: 'auto' }} className="slide-in">
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ background: 'linear-gradient(135deg, #020817, #1e1b4b)', padding: '20px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#fbbf24' }}>{selected.id}</span>
                    <button onClick={() => setSelected(null)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', cursor: 'pointer', borderRadius: 6, padding: '3px 8px', fontSize: 12, fontFamily: 'Plus Jakarta Sans' }}>×</button>
                  </div>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
                    {(() => { const sc = STATUS_CONFIG[selected.status] || STATUS_CONFIG.Received; return <span className="badge" style={{ background: sc.bg, color: sc.color }}>{selected.status}</span> })()}
                    <span className={`badge badge-p${selected.urgency}`}>Priority {selected.urgency}</span>
                    {selected.is_duplicate && <span style={{ background: 'rgba(251,191,36,0.2)', color: '#fbbf24', padding: '3px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700 }}>DUPLICATE</span>}
                  </div>
                  <h3 style={{ fontFamily: 'Plus Jakarta Sans', fontSize: 16, fontWeight: 700, color: '#fff', lineHeight: 1.3 }}>{selected.title}</h3>
                </div>
                <div style={{ padding: '20px 24px' }}>
                  <div style={{ background: '#f8fafc', borderRadius: 12, padding: '12px 16px', marginBottom: 16, border: '1px solid #f1f5f9' }}>
                    <p className="label" style={{ marginBottom: 8 }}>Student Information</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      {[['Name', selected.studentName], ['Roll No.', selected.rollNumber], ['Dept', selected.studentDept], ['Year', selected.year], ['Email', selected.studentEmail]].map(([l, v]) => (
                        <div key={l} style={{ gridColumn: l === 'Email' ? 'span 2' : 'auto' }}>
                          <p style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>{l}</p>
                          <p style={{ fontSize: 12, color: '#334155', fontWeight: 500, fontFamily: l === 'Email' || l === 'Roll No.' ? 'JetBrains Mono, monospace' : 'inherit', marginTop: 1 }}>{v || '—'}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <p className="label">Description</p>
                    <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.6, background: '#f8fafc', padding: '12px 14px', borderRadius: 10, border: '1px solid #f1f5f9' }}>{selected.description}</p>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                    <div style={{ background: '#fef2f2', borderRadius: 10, padding: '10px 12px', border: '1px solid #fecaca' }}>
                      <p style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 3 }}>Urgency Reason</p>
                      <p style={{ fontSize: 12, color: '#dc2626' }}>{selected.urgency_reason}</p>
                    </div>
                    <div style={{ background: '#f8fafc', borderRadius: 10, padding: '10px 12px', border: '1px solid #f1f5f9' }}>
                      <p style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 3 }}>AI Summary</p>
                      <p style={{ fontSize: 12, color: '#475569' }}>{selected.summary}</p>
                    </div>
                  </div>
                  {selected.attachments?.length > 0 && (
                    <div style={{ marginBottom: 16 }}>
                      <p className="label">Attachments</p>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {selected.attachments.map((f, i) => <a key={i} href={f.path} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: '5px 10px', fontSize: 11, color: '#1d4ed8', textDecoration: 'none', fontWeight: 500 }}>{f.type?.startsWith('image/') ? '🖼️' : f.type?.startsWith('video/') ? '🎥' : f.type?.startsWith('audio/') ? '🎵' : '📄'} {f.name}</a>)}
                      </div>
                    </div>
                  )}
                  <div style={{ marginBottom: 20 }}>
                    <p className="label">Status History</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {selected.status_history.map((h, i) => {
                        const sc2 = STATUS_CONFIG[h.status] || STATUS_CONFIG.Received
                        return (
                          <div key={i} style={{ background: '#f8fafc', borderRadius: 10, padding: '10px 12px', border: '1px solid #f1f5f9', display: 'flex', gap: 10 }}>
                            <span className="badge" style={{ background: sc2.bg, color: sc2.color, fontSize: 10, flexShrink: 0 }}>{h.status}</span>
                            <div style={{ flex: 1 }}>
                              <p style={{ fontSize: 10, color: '#94a3b8', marginBottom: 2 }}>{new Date(h.timestamp).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                              <p style={{ fontSize: 12, color: '#475569', lineHeight: 1.5 }}>{h.note}</p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 18 }}>
                    <p className="label">Update Status</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginBottom: 10 }}>
                      {['Received', 'Under Review', 'In Progress', 'Resolved', 'Rejected'].map(s => (
                        <button key={s} onClick={() => setNewStatus(s)} style={{ padding: '8px 4px', borderRadius: 9, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans', border: '2px solid', transition: 'all 0.15s', background: newStatus === s ? '#0f172a' : '#fff', color: newStatus === s ? '#fff' : '#64748b', borderColor: newStatus === s ? '#0f172a' : '#e2e8f0' }}>{s}</button>
                      ))}
                    </div>
                    <input value={note} onChange={e => setNote(e.target.value)} placeholder="Add a note for the student (optional)…" className="input" style={{ marginBottom: 10, fontSize: 13 }} />
                    {updateMsg === 'success' && <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '8px 12px', fontSize: 13, color: '#15803d', fontWeight: 500, marginBottom: 10 }}>✅ Status updated!</div>}
                    {updateMsg === 'error' && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '8px 12px', fontSize: 13, color: '#dc2626', fontWeight: 500, marginBottom: 10 }}>❌ Update failed.</div>}
                    <button onClick={doUpdate} disabled={updating || !newStatus} className="btn btn-blue" style={{ width: '100%', padding: '11px' }}>{updating ? 'Updating…' : '✅ Update Status'}</button>
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
