// Email 4 — Account deleted due to inactivity (S8.3)
// Subject: "Your Grant Pathway account has been deleted"
// Sent immediately after automated deletion at 24 months.

import { SITE_URL } from '@/lib/site-url'

export function buildAccountDeletedInactivityEmail(firstName: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your Grant Pathway account has been deleted</title>
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
                Your account has been deleted
              </h1>
              <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.6;">
                Hi ${firstName},
              </p>
              <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.6;">
                As we notified you previously, your Grant Pathway account has now been
                permanently deleted due to 24 months of inactivity.
              </p>
              <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.6;">
                All your data, including your charity profile and saved applications, has been
                removed. If you'd like to use Grant Pathway again, you're welcome to create a
                new free account.
              </p>
              <a href="${SITE_URL}/register"
                 style="display:inline-block;background-color:#0D6E6E;color:#FFFFFF;text-decoration:none;font-size:15px;font-weight:bold;padding:12px 24px;border-radius:6px;">
                Create a new account
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:16px 32px;border-top:1px solid #E2E8F0;">
              <p style="margin:0;font-size:12px;color:#94A3B8;line-height:1.6;">
                This email was sent by Grant Pathway, a service of RapidGlobe Ltd.<br />
                Your account was deleted because it had been inactive for 24 months.
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
