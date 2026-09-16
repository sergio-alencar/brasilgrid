import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { anonymous, captcha, emailOTP } from 'better-auth/plugins'
import { sql } from 'drizzle-orm'
import type { Db } from './db/client.ts'
import * as schema from './db/schema.ts'
import { otpEmail, sendEmail } from './email.ts'

// Criado por requisição: os bindings do Worker só existem dentro do fetch.
export function createAuth(env: Env, db: Db, ctx?: { waitUntil(promise: Promise<unknown>): void }) {
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
    account: {
      // Mesmo e-mail verificado entrando por Google ou por código = mesma conta.
      accountLinking: { enabled: true, trustedProviders: ['google', 'email-otp'] },
    },
    socialProviders: {
      google: {
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        prompt: 'select_account',
      },
    },
    plugins: [
      anonymous({
        emailDomainName: 'anonimo.brasilgrid.invalid',
        generateName: () => 'Visitante',
        onLinkAccount: async ({ anonymousUser, newUser }) => {
          await db.execute(sql`select merge_user_games(${anonymousUser.user.id}, ${newUser.user.id})`)
        },
      }),
      emailOTP({
        otpLength: 6,
        expiresIn: 5 * 60,
        allowedAttempts: 5,
        async sendVerificationOTP({ email, otp }) {
          const send = sendEmail(env, { to: email, ...otpEmail(otp) })
          // Não segura a resposta esperando o provedor de e-mail.
          if (ctx) ctx.waitUntil(send.catch((e) => console.error('falha ao enviar código', e)))
          else await send
        },
      }),
      ...(env.TURNSTILE_SECRET_KEY
        ? [
            captcha({
              provider: 'cloudflare-turnstile',
              secretKey: env.TURNSTILE_SECRET_KEY,
              endpoints: ['/sign-in/anonymous', '/email-otp/send-verification-otp'],
            }),
          ]
        : []),
    ],
  })
}

export type Auth = ReturnType<typeof createAuth>
export type AuthSession = NonNullable<Awaited<ReturnType<Auth['api']['getSession']>>>
