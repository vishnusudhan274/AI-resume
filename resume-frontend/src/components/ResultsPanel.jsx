import React from 'react'
import ScoreRing from './ScoreRing.jsx'
import SkillTags from './SkillTags.jsx'

function StatCard({ label, value, delay }) {
  return (
    <div className={`animate-fadeUp delay-${delay}`} style={{
      background: 'var(--surface2)',
      border: '1px solid var(--border)',
      borderRadius: 10,
      padding: '16px 18px',
    }}>
      <div style={{ fontSize: 10, letterSpacing: '0.15em', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 14, color: 'var(--text)', fontWeight: 500 }}>{value || '—'}</div>
    </div>
  )
}

export default function ResultsPanel({ result }) {
  const { match_score, verdict, summary, matched_skills, missing_skills, suggestions, strengths, cosine_similarity } = result

  return (
    <div className="animate-fadeUp" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Score + Summary */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 14,
        padding: 28,
        display: 'grid',
        gridTemplateColumns: 'auto 1fr',
        gap: 32,
        alignItems: 'center',
      }}>
        <ScoreRing score={match_score} verdict={verdict} />
        <div>
          <div style={{ fontSize: 10, letterSpacing: '0.18em', color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 10 }}>
            AI Summary
          </div>
          <p style={{ color: 'var(--text)', lineHeight: 1.8, fontSize: 13 }}>{summary}</p>
          {cosine_similarity != null && (
            <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '0.1em' }}>BERT SIMILARITY</span>
              <div style={{ flex: 1, height: 4, background: 'var(--faint)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${(cosine_similarity * 100).toFixed(1)}%`,
                  background: 'linear-gradient(90deg, var(--accent), var(--accent2))',
                  borderRadius: 2,
                  animation: 'fillBar 1s ease both',
                }} />
              </div>
              <span style={{ fontSize: 11, color: 'var(--accent)', minWidth: 38 }}>
                {(cosine_similarity * 100).toFixed(1)}%
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Strength breakdown */}
      {strengths && (
        <div>
          <div style={{ fontSize: 10, letterSpacing: '0.18em', color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 12 }}>
            Profile Breakdown
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {Object.entries(strengths).map(([k, v], i) => (
              <StatCard key={k} label={k} value={v} delay={i + 1} />
            ))}
          </div>
        </div>
      )}

      {/* Skill tags */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 14,
        padding: 24,
      }}>
        <SkillTags matched={matched_skills} missing={missing_skills} />
      </div>

      {/* Suggestions */}
      {suggestions?.length > 0 && (
        <div>
          <div style={{ fontSize: 10, letterSpacing: '0.18em', color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 14 }}>
            AI Recommendations
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {suggestions.map((s, i) => (
              <div key={i} className={`animate-fadeUp delay-${Math.min(i + 1, 6)}`} style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderLeft: '3px solid var(--accent)',
                borderRadius: '0 10px 10px 0',
                padding: '13px 18px',
                display: 'flex',
                gap: 14,
                alignItems: 'flex-start',
              }}>
                <span style={{
                  fontFamily: 'Syne, sans-serif',
                  fontSize: 11,
                  fontWeight: 700,
                  color: 'var(--accent)',
                  minWidth: 22,
                  marginTop: 1,
                }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.7 }}>{s}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
