import React from 'react'

const STAGES = [
  'Extracting resume text…',
  'Generating BERT embeddings…',
  'Running FAISS similarity search…',
  'Analyzing with Claude AI…',
  'Compiling results…',
]

export default function LoadingState() {
  const [stage, setStage] = React.useState(0)

  React.useEffect(() => {
    const t = setInterval(() => setStage(s => Math.min(s + 1, STAGES.length - 1)), 2200)
    return () => clearInterval(t)
  }, [])

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '60px 20px',
      gap: 24,
    }}>
      {/* Spinner */}
      <div style={{
        width: 52, height: 52,
        border: '3px solid var(--faint)',
        borderTopColor: 'var(--accent)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />

      <div style={{ textAlign: 'center' }}>
        <div style={{
          fontSize: 13,
          color: 'var(--text)',
          marginBottom: 6,
          transition: 'all 0.4s',
        }}>
          {STAGES[stage]}
        </div>

        {/* Progress dots */}
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 14 }}>
          {STAGES.map((_, i) => (
            <div key={i} style={{
              width: 6, height: 6,
              borderRadius: '50%',
              background: i <= stage ? 'var(--accent)' : 'var(--faint)',
              transition: 'background 0.4s',
              boxShadow: i === stage ? '0 0 8px var(--accent)' : 'none',
            }} />
          ))}
        </div>
      </div>

      <div style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '0.1em' }}>
        Powered by BERT + Claude AI
      </div>
    </div>
  )
}
