'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
export default function AdminLayout({ children }) {
  const [admin, setAdmin] = useState(null)
  const router = useRouter()
  useEffect(() => { const a = sessionStorage.getItem('hit_admin'); if (!a) { router.push('/auth/admin'); return } setAdmin(JSON.parse(a)) }, [])
  const logout = () => { sessionStorage.removeItem('hit_admin'); router.push('/') }
  if (!admin) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="spin" style={{ width: 36, height: 36, border: '3px solid #e2e8f0', borderTopColor: '#7c3aed', borderRadius: '50%' }} /></div>
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <header style={{ background: '#fff', borderBottom: '1px solid #f1f5f9', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <div style={{ maxWidth: 1300, margin: '0 auto', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', gap: 16 }}>
          <a href="/admin/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
            <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontWeight: 800, fontSize: 14, color: '#fff' }}>H</span></div>
            <div><span style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>HIT Admin</span><span style={{ fontSize: 11, color: '#94a3b8', marginLeft: 6 }}>Grievance Portal</span></div>
          </a>
          <div style={{ flex: 1 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ background: admin.role === 'super' ? 'linear-gradient(135deg, #fef3c7, #fde68a)' : '#f5f3ff', border: `1px solid ${admin.role === 'super' ? '#fde68a' : '#ddd6fe'}`, borderRadius: 999, padding: '5px 12px 5px 8px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 14 }}>{admin.role === 'super' ? '⭐' : '🛡️'}</span>
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, color: admin.role === 'super' ? '#92400e' : '#5b21b6', lineHeight: 1 }}>{admin.name}</p>
                {admin.category && <p style={{ fontSize: 10, color: admin.role === 'super' ? '#b45309' : '#7c3aed', lineHeight: 1, marginTop: 1 }}>{admin.category}</p>}
              </div>
            </div>
            <button onClick={logout} className="btn btn-ghost" style={{ padding: '6px 14px', fontSize: 13, color: '#dc2626' }}>Sign Out</button>
          </div>
        </div>
      </header>
      {children}
    </div>
  )
}
