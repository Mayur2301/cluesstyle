'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './account.module.css';
import EmailVerification from '../components/EmailVerification';

type UserType = 'user' | 'reseller' | 'club' | 'sponsor';

// Account types that can currently be used. Add a type here (e.g. 'reseller')
// when it launches and it becomes selectable automatically.
const AVAILABLE_TYPES: UserType[] = ['user'];

export default function AccountPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [selectedType, setSelectedType] = useState<UserType>('user');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loginForm, setLoginForm] = useState({ email: '', password: '', userType: 'user' });

  // ✅ FIX 1: registerForm.userType now stays in sync via selectedType
  const [registerForm, setRegisterForm] = useState({
    name: '', email: '', password: '', confirmPassword: '', phone: '', company: '', userType: 'user' as UserType
  });

  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [registrationData, setRegistrationData] = useState<any>(null);

  // Forgot-password flow: (optional email step) -> code + new password -> logged in
  const [isForgot, setIsForgot] = useState(false);
  const [forgotStep, setForgotStep] = useState<'email' | 'reset'>('email');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [forgotInfo, setForgotInfo] = useState('');
  const [resendIn, setResendIn] = useState(0);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      const userType = localStorage.getItem('userType');
      const validTypes = ['user', 'reseller', 'club', 'sponsor'];

      if (token && userType && validTypes.includes(userType)) {
        router.push(`/dashboard/${userType}`);
      }
    } catch (err) {
      console.error('Error checking auth:', err);
    }
  }, []);

  // ✅ FIX 1: Single handler that updates BOTH selectedType and the active form's userType
  const handleTypeSelect = (type: UserType) => {
    // Only the Regular User account is open for now — the other types are
    // shown greyed out with an "Available soon" badge.
    if (!AVAILABLE_TYPES.includes(type)) return;
    setSelectedType(type);
    if (isLogin) {
      setLoginForm(prev => ({ ...prev, userType: type }));
    } else {
      setRegisterForm(prev => ({ ...prev, userType: type }));
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.token) {
          localStorage.setItem('token', data.token);
        }
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        const userType = data.userType || loginForm.userType;
        localStorage.setItem('userType', userType);
        router.push(`/dashboard/${userType}`);
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (registerForm.password !== registerForm.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (registerForm.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const checkResponse = await fetch('/api/auth/check-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: registerForm.email }),
      });

      const checkData = await checkResponse.json();

      if (checkData.exists) {
        setError('User already exists. Please login instead.');
        setLoading(false);
        return;
      }
    } catch (err) {
      console.error('Error checking user:', err);
    }
    setLoading(false);

    // ✅ FIX 1: registerForm.userType is already correct — selectedType kept it in sync
    setRegistrationData(registerForm);
    setShowEmailVerification(true);
  };

  const completeRegistration = async (verifiedData: any) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:     registrationData.name,
          email:    registrationData.email,
          password: registrationData.password,
          phone:    registrationData.phone    || null,
          company:  registrationData.company  || null,
          // ✅ FIX 1: registrationData.userType is now the type the user actually selected
          userType: registrationData.userType,
          // Proof (from the verify-email step) that this person owns the email.
          verificationToken: verifiedData?.verificationToken,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.token) {
          localStorage.setItem('token', data.token);
        }
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        const userType = data.userType || registrationData.userType;
        localStorage.setItem('userType', userType);
        router.push(`/dashboard/${userType}`);
      } else {
        setError(data.message || 'Registration failed');
        setShowEmailVerification(false);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      setShowEmailVerification(false);
    } finally {
      setLoading(false);
    }
  };

  // ── Forgot password ──────────────────────────────────────────────────────
  const sendForgotOtp = async (email: string): Promise<boolean> => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/auth/forgot-password/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || 'Could not send the code.');
        return false;
      }
      setForgotEmail(email);
      setForgotInfo(`We've sent a 6-digit code to ${email}. Enter it below with your new password.`);
      setResendIn(60);
      return true;
    } catch {
      setError('An error occurred. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // "Forgot password?" — if the email is already typed in the login box we
  // don't ask for it again, we just send the code.
  const startForgotPassword = async () => {
    setError('');
    setForgotOtp('');
    setNewPassword('');
    setConfirmNewPassword('');
    setForgotInfo('');
    setIsForgot(true);

    const typed = loginForm.email.trim();
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(typed)) {
      setForgotStep('reset');
      const ok = await sendForgotOtp(typed);
      if (!ok) setForgotStep('email');
    } else {
      setForgotEmail(typed);
      setForgotStep('email');
    }
  };

  const handleForgotEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await sendForgotOtp(forgotEmail.trim());
    if (ok) setForgotStep('reset');
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!/^\d{6}$/.test(forgotOtp.trim())) {
      setError('Enter the 6-digit code from your email.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/forgot-password/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail.trim(), otp: forgotOtp.trim(), newPassword }),
      });
      const data = await response.json();

      if (response.ok) {
        if (data.token) localStorage.setItem('token', data.token);
        if (data.user) localStorage.setItem('user', JSON.stringify(data.user));
        const userType = data.userType || 'user';
        localStorage.setItem('userType', userType);
        router.push(`/dashboard/${userType}`);
      } else {
        setError(data.message || 'Could not reset the password.');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const backToLogin = () => {
    setIsForgot(false);
    setError('');
    setForgotInfo('');
  };

  const userTypes = [
    { value: 'user',    label: 'Regular User', glyph: '01', description: 'Shop and earn rewards',        icon: '/user-icon.webp' },
    { value: 'reseller', label: 'Reseller',      glyph: '02', description: 'Bulk purchases & discounts',   icon: '/reseller.webp' },
    { value: 'club',     label: 'Club',          glyph: '03', description: 'Group orders & special deals', icon: '/club.webp' },
    { value: 'sponsor',  label: 'Sponsor',       glyph: '04', description: 'Partner & promote products',   icon: '/sponsors.webp' },
  ];

  return (
    <div className={styles.page}>
      <video
        className={styles.bgVideo}
        autoPlay
        muted
        loop
        playsInline
        poster="/videos/account-bg-poster.jpg"
      >
        <source src="/login-bg.webm" type="video/mp4" />
      </video>
      <div className={styles.bgOverlay} />

      <div className={styles.shell}>

        {/* LEFT: user type selector */}
        <aside className={styles.typePanel}>
          <div className={styles.brand}>
            <img src="/cluesstyle-white-logo.png" alt="Cluesstyle" className={styles.logo} />
            <h6>Choose how you want to use your account</h6>
          </div>

          <div className={styles.typeList}>
            {userTypes.map((type) => {
              const available = AVAILABLE_TYPES.includes(type.value as UserType);
              return (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => handleTypeSelect(type.value as UserType)}
                  disabled={!available}
                  className={`${styles.typeCard} ${selectedType === type.value ? styles.typeCardActive : ''}`}
                  aria-pressed={selectedType === type.value}
                  aria-disabled={!available}
                  style={
                    available
                      ? undefined
                      : { position: 'relative', opacity: 0.5, filter: 'grayscale(1)', cursor: 'not-allowed' }
                  }
                >
                  <span className={styles.typeGlyph}>{type.glyph}</span>
                  <span className={styles.typeIcon}>
                    <img src={type.icon} alt="" />
                  </span>
                  <span className={styles.typeText}>
                    <span className={styles.typeLabel}>{type.label}</span>
                    <span className={styles.typeDesc}>{type.description}</span>
                  </span>
                  {!available && (
                    <span
                      style={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        padding: '2px 8px',
                        borderRadius: 999,
                        background: 'rgba(255,255,255,0.92)',
                        color: '#111827',
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: '0.03em',
                        textTransform: 'uppercase',
                        filter: 'none',
                      }}
                    >
                      Available soon
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </aside>

        {/* RIGHT: form */}
        <main className={styles.formPanel}>
          <div className={styles.formPanelInner}>
            <div className={styles.header}>
              <p className={styles.eyebrow}>{userTypes.find(t => t.value === selectedType)?.label}</p>
              <span>{isLogin ? (isForgot ? 'Reset your password' : 'Welcome back') : 'Create your account'}</span>
            </div>

            {error && <div className={styles.error}>{error}</div>}

            {isLogin && isForgot ? (
              forgotStep === 'email' ? (
                <form onSubmit={handleForgotEmailSubmit} className={styles.form}>
                  <div className={styles.formGroup}>
                    <label>Email address</label>
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      required
                      autoFocus
                      placeholder="Enter your registered email"
                    />
                  </div>
                  <button type="submit" disabled={loading} className={styles.submitBtn}>
                    {loading ? 'Sending code…' : 'Send verification code'}
                  </button>
                  <p className={styles.switchText}>
                    <button type="button" onClick={backToLogin} className={styles.switchBtn}>
                      Back to login
                    </button>
                  </p>
                </form>
              ) : (
                <form onSubmit={handleResetPassword} className={styles.form}>
                  {forgotInfo && (
                    <p style={{ margin: '0 0 4px', fontSize: 13, color: '#4b5563', lineHeight: 1.5 }}>{forgotInfo}</p>
                  )}
                  <div className={styles.formGroup}>
                    <label>Verification code</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={6}
                      value={forgotOtp}
                      onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, ''))}
                      required
                      autoFocus
                      placeholder="6-digit code"
                    />
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>New password</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        placeholder="Min 6 characters"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Confirm password</label>
                      <input
                        type="password"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        required
                        placeholder="Confirm password"
                      />
                    </div>
                  </div>
                  <button type="submit" disabled={loading} className={styles.submitBtn}>
                    {loading ? 'Resetting…' : 'Reset password & login'}
                  </button>
                  <p className={styles.switchText}>
                    <button
                      type="button"
                      onClick={() => sendForgotOtp(forgotEmail)}
                      disabled={loading || resendIn > 0}
                      className={styles.switchBtn}
                    >
                      {resendIn > 0 ? `Resend code in ${resendIn}s` : 'Resend code'}
                    </button>
                    {' · '}
                    <button type="button" onClick={backToLogin} className={styles.switchBtn}>
                      Back to login
                    </button>
                  </p>
                </form>
              )
            ) : isLogin ? (
              <form onSubmit={handleLogin} className={styles.form}>
                <div className={styles.formGroup}>
                  <label>Email address</label>
                  <input
                    type="email"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                    required
                    placeholder="Enter your email"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Password</label>
                  <input
                    type="password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    required
                    placeholder="Enter your password"
                  />
                </div>
                <p className={styles.switchText} style={{ textAlign: 'right', margin: '-4px 0 4px' }}>
                  <button type="button" onClick={startForgotPassword} className={styles.switchBtn}>
                    Forgot password?
                  </button>
                </p>
                <button type="submit" disabled={loading} className={styles.submitBtn}>
                  {loading ? 'Logging in…' : 'Login'}
                </button>
                <p className={styles.switchText}>
                  {' '}
                  <button type="button" onClick={() => { setIsLogin(false); setIsForgot(false); setError(''); }} className={styles.switchBtn}>
                    Register
                  </button>
                </p>
              </form>
            ) : (
              <>
                {!showEmailVerification ? (
                  <form onSubmit={handleRegister} className={styles.form}>
                    <div className={styles.formGroup}>
                      <label>Full name</label>
                      <input
                        type="text"
                        value={registerForm.name}
                        onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                        required
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Email address</label>
                      <input
                        type="email"
                        value={registerForm.email}
                        onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                        required
                        placeholder="Enter your email"
                      />
                    </div>
                    {(selectedType === 'reseller' || selectedType === 'club' || selectedType === 'sponsor') && (
                      <div className={styles.formGroup}>
                        <label>Company name</label>
                        <input
                          type="text"
                          value={registerForm.company || ''}
                          onChange={(e) => setRegisterForm({ ...registerForm, company: e.target.value })}
                          placeholder="Enter your company name"
                        />
                      </div>
                    )}
                    <div className={styles.formGroup}>
                      <label>Phone number</label>
                      <input
                        type="tel"
                        value={registerForm.phone || ''}
                        onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                        placeholder="Enter your phone number"
                      />
                    </div>
                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label>Password</label>
                        <input
                          type="password"
                          value={registerForm.password}
                          onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                          required
                          placeholder="Min 6 characters"
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label>Confirm password</label>
                        <input
                          type="password"
                          value={registerForm.confirmPassword}
                          onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                          required
                          placeholder="Confirm password"
                        />
                      </div>
                    </div>
                    <button type="submit" disabled={loading} className={styles.submitBtn}>
                      {loading ? 'Checking…' : 'Continue to verification'}
                    </button>
                    <p className={styles.switchText}>
                     {' '}
                      <button type="button" onClick={() => setIsLogin(true)} className={styles.switchBtn}>
                        Login
                      </button>
                    </p>
                  </form>
                ) : (
                  <EmailVerification
                    email={registrationData?.email || ''}
                    name={registrationData?.name || ''}
                    userType={selectedType}
                    onVerified={completeRegistration}
                  />
                )}
              </>
            )}
          </div>
        </main>

      </div>
    </div>
  );
}