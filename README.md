# ClearCut

ClearCut is a privacy-first, ad-supported web app for removing an image background. It has no user accounts and never writes uploaded images to application storage.

## What is included

- JPG, PNG and WebP upload validation (10 MB maximum)
- Server-side removal using remove.bg, Clipdrop, PhotoRoom or Replicate
- In-browser result editor: transparent, colour, gradient, image and blurred backgrounds; subject adjustments and shadow
- PNG and JPG downloads
- Rewarded-ad download gate, including a local-development-only simulation
- No image database or storage bucket

## Run locally

1. Copy `.env.example` to `.env.local` and add **one** background-removal provider key.
2. Run `npm ci`.
3. Run `npm run dev`.
4. Use `VITE_AD_PROVIDER=demo` and `VITE_DEMO_AD_MODE=true` only for local testing.

`npm run build` performs the TypeScript check and production build.

## Deploy to Vercel

Import this repository as a Vercel project. Set these production environment variables in the Vercel dashboard:

| Variable | Required | Notes |
| --- | --- | --- |
| `BG_PROVIDER` | Yes | `removebg`, `clipdrop`, `photoroom`, or `replicate` |
| Matching provider key | Yes | `REMOVEBG_API_KEY`, `CLIPDROP_API_KEY`, `PHOTOROOM_API_KEY`, or `REPLICATE_API_TOKEN` |
| `RATE_LIMIT_PER_HOUR` | Recommended | Start at `20` |
| `VITE_AD_PROVIDER` | Yes for ad-gated downloads | Use `admanager` only after an approved rewarded placement exists |
| `VITE_AD_REWARDED_SLOT` | Yes for Google Ad Manager | Full ad-unit path, such as `/1234567/clearcut_rewarded` |
| `VITE_AD_BANNER_SLOT` | Optional | Full Google Ad Manager banner path |

Never place provider secrets in a `VITE_` variable. Vite exposes those values to every browser.

## Launch checklist

- Configure and test a real background-removal provider key in Vercel.
- Configure an approved rewarded-ad placement. Demo mode cannot run in production.
- Replace the privacy-policy update date and add a public support email before launch.
- Test a JPG, PNG and WebP on desktop and mobile; test an image near 10 MB and the rate-limit response.
- Add a shared rate limiter (for example Upstash Redis) before scaling traffic beyond an early launch.
