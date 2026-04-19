'use client'
import { useState, useEffect, useCallback } from 'react'

const STUDENT_FIELDS = ['id', 'name', 'email', 'rollNumber', 'department', 'year', 'createdAt']
const GRIEVANCE_FIELDS = ['id', 'studentName', 'rollNumber', 'category', 'title', 'status', 'urgency', 'createdAt']

const STATUS_COLORS = {
  Received: { bg: '#eff6ff', color: '#1d4ed8' },
  'Under Review': { bg: '#fffbeb', color: '#b45309' },
  'In Progress': { bg: '#f5f3ff', color: '#7c3aed' },
  Resolved: { bg: '#f0fdf4', color: '#15803d' },
  Rejected: { bg: '#fef2f2', color: '#dc2626' },
}

const URG_COLORS = {
  5: { bg: '#fef2f2', color: '#dc2626' },
  4: { bg: '#fff7ed', color: '#c2410c' },
  3: { bg: '#fffbeb', color: '#b45309' },
  2: { bg: '#eff6ff', color: '#1d4ed8' },
  1: { bg: '#f8fafc', color: '#475569' },
}

export default function DatabasePage() {
  const [table, setTable] = useState('students')
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState(null)
  const [expandedRow, setExpandedRow] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false)
  const [rawView, setRawView] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/database?table=${table}`).then(r => r.json())
      if (res.success) setData(res.data)
    } catch {}
    setLoading(false)
  }, [table])

  useEffect(() => { setSelected(null); setSearch(''); setExpandedRow(null); load() }, [table])
  useEffect(() => { if (!autoRefresh) return; const t = setInterval(load, 3000); return () => clearInterval(t) }, [autoRefresh, load])

  const fields = table === 'students' ? STUDENT_FIELDS : GRIEVANCE_FIELDS

  const filtered = data.filter(r =>
    fields.some(f => String(r[f] || '').toLowerCase().includes(search.toLowerCase()))
  )

  const showMsg = (text, type = 'success') => {
    setMsg({ text, type })
    setTimeout(() => setMsg(null), 3000)
  }

  const startEdit = (record) => {
    setSelected(record)
    setEditForm({ ...record })
    setEditing(true)
    setExpandedRow(null)
  }

  const saveEdit = async () => {
    setSaving(true)
    try {
      const { password: _, ...safeForm } = editForm
      const res = await fetch('/api/database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table, action: 'update', id: selected.id, record: safeForm }),
      }).then(r => r.json())
      if (res.success) { showMsg('Record updated successfully!'); setEditing(false); setSelected(null); load() }
      else showMsg(res.message || 'Update failed.', 'error')
    } catch { showMsg('Network error.', 'error') }
    setSaving(false)
  }

  const deleteRecord = async (id) => {
    try {
      const res = await fetch('/api/database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table, action: 'delete', id }),
      }).then(r => r.json())
      if (res.success) { showMsg('Record deleted.'); setConfirmDelete(null); if (selected?.id === id) { setSelected(null); setEditing(false) } load() }
      else showMsg(res.message || 'Delete failed.', 'error')
    } catch { showMsg('Network error.', 'error') }
  }

  const deleteAll = async () => {
    try {
      const res = await fetch('/api/database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table, action: 'delete_all' }),
      }).then(r => r.json())
      if (res.success) { showMsg('All records deleted.'); setConfirmDeleteAll(false); setSelected(null); setEditing(false); load() }
      else showMsg('Failed to delete.', 'error')
    } catch { showMsg('Network error.', 'error') }
  }

  const copyJSON = () => {
    navigator.clipboard?.writeText(JSON.stringify(data, null, 2))
    showMsg('JSON copied to clipboard!')
  }

  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `${table}.json`; a.click()
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0e1a', fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#e2e8f0' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: #0f1629; }
        ::-webkit-scrollbar-thumb { background: #2d3748; border-radius: 999px; }
        input, select, textarea { font-family: 'Plus Jakarta Sans', sans-serif; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        .row-hover:hover { background: rgba(255,255,255,0.04) !important; }
        .btn-anim { transition: all 0.15s; }
        .btn-anim:hover:not(:disabled) { transform: translateY(-1px); }
        .btn-anim:active:not(:disabled) { transform: translateY(0); }
      `}</style>

      {/* Header */}
      <header style={{ background: '#0d1117', borderBottom: '1px solid #1e2736', padding: '0 28px', height: 58, display: 'flex', alignItems: 'center', gap: 16, position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginRight: 8 }}>
          <div style={{ width: 30, height: 30, background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: '#fff' }}>DB</div>
          <span style={{ fontWeight: 700, fontSize: 15, color: '#f1f5f9' }}>HIT Database Explorer</span>
          <span style={{ fontSize: 11, color: '#475569', background: '#1e2736', padding: '2px 8px', borderRadius: 4, fontFamily: 'JetBrains Mono, monospace' }}>data/*.json</span>
        </div>

        {/* Table tabs */}
        <div style={{ display: 'flex', gap: 4, background: '#161b27', borderRadius: 10, padding: 4, marginRight: 'auto' }}>
          {[
            { key: 'students', icon: '👤', label: 'students.json', count: table === 'students' ? data.length : null },
            { key: 'grievances', icon: '📋', label: 'grievances.json', count: table === 'grievances' ? data.length : null },
          ].map(t => (
            <button key={t.key} onClick={() => setTable(t.key)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'Plus Jakarta Sans', transition: 'all 0.15s',
                background: table === t.key ? '#1e3a5f' : 'transparent',
                color: table === t.key ? '#60a5fa' : '#64748b' }}>
              <span>{t.icon}</span>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11 }}>{t.label}</span>
              {t.count !== null && <span style={{ background: 'rgba(96,165,250,0.2)', color: '#60a5fa', borderRadius: 5, padding: '1px 5px', fontSize: 10 }}>{t.count}</span>}
            </button>
          ))}
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {/* Auto-refresh */}
          <button onClick={() => setAutoRefresh(r => !r)} className="btn-anim"
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, border: '1px solid', fontSize: 12, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans', fontWeight: 500,
              background: autoRefresh ? 'rgba(16,185,129,0.1)' : 'transparent',
              borderColor: autoRefresh ? '#10b981' : '#2d3748',
              color: autoRefresh ? '#10b981' : '#64748b' }}>
            <span style={{ display: 'inline-block', animation: autoRefresh ? 'spin 2s linear infinite' : 'none', fontSize: 13 }}>↻</span>
            {autoRefresh ? 'Live' : 'Refresh'}
          </button>

          {/* Raw JSON */}
          <button onClick={() => setRawView(v => !v)} className="btn-anim"
            style={{ padding: '6px 12px', borderRadius: 8, border: `1px solid ${rawView ? '#8b5cf6' : '#2d3748'}`, fontSize: 12, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans', fontWeight: 500,
              background: rawView ? 'rgba(139,92,246,0.1)' : 'transparent', color: rawView ? '#a78bfa' : '#64748b' }}>
            {'</>'}  Raw JSON
          </button>

          <button onClick={copyJSON} className="btn-anim" style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #2d3748', fontSize: 12, cursor: 'pointer', background: 'transparent', color: '#64748b', fontFamily: 'Plus Jakarta Sans' }}>📋 Copy</button>
          <button onClick={downloadJSON} className="btn-anim" style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #2d3748', fontSize: 12, cursor: 'pointer', background: 'transparent', color: '#64748b', fontFamily: 'Plus Jakarta Sans' }}>⬇️ Export</button>
          <button onClick={() => setConfirmDeleteAll(true)} className="btn-anim" style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #7f1d1d', fontSize: 12, cursor: 'pointer', background: 'rgba(239,68,68,0.08)', color: '#f87171', fontFamily: 'Plus Jakarta Sans' }}>🗑️ Clear all</button>
          <button onClick={load} className="btn-anim" style={{ padding: '6px 14px', borderRadius: 8, border: 'none', fontSize: 12, cursor: 'pointer', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: '#fff', fontWeight: 600, fontFamily: 'Plus Jakarta Sans' }}>⟳ Reload</button>
        </div>
      </header>

      {/* Toast */}
      {msg && (
        <div style={{ position: 'fixed', top: 72, right: 24, zIndex: 999, padding: '12px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600, animation: 'fadeIn 0.3s ease',
          background: msg.type === 'error' ? '#7f1d1d' : '#14532d',
          border: `1px solid ${msg.type === 'error' ? '#ef4444' : '#22c55e'}`,
          color: msg.type === 'error' ? '#fca5a5' : '#86efac' }}>
          {msg.type === 'error' ? '❌' : '✅'} {msg.text}
        </div>
      )}

      {/* Confirm delete modal */}
      {(confirmDelete || confirmDeleteAll) && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#161b27', border: '1px solid #2d3748', borderRadius: 16, padding: 28, maxWidth: 400, width: '90%', animation: 'fadeIn 0.2s ease' }}>
            <div style={{ fontSize: 32, marginBottom: 12, textAlign: 'center' }}>⚠️</div>
            <h3 style={{ fontWeight: 700, fontSize: 17, color: '#f1f5f9', textAlign: 'center', marginBottom: 8 }}>Confirm Delete</h3>
            <p style={{ fontSize: 13, color: '#94a3b8', textAlign: 'center', marginBottom: 24, lineHeight: 1.6 }}>
              {confirmDeleteAll
                ? `This will permanently delete ALL ${data.length} ${table} records. This cannot be undone.`
                : 'This will permanently delete this record. This cannot be undone.'}
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => { setConfirmDelete(null); setConfirmDeleteAll(false) }}
                style={{ flex: 1, padding: '10px', borderRadius: 10, border: '1px solid #2d3748', background: 'transparent', color: '#94a3b8', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans', fontSize: 13, fontWeight: 600 }}>
                Cancel
              </button>
              <button onClick={() => confirmDeleteAll ? deleteAll() : deleteRecord(confirmDelete)}
                style={{ flex: 1, padding: '10px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #dc2626, #b91c1c)', color: '#fff', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans', fontSize: 13, fontWeight: 600 }}>
                Delete {confirmDeleteAll ? 'All' : 'Record'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', height: 'calc(100vh - 58px)' }}>
        {/* Main content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {/* Toolbar */}
          <div style={{ background: '#0d1117', borderBottom: '1px solid #1e2736', padding: '10px 20px', display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
              <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#475569', fontSize: 14 }}>🔍</span>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder={`Search ${filtered.length} records…`}
                style={{ width: '100%', background: '#161b27', border: '1px solid #2d3748', borderRadius: 8, padding: '8px 12px 8px 36px', fontSize: 13, color: '#e2e8f0', outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: '#475569', fontFamily: 'JetBrains Mono, monospace' }}>{filtered.length}/{data.length} rows</span>
              {autoRefresh && <span style={{ fontSize: 11, color: '#10b981', animation: 'pulse 1.5s infinite' }}>● LIVE</span>}
            </div>
          </div>

          {/* Raw JSON view */}
          {rawView ? (
            <div style={{ flex: 1, overflow: 'auto', background: '#0a0e1a', padding: 20 }}>
              <pre style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#a78bfa', lineHeight: 1.7, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {JSON.stringify(filtered, null, 2)}
              </pre>
            </div>
          ) : loading ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
              <div style={{ width: 36, height: 36, border: '3px solid #1e2736', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              <p style={{ fontSize: 13, color: '#475569' }}>Loading {table}…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8 }}>
              <span style={{ fontSize: 48 }}>📭</span>
              <p style={{ fontSize: 15, fontWeight: 600, color: '#475569' }}>{data.length === 0 ? 'No records yet' : 'No matches found'}</p>
              <p style={{ fontSize: 12, color: '#334155' }}>{data.length === 0 ? `The ${table}.json file is empty.` : `Try a different search term.`}</p>
            </div>
          ) : (
            <div style={{ flex: 1, overflow: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead style={{ position: 'sticky', top: 0, background: '#0d1117', zIndex: 10 }}>
                  <tr>
                    <th style={{ padding: '10px 12px', textAlign: 'left', color: '#475569', fontWeight: 600, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #1e2736', width: 36 }}>#</th>
                    {fields.map(f => (
                      <th key={f} style={{ padding: '10px 12px', textAlign: 'left', color: '#475569', fontWeight: 600, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #1e2736', whiteSpace: 'nowrap' }}>
                        {f}
                      </th>
                    ))}
                    <th style={{ padding: '10px 12px', textAlign: 'right', color: '#475569', fontWeight: 600, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #1e2736', width: 120 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((row, idx) => {
                    const isSelected = selected?.id === row.id
                    const isExpanded = expandedRow === row.id
                    return (
                      <>
                        <tr key={row.id} className="row-hover"
                          style={{ borderBottom: '1px solid #111827', background: isSelected ? 'rgba(37,99,235,0.08)' : 'transparent', cursor: 'pointer', transition: 'background 0.1s' }}
                          onClick={() => setExpandedRow(isExpanded ? null : row.id)}>
                          <td style={{ padding: '10px 12px', color: '#334155', fontFamily: 'JetBrains Mono, monospace' }}>{idx + 1}</td>
                          {fields.map(f => (
                            <td key={f} style={{ padding: '10px 12px', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {f === 'status' ? (
                                <span style={{ ...STATUS_COLORS[row[f]], padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>{row[f]}</span>
                              ) : f === 'urgency' ? (
                                <span style={{ ...(URG_COLORS[row[f]] || {}), padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>P{row[f]}</span>
                              ) : f === 'createdAt' ? (
                                <span style={{ color: '#475569', fontFamily: 'JetBrains Mono, monospace', fontSize: 11 }}>{new Date(row[f]).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                              ) : f === 'id' ? (
                                <span style={{ color: '#60a5fa', fontFamily: 'JetBrains Mono, monospace', fontSize: 11 }}>{row[f]}</span>
                              ) : f === 'email' ? (
                                <span style={{ color: '#a78bfa', fontFamily: 'JetBrains Mono, monospace', fontSize: 11 }}>{row[f]}</span>
                              ) : (
                                <span style={{ color: '#cbd5e1' }}>{String(row[f] || '—')}</span>
                              )}
                            </td>
                          ))}
                          <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }} onClick={e => e.stopPropagation()}>
                              <button onClick={() => startEdit(row)} className="btn-anim"
                                style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid #2d3748', background: 'transparent', color: '#60a5fa', fontSize: 11, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans', fontWeight: 600 }}>
                                Edit
                              </button>
                              <button onClick={() => setConfirmDelete(row.id)} className="btn-anim"
                                style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid #7f1d1d', background: 'rgba(239,68,68,0.08)', color: '#f87171', fontSize: 11, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans', fontWeight: 600 }}>
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr style={{ background: '#0d1117' }}>
                            <td colSpan={fields.length + 2} style={{ padding: '0 12px 12px' }}>
                              <div style={{ background: '#161b27', borderRadius: 10, padding: 16, border: '1px solid #1e2736', animation: 'fadeIn 0.2s ease' }}>
                                <p style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Full Record — {row.id}</p>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 10 }}>
                                  {Object.entries(row).filter(([k]) => k !== 'password' && k !== 'status_history').map(([k, v]) => (
                                    <div key={k} style={{ background: '#0d1117', borderRadius: 8, padding: '8px 12px', border: '1px solid #1e2736' }}>
                                      <p style={{ fontSize: 9, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>{k}</p>
                                      <p style={{ fontSize: 12, color: '#94a3b8', wordBreak: 'break-word', fontFamily: typeof v === 'string' && (k.includes('id') || k.includes('email') || k.includes('At')) ? 'JetBrains Mono, monospace' : 'inherit' }}>
                                        {typeof v === 'object' ? JSON.stringify(v).slice(0, 120) + '…' : String(v || '—')}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                                {row.status_history && (
                                  <div style={{ marginTop: 12 }}>
                                    <p style={{ fontSize: 10, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Status History ({row.status_history.length} entries)</p>
                                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                      {row.status_history.map((h, i) => (
                                        <div key={i} style={{ background: '#0d1117', border: '1px solid #1e2736', borderRadius: 8, padding: '6px 10px', fontSize: 11 }}>
                                          <span style={{ ...STATUS_COLORS[h.status], padding: '1px 6px', borderRadius: 4, fontSize: 10, fontWeight: 700, marginRight: 6 }}>{h.status}</span>
                                          <span style={{ color: '#475569', fontFamily: 'JetBrains Mono, monospace', fontSize: 10 }}>{new Date(h.timestamp).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Edit panel */}
        {editing && selected && (
          <div style={{ width: 360, background: '#0d1117', borderLeft: '1px solid #1e2736', display: 'flex', flexDirection: 'column', animation: 'fadeIn 0.2s ease' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #1e2736', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontWeight: 700, fontSize: 14, color: '#f1f5f9' }}>Edit Record</p>
                <p style={{ fontSize: 11, color: '#475569', fontFamily: 'JetBrains Mono, monospace', marginTop: 2 }}>{selected.id}</p>
              </div>
              <button onClick={() => { setEditing(false); setSelected(null) }}
                style={{ background: '#1e2736', border: 'none', color: '#94a3b8', cursor: 'pointer', borderRadius: 6, padding: '4px 10px', fontSize: 12, fontFamily: 'Plus Jakarta Sans' }}>
                ✕ Close
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {Object.entries(editForm).filter(([k]) => k !== 'password' && k !== 'id' && k !== 'createdAt' && k !== 'status_history' && k !== 'attachments').map(([key, val]) => (
                <div key={key}>
                  <label style={{ fontSize: 10, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>{key}</label>
                  {key === 'status' ? (
                    <select value={editForm[key] || ''} onChange={e => setEditForm(f => ({ ...f, [key]: e.target.value }))}
                      style={{ width: '100%', background: '#161b27', border: '1px solid #2d3748', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#e2e8f0', outline: 'none' }}>
                      {['Received', 'Under Review', 'In Progress', 'Resolved', 'Rejected'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  ) : key === 'urgency' ? (
                    <select value={editForm[key] || 3} onChange={e => setEditForm(f => ({ ...f, [key]: Number(e.target.value) }))}
                      style={{ width: '100%', background: '#161b27', border: '1px solid #2d3748', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#e2e8f0', outline: 'none' }}>
                      {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>P{n} — {['', 'Minimal', 'Low', 'Medium', 'High', 'Critical'][n]}</option>)}
                    </select>
                  ) : key === 'description' || key === 'summary' || key === 'urgency_reason' || key === 'ack_message' ? (
                    <textarea value={editForm[key] || ''} onChange={e => setEditForm(f => ({ ...f, [key]: e.target.value }))} rows={3}
                      style={{ width: '100%', background: '#161b27', border: '1px solid #2d3748', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#e2e8f0', outline: 'none', resize: 'vertical', fontFamily: 'Plus Jakarta Sans', lineHeight: 1.5 }} />
                  ) : key === 'is_duplicate' ? (
                    <select value={String(editForm[key])} onChange={e => setEditForm(f => ({ ...f, [key]: e.target.value === 'true' }))}
                      style={{ width: '100%', background: '#161b27', border: '1px solid #2d3748', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#e2e8f0', outline: 'none' }}>
                      <option value="false">false</option>
                      <option value="true">true</option>
                    </select>
                  ) : (
                    <input value={editForm[key] || ''} onChange={e => setEditForm(f => ({ ...f, [key]: e.target.value }))}
                      style={{ width: '100%', background: '#161b27', border: '1px solid #2d3748', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#e2e8f0', outline: 'none', fontFamily: typeof val === 'string' && (key.includes('id') || key.includes('email') || key.includes('Number')) ? 'JetBrains Mono, monospace' : 'Plus Jakarta Sans' }} />
                  )}
                </div>
              ))}
            </div>

            <div style={{ padding: '14px 20px', borderTop: '1px solid #1e2736', display: 'flex', gap: 8 }}>
              <button onClick={() => { setEditing(false); setSelected(null) }}
                style={{ flex: 1, padding: '10px', borderRadius: 9, border: '1px solid #2d3748', background: 'transparent', color: '#94a3b8', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'Plus Jakarta Sans' }}>
                Cancel
              </button>
              <button onClick={saveEdit} disabled={saving} className="btn-anim"
                style={{ flex: 1, padding: '10px', borderRadius: 9, border: 'none', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'Plus Jakarta Sans', opacity: saving ? 0.6 : 1 }}>
                {saving ? 'Saving…' : '✅ Save Changes'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
