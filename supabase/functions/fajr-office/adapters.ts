import { OfficeDenied, OfficeConflict } from './handler.ts'

// Server-only. No VITE_* setting, client JWT decoding, or direct table access.
const project = 'https://krzxajtrhvupyywovdzy.supabase.co'
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const statuses = ['received', 'reviewing', 'contacted', 'closed']
type Config = { enabled: boolean; origin: string; projectUrl: string; serverKey: string }
type Row = { id: string; service: string; destination: string; variant: string; contact: string; status: string; created_at: string }

function object(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}
function row(value: unknown): Row {
  if (!object(value) || typeof value.id !== 'string' || !uuid.test(value.id)
    || !['service', 'destination', 'variant', 'contact', 'status', 'created_at'].every(key => typeof value[key] === 'string')
    || !statuses.includes(String(value.status)) || !Number.isFinite(Date.parse(String(value.created_at)))) {
    throw new Error('invalid office response')
  }
  // Explicit projection: never forward extra RPC fields to the browser.
  return { id: value.id, service: value.service as string, destination: value.destination as string,
    variant: value.variant as string, contact: value.contact as string,
    status: value.status as string, created_at: value.created_at as string }
}

// Default quota is the shared atomic RPC. Injection is for tests or reviewed backends.
// Construction does not enable or register an HTTP endpoint.
export function officeDependencies(config: Config, takeSlot: ((user: string) => Promise<boolean>) | undefined = undefined, fetcher: typeof fetch = fetch) {
  const base = new URL(config.projectUrl)
  if (base.origin !== project || base.pathname !== '/' || base.search || base.hash || base.username || base.password
    || !config.serverKey || (takeSlot !== undefined && typeof takeSlot !== 'function')) throw new Error('invalid office configuration')
  const call = async (path: string, init: RequestInit) => {
    const response = await fetcher(new URL(path, project), { ...init, redirect: 'error', signal: AbortSignal.timeout(8000) })
    return response
  }
  const rpc = async (name: string, payload: object) => {
    const response = await call('/rest/v1/rpc/' + name, { method: 'POST',
      headers: { apikey: config.serverKey, Authorization: 'Bearer ' + config.serverKey, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload) })
    if (!response.ok) {
      // Read only a code, never expose SQL messages, hints, or database details.
      const failure: unknown = await response.json().catch(() => null)
      if (object(failure) && failure.code === '42501') throw new OfficeDenied()
      if (object(failure) && failure.code === '40001') throw new OfficeConflict()
      throw new Error('office unavailable')
    }
    return response.json() as Promise<unknown>
  }
  return {
    enabled: config.enabled,
    origin: config.origin,
    rateLimit: takeSlot ?? (async (actor: string) => {
      const result = await rpc('fajr_office_take_slot', { actor })
      if (typeof result !== 'boolean') throw new Error('invalid quota response')
      return result
    }),
    verify: async (token: string): Promise<string | null> => {
      // A fresh Auth request, not getSession/user_metadata or a decoded JWT claim.
      const response = await call('/auth/v1/user', { method: 'GET',
        headers: { apikey: config.serverKey, Authorization: 'Bearer ' + token } })
      if (response.status === 401 || response.status === 403) return null
      if (!response.ok) throw new Error('auth unavailable')
      const user: unknown = await response.json()
      return object(user) && typeof user.id === 'string' && uuid.test(user.id)
        && user.role === 'authenticated' && user.is_anonymous !== true ? user.id : null
    },
    list: async (actor: string, offset: number): Promise<Row[]> => {
      const result = await rpc('fajr_office_list', { actor, row_offset: offset })
      if (!Array.isArray(result) || result.length > 25) throw new Error('invalid office response')
      return result.map(row)
    },
    change: async (actor: string, id: string, expected: string, status: string) => {
      const result = await rpc('fajr_office_change', { actor, request_uuid: id, expected_status: expected, next_status: status })
      if (!object(result) || result.id !== id || result.status !== status) throw new Error('invalid office response')
      return { id, status }
    },
  }
}
