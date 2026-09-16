import { anonymousClient } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'

export const authClient = createAuthClient({ plugins: [anonymousClient()] })

/** Garante uma sessão (anônima se preciso) antes do primeiro palpite. */
export async function ensureSession(): Promise<void> {
  const { data } = await authClient.getSession()
  if (data) return
  const { error } = await authClient.signIn.anonymous()
  if (error) throw new Error(error.message ?? 'Não foi possível iniciar a sessão')
}
