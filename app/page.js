'use client'
import { useEffect, useState } from 'react'
const STATS = [{ value: '2,400+', label: 'Grievances Resolved' }, { value: '13', label: 'Categories' }, { value: '< 48hrs', label: 'Avg. Response Time' }]
const MARQUEE = ['Academic', 'Hostel', 'Examinations', 'Fee & Finance', 'Infrastructure', 'Faculty', 'Library', 'Transport', 'Scholarships', 'Sports', 'Canteen', 'IT Support']
export default function LandingPage() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 480px', height: '100vh' }}>
        {/* LEFT */}
        <div style={{ background: 'linear-gradient(145deg, #020817 0%, #0f172a 50%, #1e1b4b 100%)', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: '48px 56px' }}>
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 70%)', top: -100, left: -100, animation: 'pulse 6s ease-in-out infinite' }} />
            <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 70%)', bottom: 0, right: -50, animation: 'pulse 8s 2s ease-in-out infinite' }} />
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.04 }}>
              <defs><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/></pattern></defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
          <div className={mounted ? 'fade-up' : ''} style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 32, position: 'relative' }}>
            <div style={{ width: 48, height: 48, background: 'linear-gradient(135deg, #2563eb, #7c3aed)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(37,99,235,0.4)', flexShrink: 0 }}>
              <span style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 800, fontSize: 18, color: '#fff', letterSpacing: '-0.5px' }}>H</span>
            </div>
            <div>
              <p style={{ fontWeight: 700, fontSize: 15, color: '#fff', lineHeight: 1 }}>Hindusthan Institute of Technology</p>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 3 }}>Coimbatore, Tamil Nadu</p>
            </div>
          </div>
          <div style={{ flex: 1, position: 'relative' }}>
            <div className={mounted ? 'fade-up-1' : ''}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(37,99,235,0.3)', borderRadius: 999, padding: '6px 14px', marginBottom: 16 }}>
                <div style={{ width: 6, height: 6, background: '#3b82f6', borderRadius: '50%', boxShadow: '0 0 0 3px rgba(59,130,246,0.3)' }} />
                <span style={{ fontSize: 12, color: '#93c5fd', fontWeight: 600, letterSpacing: '0.05em' }}>Student Grievance Portal</span>
              </div>
              <h1 style={{ fontFamily: 'Plus Jakarta Sans', fontSize: 52, fontWeight: 800, color: '#fff', lineHeight: 1.1, letterSpacing: '-1.5px', marginBottom: 12 }}>
                Your Voice<br />
                <span style={{ background: 'linear-gradient(135deg, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Deserves</span>
                <br />to be Heard.
              </h1>
              <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, maxWidth: 400 }}>A transparent, AI-powered platform to raise, track, and resolve student grievances across all departments at HIT.</p>
            </div>
            <div className={mounted ? 'fade-up-2' : ''} style={{ margin: '20px 0', overflow: 'hidden' }}>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {MARQUEE.map(cat => (
                  <div key={cat} style={{ flexShrink: 0, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '6px 14px', fontSize: 12, color: 'rgba(255,255,255,0.55)', fontWeight: 500 }}>{cat}</div>
                ))}
              </div>
            </div>
            <div className={mounted ? 'fade-up-3' : ''} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              {[{ step: '01', title: 'Record', desc: 'Securely file your grievance with evidence.' },
                { step: '02', title: 'AI Driven', desc: 'Auto-categorization and priority routing.' },
                { step: '03', title: 'Resolution', desc: 'Track updates and results in real-time.' }].map((s, i) => (
                <div key={s.title} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '16px', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: -5, right: -5, fontSize: 56, fontWeight: 900, color: 'rgba(255,255,255,0.02)', fontFamily: 'Plus Jakarta Sans', lineHeight: 1 }}>{s.step}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', borderRadius: 6, fontSize: 11, fontWeight: 700, color: '#fff' }}>{i + 1}</div>
                    <p style={{ fontFamily: 'Plus Jakarta Sans', fontSize: 15, fontWeight: 700, color: '#fff' }}>{s.title}</p>
                  </div>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.4 }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* RIGHT */}
        <div style={{ background: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '24px 40px', borderLeft: '1px solid #e2e8f0' }}>
          <div className={mounted ? 'fade-up' : ''}>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: 8 }}>Welcome to HIT</p>
            <h2 style={{ fontFamily: 'Plus Jakarta Sans', fontSize: 28, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px', marginBottom: 8 }}>Choose your portal</h2>
            <p style={{ fontSize: 14, color: '#64748b', marginBottom: 24 }}>Select how you'd like to access the grievance system.</p>
            <a href="/auth/student" style={{ textDecoration: 'none', display: 'block', marginBottom: 12 }}>
              <div className="card" style={{ borderRadius: 16, padding: 24, border: '1.5px solid #e2e8f0', cursor: 'pointer', transition: 'all 0.25s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#2563eb'; e.currentTarget.style.background = '#eff6ff' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#fff' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                  <div style={{ width: 52, height: 52, background: 'linear-gradient(135deg, #eff6ff, #dbeafe)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0, border: '1px solid #bfdbfe' }}>🎓</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                      <p style={{ fontWeight: 700, fontSize: 16, color: '#0f172a' }}>Student Portal</p>
                      <span style={{ fontSize: 18, color: '#94a3b8' }}>→</span>
                    </div>
                    <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>Submit, track and manage your grievances using your HIT email.</p>
                    <div style={{ marginTop: 12, display: 'flex', gap: 6 }}>
                      {['Submit', 'Track', 'History'].map(t => <span key={t} style={{ fontSize: 11, background: '#eff6ff', color: '#1d4ed8', padding: '3px 8px', borderRadius: 6, fontWeight: 600 }}>{t}</span>)}
                    </div>
                  </div>
                </div>
              </div>
            </a>
            <a href="/auth/admin" style={{ textDecoration: 'none', display: 'block', marginBottom: 12 }}>
              <div className="card" style={{ borderRadius: 16, padding: 24, border: '1.5px solid #e2e8f0', cursor: 'pointer', transition: 'all 0.25s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#7c3aed'; e.currentTarget.style.background = '#f5f3ff' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#fff' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                  <div style={{ width: 52, height: 52, background: 'linear-gradient(135deg, #f5f3ff, #ede9fe)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0, border: '1px solid #ddd6fe' }}>🛡️</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                      <p style={{ fontWeight: 700, fontSize: 16, color: '#0f172a' }}>Administration</p>
                      <span style={{ fontSize: 18, color: '#94a3b8' }}>→</span>
                    </div>
                    <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>Review, prioritize and resolve student grievances across departments.</p>
                    <div style={{ marginTop: 12, display: 'flex', gap: 6 }}>
                      {['Review', 'Resolve', 'Analytics'].map(t => <span key={t} style={{ fontSize: 11, background: '#f5f3ff', color: '#6d28d9', padding: '3px 8px', borderRadius: 6, fontWeight: 600 }}>{t}</span>)}
                    </div>
                  </div>
                </div>
              </div>
            </a>


          </div>
        </div>
      </div>
    </div>
  )
}
