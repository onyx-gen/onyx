export default function useRenderer() {
  async function render(data = {}) {
    console.log('[useRenderer] Rendering', data)

    const response = await fetch('http://localhost:3000', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      console.error('[useRenderer] Response not ok', response)
      throw new Error('Response not ok')
    }

    return await response.text()
  }

  return { render }
}
