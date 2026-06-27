const API_URL = 'http://127.0.0.1:8000/api/v1/fetch-sequence'

export async function fetchByAccession(accession) {
  const url = `${API_URL}?accession=${encodeURIComponent(accession)}`
  const response = await fetch(url)

  if (!response.ok) {
    let detail = `Server error (${response.status})`
    try {
      const err = await response.json()
      if (err.detail) detail = err.detail
    } catch {
      // ignore parse failure
    }
    throw new Error(detail)
  }

  return response.json()
}
