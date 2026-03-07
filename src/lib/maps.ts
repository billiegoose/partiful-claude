export function getGoogleMapsUrl(location: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`
}

export function getGoogleMapsEmbedUrl(location: string): string {
  return `https://maps.google.com/maps?q=${encodeURIComponent(location)}&output=embed`
}
