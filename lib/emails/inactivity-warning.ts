// Email 3 — Inactivity warning (S8.3)
// Subject: "Your Grant Pathway account will be deleted in 30 days"
// Sent at 23 months of inactivity by the inactivity-warning cron job.

import { SITE_URL } from '@/lib/site-url'

export function buildInactivityWarningEmail(firstName: string, deletionDate: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your Grant Pathway account will be deleted in 30 days</title>
</head>
<body style="margin:0;padding:0;background-color:#F8FAFC;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F8FAFC;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#FFFFFF;border-radius:8px;border:1px solid #E2E8F0;overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="background-color:#0D6E6E;padding:24px 32px;">
              <p style="margin:0;color:#FFFFFF;font-size:18px;font-weight:bold;">Grant Pathway</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <h1 style="margin:0 0 16px;font-size:20px;font-weight:bold;color:#1E293B;">
                Your account will be deleted on ${deletionDate}
              </h1>
              <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.6;">
                Hi ${firstName},
              </p>
              <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.6;">
                We haven't seen you on Grant Pathway for nearly two years. To protect your
                privacy, we automatically delete inactive accounts after 24 months.
              </p>
              <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.6;">
                <strong>Your account will be permanently deleted on ${deletionDate}.</strong>
                If you'd like to keep it, simply sign in before that date.
              </p>
              <a href="${SITE_URL}/"
                 style="display:inline-block;background-color:#0D6E6E;color:#FFFFFF;text-decoration:none;font-size:15px;font-weight:bold;padding:12px 24px;border-radius:6px;">
                Sign in to keep my account
              </a>
              <p style="margin:24px 0 0;font-size:14px;color:#64748B;line-height:1.6;">
                If you no longer need your account, you don't need to do anything — it will
                be deleted automatically on ${deletionDate}.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:16px 32px;border-top:1px solid #E2E8F0;">
              <p style="margin:0;font-size:12px;color:#64748B;line-height:1.6;">
                This email was sent by Grant Pathway, a service of RapidGlobe Ltd.<br />
                You are receiving this because your account has been inactive for 23 months.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}
