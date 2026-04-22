import { Resend } from "resend";

async function getResendClient(): Promise<{ client: Resend; fromEmail: string }> {
  // Primary path: use RESEND_API_KEY env var (works in production)
  if (process.env.RESEND_API_KEY) {
    const fromEmail = "onboarding@resend.dev";
    console.log(`[email] Using RESEND_API_KEY. from=${fromEmail}`);
    return { client: new Resend(process.env.RESEND_API_KEY), fromEmail };
  }

  // Fallback: Replit connector proxy (development)
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? "repl " + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
    ? "depl " + process.env.WEB_REPL_RENEWAL
    : null;

  if (!hostname || !xReplitToken) {
    throw new Error("Email not configured: RESEND_API_KEY secret is missing.");
  }

  const data = await fetch(
    `https://${hostname}/api/v2/connection?include_secrets=true&connector_names=resend`,
    {
      headers: {
        Accept: "application/json",
        "X-Replit-Token": xReplitToken,
      },
    }
  ).then((res) => res.json());

  const settings = data?.items?.[0]?.settings;
  if (!settings?.api_key) {
    throw new Error("Email not configured: Resend connector missing api_key.");
  }

  const fromEmail = "onboarding@resend.dev";
  console.log(`[email] Using Resend connector. from=${fromEmail}`);
  return { client: new Resend(settings.api_key), fromEmail };
}

export async function sendPasswordResetEmail(
  toEmail: string,
  toName: string,
  code: string
): Promise<void> {
  console.log(`[email] Sending reset code to ${toEmail} (${toName})`);
  const { client, fromEmail } = await getResendClient();

  const result = await client.emails.send({
    from: `CoreHer Fitness <${fromEmail}>`,
    to: toEmail,
    subject: "Your CoreHer Password Reset Code",
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#F3E8FF;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F3E8FF;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;">
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <div style="background:linear-gradient(135deg,#2D0B4E,#6A0DAD);border-radius:16px;padding:24px 32px;text-align:center;">
                <p style="margin:0;font-size:28px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">CoreHer</p>
                <p style="margin:6px 0 0;font-size:13px;color:rgba(255,255,255,0.75);">Build your core. Transform your confidence.</p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background:#ffffff;border-radius:16px;padding:36px 32px;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
              <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#1a1a2e;">Hi ${toName},</p>
              <p style="margin:0 0 24px;font-size:15px;color:#555;line-height:1.6;">
                We received a request to reset your CoreHer account password. Use the code below to continue.
              </p>
              <div style="background:#F3E8FF;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
                <p style="margin:0 0 8px;font-size:11px;font-weight:600;color:#6A0DAD;letter-spacing:2px;text-transform:uppercase;">Your Reset Code</p>
                <p style="margin:0;font-size:42px;font-weight:800;color:#2D0B4E;letter-spacing:12px;">${code}</p>
                <p style="margin:10px 0 0;font-size:12px;color:#9D4EDD;">Expires in 15 minutes</p>
              </div>
              <p style="margin:0 0 24px;font-size:14px;color:#555;line-height:1.6;">
                Open the CoreHer app and enter this code when prompted. If you did not request a password reset, please ignore this email.
              </p>
              <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />
              <p style="margin:0;font-size:12px;color:#999;text-align:center;">
                CoreHer Fitness &bull; For women, by women &bull; Uganda
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim(),
  });

  if (result.error) {
    console.error(`[email] Resend error for ${toEmail}:`, JSON.stringify(result.error));
    throw new Error(result.error.message ?? "Email delivery failed.");
  }

  console.log(`[email] Delivered. id=${result.data?.id} to=${toEmail}`);
}
