'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './EmailVerification.module.css';

type UserType = 'user' | 'reseller' | 'club' | 'sponsor';

type EmailVerificationProps = {
  email: string;
  name?: string;
  userType: UserType;
  onVerified: (data: any) => void;
};

export default function EmailVerification({
  email,
  name = '',
  userType,
  onVerified
}: EmailVerificationProps) {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 🔴 Send OTP
  const sendOTP = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/auth/send-email-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, userType }),
      });

      const data = await response.json();

      if (response.ok) {
        setOtpSent(true);
        setSuccess(`✓ OTP sent to ${email}!`);

        setCountdown(60);

        // Clear previous timer if exists
        if (timerRef.current) clearInterval(timerRef.current);

        timerRef.current = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              if (timerRef.current) clearInterval(timerRef.current);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setError(data.message || 'Failed to send OTP');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // 🔴 Verify OTP
  const verifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/auth/verify-email-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('✓ Email verified successfully!');

        // Pass userType forward safely
        setTimeout(() => {
          onVerified({ ...data, userType });
        }, 1200);
      } else {
        setError(data.message || 'Invalid OTP');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // 🔴 Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.icon}>📧</div>
        <h3>Verify Your Email</h3>
        <p>We sent a code to {email}</p>
      </div>

      {!otpSent ? (
        <button onClick={sendOTP} disabled={loading} className={styles.sendBtn}>
          {loading ? 'Sending...' : 'Send Verification Code'}
        </button>
      ) : (
        <>
          <div className={styles.otpInputGroup}>
            <input
              type="text"
              placeholder="Enter 6-digit code"
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))
              }
              maxLength={6}
              className={styles.otpInput}
              autoFocus
            />

            <button
              onClick={verifyOTP}
              disabled={loading || otp.length !== 6}
              className={styles.verifyBtn}
            >
              {loading ? 'Verifying...' : 'Verify Email'}
            </button>
          </div>

          {countdown > 0 ? (
            <p className={styles.countdown}>
              Resend code in {countdown} seconds
            </p>
          ) : (
            <button onClick={sendOTP} className={styles.resendBtn}>
              Resend Code
            </button>
          )}
        </>
      )}

      {error && <div className={styles.error}>{error}</div>}
      {success && <div className={styles.success}>{success}</div>}
    </div>
  );
}