/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string
  readonly VITE_SUPABASE_ANON_KEY?: string
  /** Judge0 base URL for the coding rounds. Defaults to the public CE instance. */
  readonly VITE_JUDGE0_URL?: string
  /** Only for a RapidAPI-hosted Judge0; the public instance needs neither. */
  readonly VITE_JUDGE0_KEY?: string
  readonly VITE_JUDGE0_HOST?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
