/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AD_PROVIDER?: string
  readonly VITE_AD_CLIENT_ID?: string
  readonly VITE_AD_REWARDED_SLOT?: string
  readonly VITE_AD_BANNER_SLOT?: string
  readonly VITE_DEMO_AD_MODE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
