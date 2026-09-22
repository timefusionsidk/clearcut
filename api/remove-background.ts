/**
 * POST /api/remove-background
 *
 * Secure server-side background removal. The browser never sees a provider key.
 * Runs as a Vercel Node serverless function; the handler is a plain
 * (Request) => Response so it also drops into Netlify Functions, Cloudflare
 * Workers or any Web-standard runtime with no changes.
 *
 * Request:  multipart/form-data with a single `image` file part.
 * Response: image/png (transparent cutout) or { error, code } JSON.
 *
 * Image bytes live in memory for the duration of the request only. Nothing is
 * written to disk, no storage bucket is touched, and image data is never
 * logged, so there are no temporary files to expire or clean up.
 */

export const config = { runtime: 'edge' }

const MAX_BYTES = 10 * 1024 * 1024 // 10 MB
const ACCEPTED = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

type Fail = { status: number; code: string; error: string }

const fail = ({ status, code, error }: Fail) =>
  new Response(JSON.stringify({ code, error }), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  })

/* -------------------------------------------------------------------------- */
/* Rate limiting                                                              */
/* -------------------------------------------------------------------------- */
/**
 * Fixed-window counter per IP, held in instance memory. Good enough to stop a
 * single script from draining the AI quota. For strict limits across all
 * instances, swap this for Upstash Redis / Vercel KV — the interface is one
 * function, so only `hit()` changes.
 */
const buckets = new Map<string, { count: number; resetAt: number }>()
const WINDOW_MS = 60 * 60 * 1000

function hit(ip: string, limit: number) {
  const now = Date.now()
  const bucket = buckets.get(ip)
  if (!bucket || bucket.resetAt < now) {
    buckets.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    if (buckets.size > 5000) for (const [k, v] of buckets) if (v.resetAt < now) buckets.delete(k)
    return { ok: true, retryAfter: 0 }
  }
  bucket.count += 1
  if (bucket.count > limit) {
    return { ok: false, retryAfter: Math.ceil((bucket.resetAt - now) / 1000) }
  }
  return { ok: true, retryAfter: 0 }
}

const clientIp = (req: Request) =>
  req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
  req.headers.get('x-real-ip') ||
  'unknown'

/* -------------------------------------------------------------------------- */
/* Providers                                                                  */
/* -------------------------------------------------------------------------- */

type Provider = {
  /** Name shown in server logs (never includes the key). */
  id: string
  /** The env var holding this provider's secret. */
  keyName: string
  /** Send the image, return transparent PNG bytes. */
  run: (file: Blob, key: string) => Promise<ArrayBuffer>
}

const providers: Record<string, Provider> = {
  /** remove.bg — https://www.remove.bg/api */
  removebg: {
    id: 'removebg',
    keyName: 'REMOVEBG_API_KEY',
    async run(file, key) {
      const body = new FormData()
      body.append('image_file', file)
      body.append('size', 'auto')
      body.append('format', 'png')
      const res = await fetch('https://api.remove.bg/v1.0/removebg', {
        method: 'POST',
        headers: { 'X-Api-Key': key },
        body,
      })
      if (!res.ok) throw await providerError(res)
      return res.arrayBuffer()
    },
  },

  /** Clipdrop — https://clipdrop.co/apis/docs/remove-background */
  clipdrop: {
    id: 'clipdrop',
    keyName: 'CLIPDROP_API_KEY',
    async run(file, key) {
      const body = new FormData()
      body.append('image_file', file)
      const res = await fetch('https://clipdrop-api.co/remove-background/v1', {
        method: 'POST',
        headers: { 'x-api-key': key },
        body,
      })
      if (!res.ok) throw await providerError(res)
      return res.arrayBuffer()
    },
  },

  /** PhotoRoom — https://docs.photoroom.com */
  photoroom: {
    id: 'photoroom',
    keyName: 'PHOTOROOM_API_KEY',
    async run(file, key) {
      const body = new FormData()
      body.append('image_file', file)
      body.append('format', 'png')
      const res = await fetch('https://sdk.photoroom.com/v1/segment', {
        method: 'POST',
        headers: { 'x-api-key': key },
        body,
      })
      if (!res.ok) throw await providerError(res)
      return res.arrayBuffer()
    },
  },

  /**
   * Replicate — async model API, so this polls until the prediction resolves.
   * Set REPLICATE_MODEL_VERSION to pin a segmentation model version.
   */
  replicate: {
    id: 'replicate',
    keyName: 'REPLICATE_API_TOKEN',
    async run(file, key) {
      const version =
        readEnv('REPLICATE_MODEL_VERSION') ??
        'fb8af171cfa1616ddcf1242c093f9c46bcada5ad4cf6f2fbe8b81b330ec5c003' // rembg
      const dataUrl = `data:${file.type};base64,${toBase64(await file.arrayBuffer())}`

      const start = await fetch('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
        body: JSON.stringify({ version, input: { image: dataUrl } }),
      })
      if (!start.ok) throw await providerError(start)

      let prediction = await start.json()
      const deadline = Date.now() + 25_000
      while (['starting', 'processing'].includes(prediction.status)) {
        if (Date.now() > deadline) throw { status: 504, code: 'timeout' }
        await new Promise((r) => setTimeout(r, 900))
        const poll = await fetch(prediction.urls.get, {
          headers: { authorization: `Bearer ${key}` },
        })
        prediction = await poll.json()
      }
      if (prediction.status !== 'succeeded' || !prediction.output) {
        throw { status: 502, code: 'provider_failed' }
      }
      const out = Array.isArray(prediction.output) ? prediction.output[0] : prediction.output
      const png = await fetch(out)
      if (!png.ok) throw { status: 502, code: 'provider_failed' }
      return png.arrayBuffer()
    },
  },
}

async function providerError(res: Response) {
  // Read the body for a status code only — never log or forward provider text,
  // which can echo image metadata back to the client.
  await res.text().catch(() => '')
  if (res.status === 401 || res.status === 403) return { status: 500, code: 'bad_key' }
  if (res.status === 429) return { status: 429, code: 'busy' }
  if (res.status === 402) return { status: 503, code: 'quota' }
  return { status: 502, code: 'provider_failed' }
}

function toBase64(buf: ArrayBuffer) {
  const bytes = new Uint8Array(buf)
  let binary = ''
  for (let i = 0; i < bytes.length; i += 8192) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 8192))
  }
  return btoa(binary)
}

/** Works on Vercel/Netlify (process.env) and Workers (globalThis env bindings). */
function readEnv(name: string): string | undefined {
  const fromProcess =
    typeof process !== 'undefined' ? (process.env as Record<string, string | undefined>) : undefined
  return fromProcess?.[name] ?? (globalThis as Record<string, any>)[name]
}

/* -------------------------------------------------------------------------- */
/* Handler                                                                    */
/* -------------------------------------------------------------------------- */

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return fail({ status: 405, code: 'method', error: 'Use POST to remove a background.' })
  }

  const providerId = (readEnv('BG_PROVIDER') ?? 'removebg').toLowerCase()
  const provider = providers[providerId]
  if (!provider) {
    return fail({
      status: 500,
      code: 'not_configured',
      error: `Unknown BG_PROVIDER "${providerId}". Use removebg, clipdrop, photoroom or replicate.`,
    })
  }

  const key = readEnv(provider.keyName)
  if (!key) {
    // Surfaced in the UI as the developer-only "not connected yet" notice.
    return fail({
      status: 503,
      code: 'not_configured',
      error: 'AI background removal is not connected yet. Add a supported provider API key to enable processing.',
    })
  }

  const limit = Number(readEnv('RATE_LIMIT_PER_HOUR') ?? 20)
  const gate = hit(clientIp(req), Number.isFinite(limit) ? limit : 20)
  if (!gate.ok) {
    return new Response(
      JSON.stringify({ code: 'rate_limited', error: 'Too many images from this device. Try again later.' }),
      {
        status: 429,
        headers: {
          'content-type': 'application/json',
          'retry-after': String(gate.retryAfter),
          'cache-control': 'no-store',
        },
      },
    )
  }

  // Cheap pre-check before buffering the body at all.
  const declared = Number(req.headers.get('content-length') ?? 0)
  if (declared && declared > MAX_BYTES + 1024 * 512) {
    return fail({ status: 413, code: 'too_large', error: 'This image is larger than 10 MB.' })
  }

  let file: File | null = null
  try {
    const form = await req.formData()
    const entry = form.get('image')
    if (entry instanceof File) file = entry
  } catch {
    return fail({ status: 400, code: 'bad_request', error: 'Send the image as multipart/form-data.' })
  }

  if (!file) {
    return fail({ status: 400, code: 'bad_request', error: 'No image was included in the request.' })
  }

  // Server-side validation mirrors the client checks — the client ones are for
  // feedback, these are the ones that actually protect the AI quota.
  if (!ACCEPTED.includes(file.type.toLowerCase())) {
    return fail({ status: 415, code: 'bad_type', error: 'Please upload a JPG, PNG, or WEBP image.' })
  }
  if (file.size > MAX_BYTES) {
    return fail({ status: 413, code: 'too_large', error: 'This image is larger than 10 MB.' })
  }
  if (file.size < 128) {
    return fail({ status: 400, code: 'bad_request', error: 'That file looks empty. Try another image.' })
  }

  // Verify real magic bytes so a renamed .exe can't reach the provider.
  const head = new Uint8Array(await file.slice(0, 16).arrayBuffer())
  if (!looksLikeImage(head)) {
    return fail({ status: 415, code: 'bad_type', error: 'Please upload a JPG, PNG, or WEBP image.' })
  }

  try {
    const png = await provider.run(file, key)
    return new Response(png, {
      status: 200,
      headers: {
        'content-type': 'image/png',
        'cache-control': 'no-store, no-transform',
        'content-disposition': 'inline; filename="cutout.png"',
        'x-content-type-options': 'nosniff',
      },
    })
  } catch (err) {
    const e = err as { status?: number; code?: string }
    // Log the failure shape only. No image bytes, no filenames, no keys.
    console.error('[remove-background] provider=%s code=%s', provider.id, e?.code ?? 'unknown')

    switch (e?.code) {
      case 'busy':
      case 'quota':
        return fail({
          status: 503,
          code: 'busy',
          error: 'The service is busy right now. Please try again shortly.',
        })
      case 'bad_key':
        return fail({
          status: 500,
          code: 'not_configured',
          error: 'AI background removal is not connected yet. Add a supported provider API key to enable processing.',
        })
      case 'timeout':
        return fail({
          status: 504,
          code: 'busy',
          error: 'That took too long to process. Please try again shortly.',
        })
      default:
        return fail({
          status: 502,
          code: 'failed',
          error: 'We could not remove the background. Please try another image.',
        })
    }
  }
  // `file` and the PNG buffer are unreachable once the response is sent and are
  // reclaimed by the runtime. Nothing persists between requests.
}

function looksLikeImage(b: Uint8Array) {
  const jpeg = b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff
  const png = b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47
  const webp =
    b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
    b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50
  return jpeg || png || webp
}
