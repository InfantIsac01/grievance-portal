'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
export default function AdminAuthPage() {
  const [form, setForm] = useState({ username: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [show, setShow] = useState(false)
  const router = useRouter()
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))
  const submit = async () => {
    if (!form.username || !form.password) { setError('Please fill in all fields.'); return }
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'admin_login', ...form }) }).then(r => r.json())
      if (res.success) {
        sessionStorage.setItem('hit_admin', JSON.stringify(res.admin))
        router.push('/admin/dashboard')
      } else setError(res.message || 'Invalid credentials.')
    } catch { setError('Network error. Please try again.') }
    setLoading(false)
  }
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #f5f3ff 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 440 }} className="fade-up">
        <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#64748b', textDecoration: 'none', marginBottom: 24, fontWeight: 500 }}>← Back to home</a>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ background: 'linear-gradient(135deg, #1e1b4b, #312e81)', padding: '28px 32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🛡️</div>
              <div><p style={{ fontWeight: 700, fontSize: 13, color: '#fff' }}>HIT Grievance Portal</p><p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Administration Access</p></div>
            </div>
            <h1 style={{ fontFamily: 'Plus Jakarta Sans', fontSize: 24, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>Admin Sign In</h1>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginTop: 4 }}>Access is restricted to authorized personnel only.</p>
          </div>
          <div style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div><label className="label">Admin Username</label><input value={form.username} onChange={set('username')} onKeyDown={e => e.key === 'Enter' && submit()} placeholder="Enter username" className="input" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13 }} autoFocus /></div>
            <div><label className="label">Password</label>
              <div style={{ position: 'relative' }}>
                <input value={form.password} onChange={set('password')} onKeyDown={e => e.key === 'Enter' && submit()} type={show ? 'text' : 'password'} placeholder="Enter admin password" className="input" style={{ paddingRight: 44 }} />
                <button onClick={() => setShow(s => !s)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: '#94a3b8' }}>{show ? '🙈' : '👁️'}</button>
              </div>
            </div>
            {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#dc2626' }}>⚠️ {error}</div>}
            <button onClick={submit} disabled={loading} className="btn" style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', color: '#fff', boxShadow: '0 4px 14px rgba(124,58,237,0.35)', fontSize: 15 }}>
              {loading ? <><span className="spin" style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block' }} />Verifying…</> : 'Access Dashboard →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
