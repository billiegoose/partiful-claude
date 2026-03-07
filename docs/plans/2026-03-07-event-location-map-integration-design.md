# Design: Event Location Map Integration

**Date:** 2026-03-07
**Branch:** `claude/event-location-map-integration-1t56h`

## Summary

Add a Google Maps iframe preview to the EventPage location card, and make the location text in EventCard a clickable Google Maps link. Standardize all map links to the canonical `https://www.google.com/maps/search/?api=1&query=...` URL format.

## Changes

### EventPage — Location card

The "Where" card becomes a two-part block:

1. **Iframe map preview** — `<iframe src="https://maps.google.com/maps?q=...&output=embed">` rendered above the location text, ~160px tall, full card width. Lazy-loaded (`loading="lazy"`), no border, rounded top corners.
2. **Clickable footer** — existing location text + pin emoji as the bottom half of the card, linking to the canonical Google Maps URL. No change when `event.location` is null ("TBD" card shown as-is).

### EventCard — Location link

Location text changes from a plain `<p>` to an `<a>` linking to Google Maps in a new tab. Visual style (muted, small) is unchanged.

### URL format

All map links use: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`

The existing `maps.google.com/maps?q=` format on EventPage is updated to match.

## No new dependencies, API keys, or env vars required.
