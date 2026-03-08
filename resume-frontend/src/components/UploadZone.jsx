import React, { useRef, useState, useCallback } from 'react'

const ACCEPTED = ['.pdf', '.docx', '.txt']

export default function UploadZone({ file, onFile }) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef()

  const handle = useCallback((f) => {
    if (!f) return
    const ext = '.' + f.name.split('.').pop().toLowerCase()
    if (!ACCEPTED.includes(ext)) {
      alert('Unsupported file type. Please upload PDF, DOCX, or TXT.')
      return
    }
    onFile(f)
  }, [onFile])

  const onDrop = useCallback((e) => {
    e.preventDefault()
    setDragging(false)
    handle(e.dataTransfer.files[0])
  }, [handle])

  return (
    <div>
      <label style={{ fontSize: 10, letterSpacing: '0.18em', color: 'var(--accent)', textTransform: 'uppercase', display: 'block', marginBottom: 10 }}>
        Resume File
      </label>

      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        style={{
          border: `2px dashed ${dragging ? 'var(--accent)' : file ? 'var(--green)' : 'var(--border2)'}`,
          borderRadius: 10,
          padding: '28px 20px',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 0.25s',
          background: dragging
            ? 'rgba(91,107,255,0.06)'
            : file
            ? 'rgba(0,229,160,0.04)'
            : 'rgba(255,255,255,0.01)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Scan line animation when dragging */}
        {dragging && (
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'linear-gradient(transparent 40%, rgba(91,107,255,0.08) 50%, transparent 60%)',
            animation: 'scan 1.2s linear infinite',
          }} />
        )}

        {file ? (
          <div>
            <div style={{ fontSize: 28, marginBottom: 6 }}>✓</div>
            <div style={{ color: 'var(--green)', fontWeight: 500, fontSize: 13 }}>{file.name}</div>
            <div style={{ color: 'var(--muted)', fontSize: 11, marginTop: 4 }}>
              {(file.size / 1024).toFixed(1)} KB · Click to change
            </div>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: 32, marginBottom: 8, filter: 'grayscale(0.5)' }}>📄</div>
            <div style={{ color: 'var(--text)', fontSize: 13, marginBottom: 4 }}>
              Drop your resume here
            </div>
            <div style={{ color: 'var(--muted)', fontSize: 11 }}>
              PDF, DOCX, TXT · Max 10 MB
            </div>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx,.txt"
        style={{ display: 'none' }}
        onChange={(e) => handle(e.target.files[0])}
      />
    </div>
  )
}
