# ADR 001: Use Google Maps links for event locations

**Date:** 2026-03-07
**Status:** Accepted

## Context

Event locations are stored as freeform text strings (e.g. "123 Party St, New York, NY"). When displaying a location in the app, we need a way to let users open it in a maps application. Several approaches were considered:

- **`geo:` URI scheme** — `geo:lat,lon` or `geo:0,0?q=address`. Intended as the universal standard for linking to map locations.
- **Universal Links / `maps://`** — Apple Maps deep link for iOS. Platform-specific.
- **Google Maps URL** — `https://www.google.com/maps/search/?api=1&query=...`. Opens Google Maps on web, Android, and via the Google Maps app on iOS.

## Decision

Use Google Maps URLs exclusively: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`

## Reasons

1. **`geo:` URIs have poor cross-platform support.** On desktop browsers, `geo:` links are largely unhandled — Chrome and Firefox do not open any maps app by default. On Android, `geo:` works, but behaviour varies by device. On iOS, `geo:` is not supported at all; Safari ignores it.

2. **Google Maps works everywhere.** On desktop it opens the Google Maps website. On Android it opens the Google Maps app (or falls back to the website). On iOS the Google Maps app registers as a handler for `google.com/maps` URLs if installed; otherwise the web version opens.

3. **No API key or geocoding needed.** The `/maps/search/?api=1&query=` endpoint accepts a plain text query, the same way a user would type an address into Google Maps. This matches how we store location data (freeform text).

4. **Familiarity.** Google Maps is the dominant maps product and the one most users expect to open when tapping a location.

## Trade-offs

- Users who prefer Apple Maps on iOS will not get native Apple Maps integration. This is an acceptable trade-off — Apple Maps can be set as the default on iOS 18+, but the `geo:` workaround for triggering it is unreliable on the web.
- Google Maps links depend on Google's URL structure remaining stable. The `?api=1` parameter indicates use of the Maps URLs API, which Google documents as stable.

## Consequences

- `EventPage` displays a Google Maps iframe preview and a clickable link to Google Maps.
- `EventCard` shows the location as a clickable Google Maps link.
- All link generation is centralised in a single `getGoogleMapsUrl(location: string)` helper to ensure consistency.
