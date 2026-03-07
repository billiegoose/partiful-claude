# Event Location Map Integration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a Google Maps iframe preview to the EventPage location card, make EventCard location a clickable Google Maps link, and standardize all map URLs via a shared helper.

**Architecture:** A `getGoogleMapsUrl` / `getGoogleMapsEmbedUrl` helper in `src/lib/maps.ts` centralises URL construction. `EventPage` gains an `<iframe>` above the existing location text. `EventCard` wraps the location `<p>` in an `<a>`. No new dependencies or env vars.

**Tech Stack:** React 19, TypeScript (strict), Vitest for unit tests

---

### Task 1: Create `src/lib/maps.ts` with URL helpers

**Files:**
- Create: `src/lib/maps.ts`
- Create: `src/lib/maps.test.ts`

**Step 1: Write the failing tests**

Create `src/lib/maps.test.ts`:

```ts
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
```

**Step 2: Run tests to verify they fail**

```bash
npm run test:run src/lib/maps.test.ts
```

Expected: FAIL — `Cannot find module './maps'`

**Step 3: Implement `src/lib/maps.ts`**

```ts
export function getGoogleMapsUrl(location: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`
}

export function getGoogleMapsEmbedUrl(location: string): string {
  return `https://maps.google.com/maps?q=${encodeURIComponent(location)}&output=embed`
}
```

**Step 4: Run tests to verify they pass**

```bash
npm run test:run src/lib/maps.test.ts
```

Expected: PASS (4 tests)

**Step 5: Commit**

```bash
git add src/lib/maps.ts src/lib/maps.test.ts
git commit -m "feat: add getGoogleMapsUrl and getGoogleMapsEmbedUrl helpers"
```

---

### Task 2: Update `EventPage` — add iframe and fix link URL

**Files:**
- Modify: `src/pages/EventPage.tsx` (lines 175–193)

**Step 1: Read the current location block**

Open `src/pages/EventPage.tsx` and find the `{event.location ? (` block around line 175. The current block is:

```tsx
{event.location ? (
  <a
    href={`https://maps.google.com/maps?q=${encodeURIComponent(event.location)}`}
    target="_blank"
    rel="noopener noreferrer"
    className="p-card p-card-hover"
    style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 4, textDecoration: 'none', color: 'inherit' }}
  >
    <span style={{ fontSize: 20, marginBottom: 4 }}>📍</span>
    <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase' as const, color: 'var(--p-muted)' }}>Where</span>
    <span style={{ fontSize: 15, fontWeight: 500, lineHeight: 1.3 }}>{event.location}</span>
  </a>
) : (
  <div className="p-card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 4, opacity: 0.4 }}>
    <span style={{ fontSize: 20, marginBottom: 4 }}>📍</span>
    <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase' as const, color: 'var(--p-muted)' }}>Where</span>
    <span style={{ fontSize: 15, fontWeight: 500, lineHeight: 1.3 }}>TBD</span>
  </div>
)}
```

**Step 2: Add the import**

At the top of `src/pages/EventPage.tsx`, add an import alongside the other `src/lib` imports (or after the last import):

```ts
import { getGoogleMapsUrl, getGoogleMapsEmbedUrl } from '@/lib/maps'
```

**Step 3: Replace the location block**

Replace the entire `{event.location ? ( ... ) : ( ... )}` block with:

```tsx
{event.location ? (
  <div className="p-card p-card-hover" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
    <iframe
      src={getGoogleMapsEmbedUrl(event.location)}
      width="100%"
      height="160"
      style={{ border: 0, display: 'block', flexShrink: 0 }}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      title="Event location map"
    />
    <a
      href={getGoogleMapsUrl(event.location)}
      target="_blank"
      rel="noopener noreferrer"
      style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 2, textDecoration: 'none', color: 'inherit' }}
    >
      <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase' as const, color: 'var(--p-muted)' }}>Where</span>
      <span style={{ fontSize: 15, fontWeight: 500, lineHeight: 1.3 }}>{event.location}</span>
    </a>
  </div>
) : (
  <div className="p-card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 4, opacity: 0.4 }}>
    <span style={{ fontSize: 20, marginBottom: 4 }}>📍</span>
    <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase' as const, color: 'var(--p-muted)' }}>Where</span>
    <span style={{ fontSize: 15, fontWeight: 500, lineHeight: 1.3 }}>TBD</span>
  </div>
)}
```

Note: The `📍` emoji is removed from the location text footer since the map preview makes it redundant.

**Step 4: Run the full unit test suite**

```bash
npm run test:run
```

Expected: All tests pass (no regressions).

**Step 5: Commit**

```bash
git add src/pages/EventPage.tsx
git commit -m "feat: add Google Maps iframe preview to EventPage location card"
```

---

### Task 3: Update `EventCard` — location as clickable link

**Files:**
- Modify: `src/components/EventCard.tsx` (line 36)

**Step 1: Add the import**

At the top of `src/components/EventCard.tsx`, add:

```ts
import { getGoogleMapsUrl } from '@/lib/maps'
```

**Step 2: Replace the location line**

Current (line 36):
```tsx
{event.location && <p style={{ fontSize: 13, color: 'var(--p-muted)' }}>{event.location}</p>}
```

Replace with:
```tsx
{event.location && (
  <a
    href={getGoogleMapsUrl(event.location)}
    target="_blank"
    rel="noopener noreferrer"
    onClick={e => e.stopPropagation()}
    style={{ fontSize: 13, color: 'var(--p-muted)', textDecoration: 'none', display: 'block' }}
  >
    {event.location}
  </a>
)}
```

The `e.stopPropagation()` prevents the card's `onClick` navigation from firing when the user taps the location link.

**Step 3: Run the full unit test suite**

```bash
npm run test:run
```

Expected: All tests pass.

**Step 4: Commit**

```bash
git add src/components/EventCard.tsx
git commit -m "feat: make EventCard location a clickable Google Maps link"
```

---

### Task 4: Commit docs and push

**Step 1: Stage and commit docs**

```bash
git add docs/plans/2026-03-07-event-location-map-integration-design.md
git add docs/plans/2026-03-07-event-location-map-integration-plan.md
git add docs/adr/001-map-links-google-maps.md
git commit -m "docs: add map integration design, plan, and ADR 001"
```

**Step 2: Push the branch**

```bash
git push -u origin claude/event-location-map-integration-1t56h
```

---

## Testing Checklist (manual, after npm run dev)

- [ ] EventPage with a location: map iframe renders, clicking the location text opens Google Maps in a new tab
- [ ] EventPage without a location: "TBD" card shown, no iframe
- [ ] EventCard with a location: location text is a link, clicking it opens Google Maps, does NOT navigate to event page
- [ ] EventCard without a location: no location shown (unchanged)
