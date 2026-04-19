'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
const DEPARTMENTS = ['B.E. Computer Science','B.E. Electronics & Communication','B.E. Electrical & Electronics','B.E. Mechanical','B.E. Civil','B.Tech Information Technology','MBA','MCA','M.E. Computer Science','M.E. VLSI','Other']
const YEARS = ['1st Year','2nd Year','3rd Year','4th Year','PG 1st Year','PG 2nd Year']
export default function StudentAuthPage() {
  const [tab, setTab] = useState('login')
  const router = useRouter()
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 480 }} className="fade-up">
        <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#64748b', textDecoration: 'none', marginBottom: 24, fontWeight: 500 }}>← Back to home</a>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ background: 'linear-gradient(135deg, #020817, #1e1b4b)', padding: '28px 32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, #2563eb, #7c3aed)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🎓</div>
              <div><p style={{ fontWeight: 700, fontSize: 13, color: '#fff' }}>HIT Grievance Portal</p><p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Student Access</p></div>
            </div>
            <h1 style={{ fontFamily: 'Plus Jakarta Sans', fontSize: 24, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>{tab === 'login' ? 'Welcome back' : 'Create account'}</h1>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginTop: 4 }}>{tab === 'login' ? 'Sign in with your HIT email' : 'Register with your HIT institutional email'}</p>
          </div>
          <div style={{ display: 'flex', borderBottom: '1px solid #f1f5f9' }}>
            {[['login','Sign In'],['register','Register']].map(([k,l]) => (
              <button key={k} onClick={() => setTab(k)} style={{ flex: 1, padding: '14px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600, fontFamily: 'Plus Jakarta Sans', transition: 'all 0.2s', borderBottom: `2px solid ${tab === k ? '#2563eb' : 'transparent'}`, color: tab === k ? '#2563eb' : '#94a3b8', marginBottom: -1 }}>{l}</button>
            ))}
          </div>
          <div style={{ padding: '28px 32px' }}>
            {tab === 'login' ? <LoginForm router={router} /> : <RegisterForm onSuccess={() => setTab('login')} />}
          </div>
        </div>
      </div>
    </div>
  )
}
function LoginForm({ router }) {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [show, setShow] = useState(false)
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))
  const submit = async () => {
    if (!form.email || !form.password) { setError('Please fill in all fields.'); return }
    if (!form.email.endsWith('@hit.edu.in')) { setError('Please use your HIT email (@hit.edu.in).'); return }
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'login', ...form }) }).then(r => r.json())
      if (res.success) { sessionStorage.setItem('hit_student', JSON.stringify(res.student)); router.push('/student/dashboard') }
      else setError(res.message || 'Invalid email or password.')
    } catch { setError('Network error. Please try again.') }
    setLoading(false)
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div><label className="label">HIT Email</label><input value={form.email} onChange={set('email')} onKeyDown={e => e.key === 'Enter' && submit()} type="email" placeholder="rollno@hit.edu.in" className="input" /></div>
      <div><label className="label">Password</label>
        <div style={{ position: 'relative' }}>
          <input value={form.password} onChange={set('password')} onKeyDown={e => e.key === 'Enter' && submit()} type={show ? 'text' : 'password'} placeholder="Enter your password" className="input" style={{ paddingRight: 44 }} />
          <button onClick={() => setShow(s => !s)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#94a3b8' }}>{show ? '🙈' : '👁️'}</button>
        </div>
      </div>
      {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#dc2626' }}>⚠️ {error}</div>}
      <button onClick={submit} disabled={loading} className="btn btn-blue" style={{ width: '100%', padding: '14px', marginTop: 4, fontSize: 15 }}>
        {loading ? <><span className="spin" style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block' }} />Signing in…</> : 'Sign In →'}
      </button>
    </div>
  )
}
function RegisterForm({ onSuccess }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', department: '', year: '', rollNumber: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [show, setShow] = useState(false)
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))
  const submit = async () => {
    if (!form.name || !form.email || !form.password || !form.department || !form.year || !form.rollNumber) { setError('Please fill in all fields.'); return }
    if (!form.email.endsWith('@hit.edu.in')) { setError('Only HIT emails allowed (@hit.edu.in).'); return }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return }
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return }
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'register', ...form }) }).then(r => r.json())
      if (res.success) { alert('Account created! Please sign in.'); onSuccess() }
      else setError(res.message || 'Registration failed.')
    } catch { setError('Network error.') }
    setLoading(false)
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={{ gridColumn: 'span 2' }}><label className="label">Full Name</label><input value={form.name} onChange={set('name')} placeholder="Your full name" className="input" /></div>
        <div style={{ gridColumn: 'span 2' }}><label className="label">HIT Email</label><input value={form.email} onChange={set('email')} type="email" placeholder="rollno@hit.edu.in" className="input" /></div>
        <div><label className="label">Roll / Register No.</label><input value={form.rollNumber} onChange={set('rollNumber')} placeholder="e.g. 22CSE001" className="input" /></div>
        <div><label className="label">Year</label><select value={form.year} onChange={set('year')} className="input"><option value="">Select year</option>{YEARS.map(y => <option key={y} value={y}>{y}</option>)}</select></div>
        <div style={{ gridColumn: 'span 2' }}><label className="label">Department</label><select value={form.department} onChange={set('department')} className="input"><option value="">Select department</option>{DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}</select></div>
        <div><label className="label">Password</label>
          <div style={{ position: 'relative' }}>
            <input value={form.password} onChange={set('password')} type={show ? 'text' : 'password'} placeholder="Min 6 characters" className="input" style={{ paddingRight: 44 }} />
            <button onClick={() => setShow(s => !s)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: '#94a3b8' }}>{show ? '🙈' : '👁️'}</button>
          </div>
        </div>
        <div><label className="label">Confirm Password</label><input value={form.confirm} onChange={set('confirm')} type="password" placeholder="Repeat password" className="input" /></div>
      </div>
      {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#dc2626' }}>⚠️ {error}</div>}
      <button onClick={submit} disabled={loading} className="btn btn-blue" style={{ width: '100%', padding: '14px', marginTop: 4 }}>
        {loading ? 'Creating account…' : 'Create Account →'}
      </button>
    </div>
  )
}
