// app/lib/mail-transport.ts
//
// ONE shared SMTP transport for every email the site sends (order
// confirmation, signup OTP). Configure it in .env on the server:
//
//   SMTP_HOST=mail.cluesstyle.com        # your aaPanel mail server
//   SMTP_PORT=465                        # 465 = SSL, 587 = STARTTLS
//   SMTP_USER=noreply@cluesstyle.com     # the mailbox you created in aaPanel
//   SMTP_PASSWORD=********
//   MAIL_FROM=noreply@cluesstyle.com     # optional, defaults to SMTP_USER
//   SMTP_SERVERNAME=cluesstyle.com       # optional, see below
//
// If SMTP_HOST is NOT set, it falls back to the old Gmail login
// (EMAIL_USER / EMAIL_PASSWORD), so nothing breaks before you switch over.
import nodemailer from "nodemailer";

const useSmtp = !!process.env.SMTP_HOST;
const port = Number(process.env.SMTP_PORT || 465);

export const mailTransporter = useSmtp
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      // Optional. When the app runs on the SAME server as the mail server,
      // set SMTP_HOST=127.0.0.1 and SMTP_SERVERNAME=cluesstyle.com: it connects
      // locally (the public address can't be reached from inside the server)
      // while the TLS certificate is still checked against the real name.
      // Leave unset anywhere else.
      ...(process.env.SMTP_SERVERNAME ? { tls: { servername: process.env.SMTP_SERVERNAME } } : {}),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    })
  : nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

// Address shown in the "From" of every email.
export const MAIL_FROM_ADDRESS: string = useSmtp
  ? process.env.MAIL_FROM || process.env.SMTP_USER || ""
  : process.env.EMAIL_USER || "";