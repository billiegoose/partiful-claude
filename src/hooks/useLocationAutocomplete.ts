import { useEffect, useRef, useState } from 'react'

interface PhotonProperties {
  name?: string
  housenumber?: string
  street?: string
  city?: string
  state?: string
}

interface PhotonFeature {
  properties: PhotonProperties
}

interface PhotonResponse {
  features: PhotonFeature[]
}

function formatAddress(props: PhotonProperties): string {
  const parts: string[] = []
  if (props.name) parts.push(props.name)
  if (props.housenumber && props.street) {
    parts.push(`${props.housenumber} ${props.street}`)
  } else if (props.street && props.street !== props.name) {
    parts.push(props.street)
  }
  if (props.city) parts.push(props.city)
  if (props.state) parts.push(props.state)
  return parts.join(', ')
}

export function useLocationAutocomplete(query: string) {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([])
      return
    }

    const timer = setTimeout(async () => {
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller

      setLoading(true)
      try {
        const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5&lang=en`
        const res = await fetch(url, { signal: controller.signal })
        const data: PhotonResponse = await res.json()
        setSuggestions(data.features.map(f => formatAddress(f.properties)))
      } catch {
        // aborted or network error — leave suggestions unchanged
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  return { suggestions, loading }
}
