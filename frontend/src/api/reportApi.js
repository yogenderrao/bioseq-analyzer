const API_URL = 'http://127.0.0.1:8000/api/v1/report'

export async function downloadReport(payload) {
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

  const blob = await response.blob()
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url

  const disposition = response.headers.get('Content-Disposition') || ''
  const match = disposition.match(/filename="?(.+?)"?$/)
  a.download = match ? match[1] : 'bioseq_report.pdf'

  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  window.URL.revokeObjectURL(url)
}
