import React from 'react'

export default function SkillTags({ matched = [], missing = [] }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
      <div>
        <div style={{ fontSize: 10, letterSpacing: '0.18em', color: 'var(--green)', textTransform: 'uppercase', marginBottom: 12 }}>
          ✓ Matched Skills
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
          {matched.length ? matched.map((s, i) => (
            <span key={i} style={{
              padding: '4px 11px', borderRadius: 20, fontSize: 12,
              background: 'rgba(0,229,160,0.1)',
              color: 'var(--green)',
              border: '1px solid rgba(0,229,160,0.25)',
              animation: 'fadeIn 0.3s ease both',
              animationDelay: `${i * 0.04}s`,
            }}>{s}</span>
          )) : <span style={{ color: 'var(--muted)', fontSize: 12 }}>None detected</span>}
        </div>
      </div>

      <div>
        <div style={{ fontSize: 10, letterSpacing: '0.18em', color: 'var(--red)', textTransform: 'uppercase', marginBottom: 12 }}>
          ✗ Missing Skills
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
          {missing.length ? missing.map((s, i) => (
            <span key={i} style={{
              padding: '4px 11px', borderRadius: 20, fontSize: 12,
              background: 'rgba(255,92,122,0.1)',
              color: 'var(--red)',
              border: '1px solid rgba(255,92,122,0.25)',
              animation: 'fadeIn 0.3s ease both',
              animationDelay: `${i * 0.04}s`,
            }}>{s}</span>
          )) : <span style={{ color: 'var(--muted)', fontSize: 12 }}>None — great coverage!</span>}
        </div>
      </div>
    </div>
  )
}
