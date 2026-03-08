import React from 'react'

export default function Header({ backendOk }) {
  return (
    <header style={{
      borderBottom: '1px solid var(--border)',
      padding: '0 40px',
      height: '60px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      backdropFilter: 'blur(12px)',
      background: 'rgba(7,8,15,0.8)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 32, height: 32,
          background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
          borderRadius: 8,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, fontWeight: 800, color: '#fff',
          fontFamily: 'Syne, sans-serif',
        }}>R</div>
        <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16, color: '#fff' }}>
          ResumeAI
        </span>
        <span style={{ color: 'var(--muted)', fontSize: 11, letterSpacing: '0.1em' }}>/ ANALYZER</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          width: 7, height: 7, borderRadius: '50%',
          background: backendOk === true ? 'var(--green)' : backendOk === false ? 'var(--red)' : 'var(--muted)',
          boxShadow: backendOk === true ? '0 0 8px var(--green)' : 'none',
          animation: backendOk === true ? 'pulse 2s infinite' : 'none',
        }} />
        <span style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '0.08em' }}>
          {backendOk === true ? 'API ONLINE' : backendOk === false ? 'API OFFLINE' : 'CHECKING…'}
        </span>
      </div>
    </header>
  )
}
