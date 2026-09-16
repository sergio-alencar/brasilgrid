export interface EmailMessage {
  to: string
  subject: string
  text: string
  html: string
}

/** Só em desenvolvimento local: permite que os testes E2E leiam o código enviado. */
export function devEmailsEnabled(env: Env): boolean {
  return env.LOG_EMAILS === 'true' && new URL(env.PUBLIC_URL).hostname === 'localhost'
}

const devOutbox: EmailMessage[] = []

export function lastDevEmail(to: string): EmailMessage | undefined {
  return devOutbox.findLast((m) => m.to.toLowerCase() === to.toLowerCase())
}

export async function sendEmail(env: Env, message: EmailMessage): Promise<void> {
  if (env.LOG_EMAILS === 'true') {
    console.log(`[email] para ${message.to}: ${message.subject}\n${message.text}`)
  }
  if (devEmailsEnabled(env)) {
    devOutbox.push(message)
    if (devOutbox.length > 50) devOutbox.shift()
  }
  if (!env.RESEND_API_KEY) return
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: env.EMAIL_FROM, ...message }),
  })
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`)
}

export function otpEmail(otp: string): Omit<EmailMessage, 'to'> {
  return {
    subject: `${otp} é seu código do BrasilGrid`,
    text: `Seu código para entrar no BrasilGrid é ${otp}.\n\nEle vale por 5 minutos. Se você não pediu, ignore este e-mail.`,
    html: `<div style="font-family:system-ui,sans-serif;max-width:420px">
  <p>Seu código para entrar no <strong>BrasilGrid</strong>:</p>
  <p style="font-size:32px;font-weight:700;letter-spacing:6px">${otp}</p>
  <p style="color:#64748b">Ele vale por 5 minutos. Se você não pediu, ignore este e-mail.</p>
</div>`,
  }
}
