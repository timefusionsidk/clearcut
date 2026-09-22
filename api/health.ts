/** Lightweight deployment check that never exposes private configuration. */
const providerKeys: Record<string, string> = {
  removebg: 'REMOVEBG_API_KEY',
  clipdrop: 'CLIPDROP_API_KEY',
  photoroom: 'PHOTOROOM_API_KEY',
  replicate: 'REPLICATE_API_TOKEN',
}

export default function handler(req: Request) {
  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Use GET.' }), {
      status: 405,
      headers: { 'content-type': 'application/json', allow: 'GET', 'cache-control': 'no-store' },
    })
  }

  const provider = (process.env.BG_PROVIDER ?? 'removebg').toLowerCase()
  const keyName = providerKeys[provider]
  const configured = Boolean(keyName && process.env[keyName])
  return Response.json(
    { ok: configured, provider: keyName ? provider : 'unknown', configured },
    { status: configured ? 200 : 503, headers: { 'cache-control': 'no-store' } },
  )
}
