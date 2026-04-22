// EMAIL TEMPORARILY DISABLED
// Password reset emails are not sent until a verified domain is configured in Resend.

export async function sendPasswordResetEmail(
  _toEmail: string,
  _toName: string,
  _code: string
): Promise<void> {
  throw new Error("EMAIL_DISABLED");
}
