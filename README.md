# ClearCut

ClearCut is a privacy-first web app for removing an image background. It has no user accounts, no image-processing backend and no uploaded-image storage.

## What is included

- JPG, PNG and WebP upload validation (10 MB maximum)
- Browser-only removal with MIT-licensed BiRefNet Lite through Transformers.js and ONNX Runtime Web
- In-browser result editor: transparent, colour, gradient, image and blurred backgrounds; subject adjustments and shadow
- PNG and JPG downloads
- Direct, unrestricted downloads
- Optional standard display advertisements only

## Run locally

1. Run `npm ci`.
2. Run `npm run dev`.
3. Choose an image. The first processing attempt downloads the model to the browser; later attempts use the browser cache.

`npm run build` performs the TypeScript check and production build.

## Deploy to Vercel

Import this repository as a Vercel project. No secret environment variables are required for background removal.

| Variable | Required | Notes |
| --- | --- | --- |
| `VITE_AD_PROVIDER` | Optional | Set to `admanager` only after you have an approved display placement |
| `VITE_AD_BANNER_SLOT` | Optional | Full Google Ad Manager banner path |

`VITE_` values are public browser configuration. Never place any private key in one.

## Launch checklist

- Test the model download and processing path on a current Android phone, iPhone and desktop browser.
- Configure an approved standard display placement only if you want advertising.
- Replace the privacy-policy update date and add a public support email before launch.
- Test a JPG, PNG and WebP on desktop and mobile; test an image near 10 MB.
- Explain to users that model download time and local performance depend on their browser and device.
