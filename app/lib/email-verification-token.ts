// app/lib/email-verification-token.ts
//
// Proof that someone just entered the correct emailed code for an address.
// Issued by /api/auth/verify-email-otp and required by /api/auth/register, so
// an account can only be created for an email the caller really controls.
import jwt from 'jsonwebtoken';

const PURPOSE = 'signup-email-verified';

export function signEmailVerificationToken(email: string): string {
  return jwt.sign({ purpose: PURPOSE, email: email.trim().toLowerCase() }, process.env.JWT_SECRET!, {
    expiresIn: '30m',
  });
}

/** True only for an unexpired token that was issued for exactly this email. */
export function isValidEmailVerificationToken(token: unknown, email: string): boolean {
  if (typeof token !== 'string' || !token) return false;
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as { purpose?: string; email?: string };
    return payload.purpose === PURPOSE && payload.email === email.trim().toLowerCase();
  } catch {
    return false;
  }
}
