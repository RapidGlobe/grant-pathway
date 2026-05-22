// Thin wrapper around the Resend REST API for transactional email.
// Uses fetch rather than the resend SDK to avoid an extra dependency.
// If RESEND_API_KEY is not set, the call is skipped and an error is logged —
// the caller decides whether to throw or swallow the failure.

interface SendEmailOptions {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: SendEmailOptions): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.error('[email] RESEND_API_KEY not set — email not sent to', to)
    return
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Grant Pathway <noreply@grantpathway.org.uk>',
      to,
      subject,
      html,
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    console.error(`[email] Resend API error ${res.status}:`, body)
    throw new Error(`Failed to send email: ${res.status}`)
  }
}
