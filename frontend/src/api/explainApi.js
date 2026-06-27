const API_URL = 'http://127.0.0.1:8000/api/v1/explain'

export async function explainAnalysis(analysisResult) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(analysisResult),
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
