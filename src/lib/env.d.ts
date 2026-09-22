/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AD_PROVIDER?: string
  readonly VITE_AD_BANNER_SLOT?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
