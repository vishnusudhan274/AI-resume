import React, { useState, useEffect, useCallback } from 'react'
import Header from './components/Header.jsx'
import UploadZone from './components/UploadZone.jsx'
import ResultsPanel from './components/ResultsPanel.jsx'
import LoadingState from './components/LoadingState.jsx'
import { analyzeUpload, analyzeText, checkHealth } from './services/api.js'

export default function App() {
  const [backendOk, setBackendOk] = useState(null)
  const [file, setFile] = useState(null)
  const [resumeText, setResumeText] = useState('')
  const [jobDesc, setJobDesc] = useState('')
  const [inputMode, setInputMode] = useState('file') // 'file' | 'text'
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  // Health check
  useEffect(() => {
    checkHealth().then(setBackendOk).catch(() => setBackendOk(false))
  }, [])

  const handleAnalyze = useCallback(async () => {
    setError('')
    setResult(null)
    setLoading(true)
    try {
      let data
      if (inputMode === 'file' && file) {
        data = await analyzeUpload(file, jobDesc)
      } else {
        data = await analyzeText(resumeText, jobDesc)
      }
      setResult(data)
    } catch (e) {
      setError(e.message || 'Something went wrong. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }, [inputMode, file, resumeText, jobDesc])

  const canSubmit = !loading && jobDesc.trim().length >= 30 &&
    (inputMode === 'file' ? !!file : resumeText.trim().length >= 50)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Ambient grid background */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        backgroundImage: `
          linear-gradient(rgba(91,107,255,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(91,107,255,0.03) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <Header backendOk={backendOk} />

        <main style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 24px 80px' }}>

          {/* Hero */}
          <div className="animate-fadeUp" style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{
              display: 'inline-block',
              padding: '5px 16px',
              borderRadius: 20,
              background: 'rgba(91,107,255,0.1)',
              border: '1px solid rgba(91,107,255,0.25)',
              fontSize: 11,
              color: 'var(--accent)',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              marginBottom: 20,
            }}>
              BERT · FAISS · Claude AI
            </div>
            <h1 style={{
              fontFamily: 'Syne, sans-serif',
              fontSize: 'clamp(32px, 6vw, 60px)',
              fontWeight: 800,
              color: '#fff',
              lineHeight: 1.05,
              marginBottom: 14,
              letterSpacing: '-0.03em',
            }}>
              Analyze Your Resume<br />
              <span style={{
                background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>Against Any Job</span>
            </h1>
            <p style={{ color: 'var(--muted)', fontSize: 14, letterSpacing: '0.02em' }}>
              Upload your resume · paste a job description · get instant AI feedback
            </p>
          </div>

          {/* Input Panel */}
          <div className="animate-fadeUp delay-2" style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 16,
            padding: 28,
            marginBottom: 24,
          }}>
            {/* Mode toggle */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
              {['file', 'text'].map(m => (
                <button key={m} onClick={() => { setInputMode(m); setResult(null) }} style={{
                  padding: '7px 18px',
                  borderRadius: 8,
                  border: `1px solid ${inputMode === m ? 'var(--accent)' : 'var(--border)'}`,
                  background: inputMode === m ? 'rgba(91,107,255,0.12)' : 'transparent',
                  color: inputMode === m ? 'var(--accent)' : 'var(--muted)',
                  fontSize: 12,
                  fontFamily: 'DM Mono, monospace',
                  cursor: 'pointer',
                  letterSpacing: '0.08em',
                  transition: 'all 0.2s',
                }}>
                  {m === 'file' ? '📄 Upload File' : '✏️ Paste Text'}
                </button>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              {/* Left: Resume input */}
              <div>
                {inputMode === 'file' ? (
                  <UploadZone file={file} onFile={setFile} />
                ) : (
                  <div>
                    <label style={{ fontSize: 10, letterSpacing: '0.18em', color: 'var(--accent)', textTransform: 'uppercase', display: 'block', marginBottom: 10 }}>
                      Resume Text
                    </label>
                    <textarea
                      value={resumeText}
                      onChange={e => setResumeText(e.target.value)}
                      placeholder="Paste your full resume text here..."
                      style={{
                        width: '100%',
                        height: 200,
                        background: 'rgba(0,0,0,0.3)',
                        border: '1px solid var(--border2)',
                        borderRadius: 10,
                        color: 'var(--text)',
                        fontFamily: 'DM Mono, monospace',
                        fontSize: 12,
                        padding: '12px 14px',
                        resize: 'vertical',
                        outline: 'none',
                        lineHeight: 1.7,
                        transition: 'border-color 0.2s',
                      }}
                      onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                      onBlur={e => e.target.style.borderColor = 'var(--border2)'}
                    />
                  </div>
                )}
              </div>

              {/* Right: Job description */}
              <div>
                <label style={{ fontSize: 10, letterSpacing: '0.18em', color: 'var(--accent)', textTransform: 'uppercase', display: 'block', marginBottom: 10 }}>
                  Job Description
                </label>
                <textarea
                  value={jobDesc}
                  onChange={e => setJobDesc(e.target.value)}
                  placeholder={`Paste the full job description here...\n\nInclude:\n• Role & responsibilities\n• Required skills\n• Qualifications`}
                  style={{
                    width: '100%',
                    height: 200,
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid var(--border2)',
                    borderRadius: 10,
                    color: 'var(--text)',
                    fontFamily: 'DM Mono, monospace',
                    fontSize: 12,
                    padding: '12px 14px',
                    resize: 'vertical',
                    outline: 'none',
                    lineHeight: 1.7,
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border2)'}
                />
              </div>
            </div>

            {/* Analyze button */}
            <button
              onClick={handleAnalyze}
              disabled={!canSubmit}
              style={{
                width: '100%',
                marginTop: 20,
                padding: '15px 20px',
                borderRadius: 10,
                border: 'none',
                background: canSubmit
                  ? 'linear-gradient(135deg, var(--accent), var(--accent2))'
                  : 'var(--faint)',
                color: canSubmit ? '#fff' : 'var(--muted)',
                fontFamily: 'Syne, sans-serif',
                fontWeight: 700,
                fontSize: 14,
                letterSpacing: '0.06em',
                cursor: canSubmit ? 'pointer' : 'not-allowed',
                transition: 'all 0.25s',
                boxShadow: canSubmit ? '0 4px 24px rgba(91,107,255,0.3)' : 'none',
              }}
              onMouseEnter={e => canSubmit && (e.target.style.transform = 'translateY(-2px)')}
              onMouseLeave={e => (e.target.style.transform = 'none')}
            >
              {loading ? '⟳  Analyzing…' : '⚡  Analyze Resume'}
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="animate-fadeIn" style={{
              background: 'rgba(255,92,122,0.08)',
              border: '1px solid rgba(255,92,122,0.3)',
              borderRadius: 10,
              padding: '14px 18px',
              color: 'var(--red)',
              fontSize: 13,
              marginBottom: 24,
            }}>
              ⚠ {error}
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 14,
            }}>
              <LoadingState />
            </div>
          )}

          {/* Results */}
          {result && !loading && <ResultsPanel result={result} />}

        </main>
      </div>
    </div>
  )
}
