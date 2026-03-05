/**
 * Happy-path E2E walkthrough:
 * 1. Host is signed in by generating a magic link via Supabase admin API and
 *    exchanging the hashed_token via the verify endpoint — no real email, no rate limits.
 * 2. Host creates a new event
 * 3. Seed script injects fake RSVPs + a post + a boop in the background
 * 4. Host sees live RSVP count update and activity feed in real time
 * 5. Event is cleaned up
 *
 * Required env vars (set in .env.local or GitHub Actions secrets):
 *   VITE_SUPABASE_URL
 *   VITE_SUPABASE_ANON_KEY
 *   SUPABASE_SERVICE_ROLE_KEY
 *   E2E_HOST_EMAIL  — email of the pre-created test account
 *   E2E_HOST_USER_ID — UUID of that account
 */

import { test, expect, Page } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '../src/sdk/types'

const SUPABASE_URL = process.env.VITE_SUPABASE_URL ?? 'https://lspwjortevrlkklnykgy.supabase.co'
const ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY ?? 'sb_publishable_HJYHKsCSnmNyoxcYHMz31g_9S1AWrxG'
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const HOST_EMAIL = process.env.E2E_HOST_EMAIL ?? 'e2e-host@partiful-claude.test'
const HOST_USER_ID = process.env.E2E_HOST_USER_ID ?? '37f09518-2659-4dfa-9cf5-47dbfb8c0a60'

// Pre-created fake guests in Supabase auth (have real rows in auth.users for FK constraint)
const FAKE_GUEST_IDS = [
  '5b4c25d3-d105-47e8-add5-c49079bd37d9',
  'f842cfbd-588f-49e4-9fc0-610266bd7537',
  '2152217a-fdb6-426f-a6a5-40c4a79533b1',
]

const supabaseAdmin = createClient<Database>(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
})

/** Generate one session at suite start and reuse it for all tests. */
let sharedStorageEntry: { key: string; value: string } | null = null

async function getSharedStorageEntry(): Promise<{ key: string; value: string }> {
  if (sharedStorageEntry) return sharedStorageEntry

  // Generate a magic link via admin API (no email sent, no rate limit on generation)
  const genRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/generate_link`, {
    method: 'POST',
    headers: {
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ type: 'magiclink', email: HOST_EMAIL }),
  })
  if (!genRes.ok) throw new Error(`generate_link failed: ${await genRes.text()}`)
  const { hashed_token } = await genRes.json()

  // Exchange hashed_token via the verify endpoint — get tokens from the redirect URL
  // (no OTP rate limit applies here since we're using the hashed token, not the 6-digit OTP)
  const verifyRes = await fetch(
    `${SUPABASE_URL}/auth/v1/verify?token=${hashed_token}&type=magiclink&redirect_to=http://localhost`,
    { headers: { apikey: ANON_KEY }, redirect: 'manual' }
  )
  const location = verifyRes.headers.get('location') ?? ''
  const fragment = location.includes('#') ? location.split('#')[1] : ''
  const params = new URLSearchParams(fragment)
  const access_token = params.get('access_token')
  const refresh_token = params.get('refresh_token')
  const expires_at = params.get('expires_at')
  if (!access_token || !refresh_token) {
    throw new Error(`Could not parse tokens from redirect: ${location}`)
  }

  // Fetch user info from the access token
  const userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: ANON_KEY, Authorization: `Bearer ${access_token}` },
  })
  const user = await userRes.json()

  const projectRef = new URL(SUPABASE_URL).hostname.split('.')[0]
  const key = `sb-${projectRef}-auth-token`
  const value = JSON.stringify({
    access_token,
    refresh_token,
    expires_at: Number(expires_at),
    token_type: 'bearer',
    user,
  })

  sharedStorageEntry = { key, value }
  return sharedStorageEntry
}

async function injectSession(page: Page) {
  const entry = await getSharedStorageEntry()
  await page.addInitScript(
    ({ key, value }: { key: string; value: string }) => {
      localStorage.setItem(key, value)
    },
    entry
  )
}

test.describe.serial('Happy-path walkthrough', () => {
  let eventId: string
  let inviteToken: string

  test('home page shows empty state', async ({ page }) => {
    await injectSession(page)
    await page.goto('/partiful-claude/#/')
    await expect(page.getByText('your events')).toBeVisible()
    await page.screenshot({ path: 'screenshots/01-home-empty.png', fullPage: true })
  })

  test('host creates a new event', async ({ page }) => {
    await injectSession(page)
    await page.goto('/partiful-claude/#/e/new/edit')
    await expect(page.getByText('Create event').first()).toBeVisible()

    await page.getByPlaceholder('My awesome party').fill('End-of-Year Bash')

    // Set date/time to tomorrow evening
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(20, 0, 0, 0)
    const localISO = new Date(tomorrow.getTime() - tomorrow.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16)
    await page.locator('input[type="datetime-local"]').fill(localISO)
    await page.getByPlaceholder('123 Party St').fill('The Party Warehouse, Miami')
    await page.getByPlaceholder('Tell your guests what to expect...').fill(
      'Join us for the biggest party of the year! Food, drinks, and great company.'
    )

    // Pick Hype RSVP style
    await page.getByRole('button', { name: 'Hype' }).click()

    await page.screenshot({ path: 'screenshots/02-event-edit.png', fullPage: true })

    await page.getByRole('button', { name: 'Create event' }).click()

    await page.waitForURL(/\/#\/e\/[a-f0-9-]+$/, { timeout: 10000 })
    await expect(page.getByText('End-of-Year Bash')).toBeVisible()

    const url = page.url()
    inviteToken = url.match(/#\/e\/([a-f0-9-]+)$/)?.[1] ?? ''
    if (!inviteToken) throw new Error('No invite token in URL')

    const { data } = await supabaseAdmin
      .from('events')
      .select('id')
      .eq('invite_link_token', inviteToken)
      .single()
    if (!data) throw new Error('Event not found in DB')
    eventId = data.id

    await page.screenshot({ path: 'screenshots/03-event-page-empty.png', fullPage: true })
  })

  test('live RSVPs roll in via Realtime', async ({ page }) => {
    await injectSession(page)
    await page.goto(`/partiful-claude/#/e/${inviteToken}`)
    await expect(page.getByText('End-of-Year Bash')).toBeVisible()
    // Wait for the initial "0 going" count to render (confirms event loaded + Realtime subscribed)
    await expect(page.getByText('0 going')).toBeVisible({ timeout: 5000 })
    // Extra wait to ensure WebSocket connection is fully established before inserting
    await page.waitForTimeout(2000)

    // Inject RSVPs from fake guest users while page is open
    const { error: rsvpError } = await supabaseAdmin.from('rsvps').upsert([
      { event_id: eventId, user_id: FAKE_GUEST_IDS[0], status: 'yes' },
      { event_id: eventId, user_id: FAKE_GUEST_IDS[1], status: 'yes' },
      { event_id: eventId, user_id: FAKE_GUEST_IDS[2], status: 'yes' },
    ])
    if (rsvpError) throw new Error(`RSVP upsert failed: ${JSON.stringify(rsvpError)}`)

    // Wait for Realtime to push the update to the page
    await expect(page.getByText('3 going')).toBeVisible({ timeout: 15000 })
    await page.screenshot({ path: 'screenshots/04-live-rsvps.png', fullPage: true })
  })

  test('activity feed shows post and boop', async ({ page }) => {
    await injectSession(page)
    await page.goto(`/partiful-claude/#/e/${inviteToken}`)
    await expect(page.getByText('End-of-Year Bash')).toBeVisible()

    // Inject a post from the host
    await supabaseAdmin.from('event_posts').insert({
      event_id: eventId,
      author_id: HOST_USER_ID,
      body: 'Cannot wait to see everyone there! Dress to impress.',
    })

    await expect(page.getByText('Cannot wait to see everyone there').first()).toBeVisible({ timeout: 15000 })

    // Inject a boop from a fake guest to the host
    await supabaseAdmin.from('boops').insert({
      event_id: eventId,
      sender_id: FAKE_GUEST_IDS[0],
      recipient_id: HOST_USER_ID,
      emoji: '🎉',
    })

    await page.waitForTimeout(2000) // Let boop animation play
    await page.screenshot({ path: 'screenshots/05-activity-boop.png', fullPage: true })
  })

  test.afterAll(async () => {
    if (eventId) {
      await supabaseAdmin.from('events').delete().eq('id', eventId)
    }
  })
})
