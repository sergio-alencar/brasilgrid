interface Env {
  HYPERDRIVE: Hyperdrive
  ASSETS: Fetcher
  /** URL pública do app (ex.: http://localhost:5173). */
  PUBLIC_URL: string
  BETTER_AUTH_SECRET: string
  GOOGLE_CLIENT_ID: string
  GOOGLE_CLIENT_SECRET: string
  /** Sem ela, nenhum e-mail sai (útil nos testes). */
  RESEND_API_KEY?: string
  /** Remetente dos e-mails, ex.: "BrasilGrid <codigo@brasilgrid.com.br>". */
  EMAIL_FROM: string
  /** "true" imprime os e-mails no console (desenvolvimento). */
  LOG_EMAILS?: string
  /** Opcional em desenvolvimento: sem ela, o Turnstile fica desligado. */
  TURNSTILE_SECRET_KEY?: string
}
