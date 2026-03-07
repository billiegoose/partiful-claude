import { describe, it, expect } from 'vitest'
import { getGoogleMapsUrl, getGoogleMapsEmbedUrl } from './maps'

describe('getGoogleMapsUrl', () => {
  it('returns canonical Maps search URL', () => {
    expect(getGoogleMapsUrl('123 Party St')).toBe(
      'https://www.google.com/maps/search/?api=1&query=123%20Party%20St'
    )
  })

  it('encodes special characters', () => {
    const url = getGoogleMapsUrl('Café & Bar, New York')
    expect(url).toContain('Caf%C3%A9%20%26%20Bar')
  })
})

describe('getGoogleMapsEmbedUrl', () => {
  it('returns legacy embed URL', () => {
    expect(getGoogleMapsEmbedUrl('123 Party St')).toBe(
      'https://maps.google.com/maps?q=123%20Party%20St&output=embed'
    )
  })

  it('encodes special characters', () => {
    const url = getGoogleMapsEmbedUrl('Café & Bar')
    expect(url).toContain('Caf%C3%A9%20%26%20Bar')
  })
})
