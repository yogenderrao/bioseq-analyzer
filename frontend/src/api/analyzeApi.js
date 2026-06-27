const API_URL = 'https://bioseq-analyzer-production.up.railway.app/api/v1/analyze'

export async function analyzeSequence(sequence, filename = null) {
  const payload = { sequence }

  if (filename) {
    payload.filename = filename
  }

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    let detail = `Server error (${response.status})`
    try {
      const err = await response.json()
      if (err.detail) {
        detail = err.detail
      }
    } catch {
      // ignore parse failure
    }
    throw new Error(detail)
  }

  return response.json()
}
