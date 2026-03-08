const BASE = '/api/v1'

export async function analyzeUpload(file, jobDescription) {
  const form = new FormData()
  form.append('resume', file)
  form.append('job_description', jobDescription)

  const res = await fetch(`${BASE}/analyze/upload`, {
    method: 'POST',
    body: form,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Unknown error' }))
    throw new Error(err.detail || `HTTP ${res.status}`)
  }
  return res.json()
}

export async function analyzeText(resumeText, jobDescription) {
  const res = await fetch(`${BASE}/analyze/text`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resume_text: resumeText, job_description: jobDescription }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Unknown error' }))
    throw new Error(err.detail || `HTTP ${res.status}`)
  }
  return res.json()
}

export async function checkHealth() {
  const res = await fetch('/health')
  return res.ok
}
