import nodemailer from 'nodemailer';
import type { IContactInquiry } from '../models/ContactInquiry';

function getSmtpConfig() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const secure =
    process.env.SMTP_SECURE === 'true' || String(port) === '465';

  if (!host || !user || !pass) {
    return null;
  }

  return { host, port, secure, user, pass };
}

function getAlertRecipients(): string[] {
  const raw =
    process.env.CONTACT_ALERT_EMAILS || process.env.SMTP_ALERT_TO || '';
  return raw
    .split(',')
    .map(e => e.trim())
    .filter(Boolean);
}

function getFromAddress(): string {
  return (
    process.env.SMTP_FROM ||
    process.env.SMTP_USER ||
    'noreply@metricmintdigital.com'
  );
}

export function isMailConfigured(): boolean {
  return getSmtpConfig() !== null && getAlertRecipients().length > 0;
}

export async function sendContactInquiryAlert(
  inquiry: IContactInquiry
): Promise<void> {
  const smtp = getSmtpConfig();
  const to = getAlertRecipients();
  if (!smtp || to.length === 0) {
    throw new Error('Mail is not configured (SMTP or CONTACT_ALERT_EMAILS)');
  }

  const transporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure,
    auth: { user: smtp.user, pass: smtp.pass },
  });

  const subject = `[Metricmint] New inquiry (${inquiry.source}) — ${inquiry.fullName}`;
  const lines = [
    `Name: ${inquiry.fullName}`,
    `Email: ${inquiry.email}`,
    inquiry.mobile ? `Mobile: ${inquiry.mobile}` : null,
    `Source: ${inquiry.source}`,
    `Services: ${inquiry.services.join(', ')}`,
    inquiry.budget ? `Budget: ${inquiry.budget}` : null,
    inquiry.notes ? `Notes:\n${inquiry.notes}` : null,
    '',
    `Inquiry ID: ${inquiry._id}`,
  ].filter(Boolean);

  const text = lines.join('\n');

  await transporter.sendMail({
    from: getFromAddress(),
    to: to.join(', '),
    replyTo: inquiry.email,
    subject,
    text,
  });
}
