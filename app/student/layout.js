'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
export default function StudentLayout({ children }) {
  const [student, setStudent] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const router = useRouter()
  const path = usePathname()
  useEffect(() => {
    const s = sessionStorage.getItem('hit_student')
    if (!s) { router.push('/auth/student'); return }
    setStudent(JSON.parse(s))
  }, [])
  const logout = () => { sessionStorage.removeItem('hit_student'); router.push('/') }
  const navLinks = [{ href: '/student/dashboard', label: 'Dashboard', icon: '⬡' }, { href: '/student/submit', label: 'Submit Grievance', icon: '✦' }, { href: '/student/grievances', label: 'My Grievances', icon: '◎' }]
  if (!student) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="spin" style={{ width: 36, height: 36, border: '3px solid #e2e8f0', borderTopColor: '#2563eb', borderRadius: '50%' }} /></div>
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <header style={{ background: '#fff', borderBottom: '1px solid #f1f5f9', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center' }}>
          <a href="/student/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginRight: 32, flexShrink: 0 }}>
            <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg, #2563eb, #7c3aed)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontWeight: 800, fontSize: 14, color: '#fff' }}>H</span></div>
            <span style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>HIT Portal</span>
          </a>
          <nav style={{ display: 'flex', gap: 4, flex: 1 }}>
            {navLinks.map(l => (
              <a key={l.href} href={l.href} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: 'none', color: path === l.href ? '#2563eb' : '#64748b', background: path === l.href ? '#eff6ff' : 'transparent', transition: 'all 0.15s' }}>
                <span style={{ fontSize: 12, color: path === l.href ? '#2563eb' : '#94a3b8' }}>{l.icon}</span>{l.label}
              </a>
            ))}
          </nav>
          <div style={{ position: 'relative' }}>
            <button onClick={() => setMenuOpen(o => !o)} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: '1px solid #f1f5f9', borderRadius: 999, padding: '6px 12px 6px 6px', cursor: 'pointer', transition: 'all 0.15s' }}>
              <div style={{ width: 28, height: 28, background: 'linear-gradient(135deg, #2563eb, #7c3aed)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff' }}>{student.name.charAt(0).toUpperCase()}</div>
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#0f172a', lineHeight: 1 }}>{student.name.split(' ')[0]}</p>
                <p style={{ fontSize: 10, color: '#94a3b8', lineHeight: 1, marginTop: 2 }}>{student.rollNumber}</p>
              </div>
              <span style={{ fontSize: 10, color: '#94a3b8', marginLeft: 2 }}>▾</span>
            </button>
            {menuOpen && (
              <div style={{ position: 'absolute', top: '110%', right: 0, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 8, minWidth: 200, boxShadow: '0 8px 32px rgba(0,0,0,0.1)', zIndex: 200 }} className="fade-in">
                <div style={{ padding: '8px 12px 12px', borderBottom: '1px solid #f1f5f9', marginBottom: 4 }}>
                  <p style={{ fontWeight: 600, fontSize: 13, color: '#0f172a' }}>{student.name}</p>
                  <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{student.email}</p>
                  <p style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{student.department} · {student.year}</p>
                </div>
                <button onClick={logout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#dc2626', borderRadius: 8, fontFamily: 'Plus Jakarta Sans' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}>🚪 Sign out</button>
              </div>
            )}
          </div>
        </div>
      </header>
      <div onClick={() => setMenuOpen(false)}>{children}</div>
    </div>
  )
}
