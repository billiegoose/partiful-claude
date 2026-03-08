import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import centralParkFixture from '../__fixtures__/photon/central-park.json'
import googleplexFixture from '../__fixtures__/photon/googleplex.json'
import emptyFixture from '../__fixtures__/photon/empty.json'
import { useLocationAutocomplete } from './useLocationAutocomplete'

const server = setupServer(
  http.get('https://photon.komoot.io/api', ({ request }) => {
    const q = new URL(request.url).searchParams.get('q') ?? ''
    if (q.toLowerCase().includes('central park')) return HttpResponse.json(centralParkFixture)
    if (q.toLowerCase().includes('1600')) return HttpResponse.json(googleplexFixture)
    return HttpResponse.json(emptyFixture)
  }),
)

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('useLocationAutocomplete', () => {
  it('returns formatted address suggestions for a recognized query', async () => {
    const { result } = renderHook(() => useLocationAutocomplete('Central Park New York'))
    await waitFor(() => expect(result.current.suggestions.length).toBeGreaterThan(0))
    expect(result.current.suggestions[0]).toBe('Central Park, New York, New York')
  })

  it('returns empty array for empty query without fetching', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    const { result } = renderHook(() => useLocationAutocomplete(''))
    // give any debounce time to elapse
    await new Promise(r => setTimeout(r, 400))
    expect(result.current.suggestions).toEqual([])
    expect(fetchSpy).not.toHaveBeenCalled()
    fetchSpy.mockRestore()
  })

  it('debounces — does not fetch before 300 ms', async () => {
    vi.useFakeTimers()
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    renderHook(() => useLocationAutocomplete('Central Park New York'))
    // advance less than debounce threshold
    vi.advanceTimersByTime(200)
    expect(fetchSpy).not.toHaveBeenCalled()
    vi.useRealTimers()
    fetchSpy.mockRestore()
  })

  it('returns empty array when API returns no features', async () => {
    const { result } = renderHook(() => useLocationAutocomplete('zzz-no-match'))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.suggestions).toEqual([])
  })

  it('formats address with housenumber and street', async () => {
    const { result } = renderHook(() => useLocationAutocomplete('1600 Amphitheatre'))
    await waitFor(() => expect(result.current.suggestions.length).toBeGreaterThan(0))
    // googleplex fixture: name, housenumber+street, city, state
    const hasStreetFormat = result.current.suggestions.some(s =>
      s.includes('Amphitheatre Parkway') && s.includes('Mountain View'),
    )
    expect(hasStreetFormat).toBe(true)
  })
})
