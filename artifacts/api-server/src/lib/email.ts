import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM_EMAIL ?? "noreply@coreherfitness.com";
const APP_NAME = "CoreHer Fitness";

/**
 * Send a password reset code.
 * @param toEmail      - recipient address (always Christine's inbox)
 * @param accountName  - display name of the account requesting the reset
 * @param code         - the 6-digit reset code
 * @param accountEmail - the email of the account requesting the reset (shown in the email body)
 */
export async function sendPasswordResetEmail(
  toEmail: string,
  accountName: string,
  code: string,
  accountEmail?: string
): Promise<void> {
  const firstName = accountName.split(" ")[0];

  const accountLine = accountEmail && accountEmail !== toEmail
    ? `<p style="margin:0 0 20px;font-size:14px;color:#555;line-height:1.6;">
         Reset requested for account: <strong style="color:#6A0DAD;">${accountEmail}</strong>
       </p>`
    : "";

  const accountLinePlain = accountEmail && accountEmail !== toEmail
    ? `Reset requested for account: ${accountEmail}\n\n`
    : "";

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Password Reset Code</title>
</head>
<body style="margin:0;padding:0;background:#F5F5F5;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F5F5;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#2D0B4E 0%,#6A0DAD 100%);padding:36px 40px;text-align:center;">
              <p style="margin:0;font-size:28px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">${APP_NAME}</p>
              <p style="margin:8px 0 0;font-size:13px;color:rgba(255,255,255,0.7);">Build your core. Transform your confidence.</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#1a1a2e;">Hi ${firstName} 👋</p>
              <p style="margin:0 0 20px;font-size:15px;color:#555;line-height:1.6;">
                A password reset was requested. Use the code below — it's valid for <strong>15 minutes</strong>.
              </p>

              ${accountLine}

              <!-- Code block -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <div style="background:#F1E4FA;border-radius:16px;padding:24px 40px;display:inline-block;margin-bottom:28px;">
                      <p style="margin:0 0 4px;font-size:12px;font-weight:600;color:#6A0DAD;letter-spacing:1px;text-transform:uppercase;">Reset code</p>
                      <p style="margin:0;font-size:42px;font-weight:800;color:#4A0876;letter-spacing:10px;font-variant-numeric:tabular-nums;">${code}</p>
                    </div>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 16px;font-size:14px;color:#777;line-height:1.6;">
                Enter this code in the app to set a new password. If no reset was requested, ignore this email — no changes will be made.
              </p>

              <div style="background:#FFF7ED;border-left:4px solid #F59E0B;border-radius:0 8px 8px 0;padding:12px 16px;">
                <p style="margin:0;font-size:13px;color:#92400E;">
                  ⏰ This code expires in <strong>15 minutes</strong>. Request a new one if it expires.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#F9F9F9;border-top:1px solid #EEEEEE;padding:20px 40px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#999;line-height:1.6;">
                ${APP_NAME} · Kampala, Uganda<br/>
                Coach WhatsApp: <a href="https://wa.me/256702568383" style="color:#6A0DAD;text-decoration:none;">+256 702 568 383</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = `Hi ${firstName},\n\n${accountLinePlain}Your ${APP_NAME} password reset code is: ${code}\n\nThis code expires in 15 minutes.\n\nIf you didn't request this, please ignore this email.\n\n— ${APP_NAME} Team`;

  const { error } = await resend.emails.send({
    from: `${APP_NAME} <${FROM}>`,
    to: toEmail,
    subject: `${code} — ${APP_NAME} password reset code`,
    html,
    text,
  });

  if (error) {
    console.error("Resend error:", error);
    throw new Error(`Email send failed: ${error.message}`);
  }
}
