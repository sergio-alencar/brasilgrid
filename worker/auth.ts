import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { anonymous, captcha } from 'better-auth/plugins'
import type { Db } from './db/client.ts'
import * as schema from './db/schema.ts'

// Criado por requisição: os bindings do Worker só existem dentro do fetch.
export function createAuth(env: Env, db: Db) {
  return betterAuth({
    appName: 'BrasilGrid',
    baseURL: env.PUBLIC_URL,
    secret: env.BETTER_AUTH_SECRET,
    trustedOrigins: [env.PUBLIC_URL],
    database: drizzleAdapter(db, { provider: 'pg', schema }),
    session: {
      expiresIn: 60 * 60 * 24 * 365,
      cookieCache: { enabled: true, maxAge: 5 * 60 },
    },
    plugins: [
      anonymous({ emailDomainName: 'anonimo.brasilgrid.invalid' }),
      ...(env.TURNSTILE_SECRET_KEY
        ? [
            captcha({
              provider: 'cloudflare-turnstile',
              secretKey: env.TURNSTILE_SECRET_KEY,
              endpoints: ['/sign-in/anonymous'],
            }),
          ]
        : []),
    ],
  })
}

export type Auth = ReturnType<typeof createAuth>
export type AuthSession = NonNullable<Awaited<ReturnType<Auth['api']['getSession']>>>
