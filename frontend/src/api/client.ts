const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:8000'

export async function apiGet<T>(
  endpoint: string
): Promise<T> {
  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      headers: {
        Accept: 'application/json',
      },
    }
  )

  if (!response.ok) {
    let message = ''

    try {
      const body = await response.json()

      if (
        body &&
        typeof body.detail === 'string'
      ) {
        message = body.detail
      }
    } catch {
      // Ignore non-JSON error bodies.
    }

    throw new Error(
      message ||
        `API request failed: ${response.status} ${response.statusText}`
    )
  }

  return response.json() as Promise<T>
}

export { API_BASE_URL }