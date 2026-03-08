import React from 'react'

function scoreColor(s) {
  if (s >= 75) return 'var(--green)'
  if (s >= 50) return 'var(--yellow)'
  return 'var(--red)'
}

export default function ScoreRing({ score, verdict }) {
  const r = 52
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  const color = scoreColor(score)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <div style={{ position: 'relative', width: 140, height: 140 }}>
        <svg width="140" height="140" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="70" cy="70" r={r} fill="none" stroke="var(--faint)" strokeWidth="10" />
          <circle
            cx="70" cy="70" r={r}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            style={{
              filter: `drop-shadow(0 0 8px ${color})`,
              transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)',
            }}
          />
        </svg>
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{
            fontFamily: 'Syne, sans-serif',
            fontSize: 32, fontWeight: 800,
            color, lineHeight: 1,
            animation: 'countUp 0.6s ease both',
          }}>{score}</span>
          <span style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '0.1em' }}>/ 100</span>
        </div>
      </div>

      <div style={{
        padding: '5px 14px',
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.12em',
        background: `${color}18`,
        color,
        border: `1px solid ${color}40`,
      }}>
        {verdict}
      </div>
    </div>
  )
}
