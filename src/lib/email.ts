// Email notification utility
// Uses Supabase's built-in email (via auth hooks) for now.
// Swap this for Resend, SendGrid, etc. when ready for production.

export async function sendNotification({
  to,
  subject,
  body,
}: {
  to: string;
  subject: string;
  body: string;
}) {
  // In development, just log. In production, wire to your email provider.
  if (process.env.NODE_ENV === "development") {
    console.log(`[EMAIL] To: ${to} | Subject: ${subject}\n${body}`);
    return;
  }

  // Production placeholder — replace with actual email API call
  // Example with Resend:
  // await fetch("https://api.resend.com/emails", {
  //   method: "POST",
  //   headers: {
  //     Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
  //     "Content-Type": "application/json",
  //   },
  //   body: JSON.stringify({
  //     from: "Granbury Home Board <noreply@granburyhomeboard.com>",
  //     to,
  //     subject,
  //     text: body,
  //   }),
  // });
}
