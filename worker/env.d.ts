interface Env {
  HYPERDRIVE: Hyperdrive
  ASSETS: Fetcher
  /** URL pública do app (ex.: http://localhost:5173). */
  PUBLIC_URL: string
  BETTER_AUTH_SECRET: string
  /** Opcional em desenvolvimento: sem ela, o Turnstile fica desligado. */
  TURNSTILE_SECRET_KEY?: string
}
