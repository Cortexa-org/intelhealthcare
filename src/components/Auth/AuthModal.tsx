import React, { useState, useEffect } from 'react';
import { Mail, Lock, User, ArrowRight, Calendar, HeartPulse } from 'lucide-react';
import { User as UserType } from '../../types';

interface AuthModalProps {
  loginWithEmail: (email: string, password: string) => Promise<UserType>;
  register: (
    email: string,
    password: string,
    firstName?: string,
    lastName?: string,
    birthday?: string,
    hobby?: string
  ) => Promise<UserType>;
}

const FORBIDDEN_REGISTRATION_PASSWORD = 'Dada41001))';

function getRegisterPasswordError(password: string): string | null {
  if (password.length <= 8) {
    return 'Password must be longer than 8 characters';
  }
  if (!/[A-Za-z]/.test(password)) {
    return 'Password must include at least one letter';
  }
  if (!/[0-9]/.test(password)) {
    return 'Password must include at least one number';
  }
  if (password === FORBIDDEN_REGISTRATION_PASSWORD) {
    return 'This password is not allowed';
  }
  return null;
}

function todayIsoDate(): string {
  const t = new Date();
  const y = t.getFullYear();
  const m = String(t.getMonth() + 1).padStart(2, '0');
  const d = String(t.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Sign-up: password rule check only after this many Create account clicks (first N are confirmation steps). */
const REGISTER_PASSWORD_GATE_SUBMITS = 3;

export default function AuthModal({ loginWithEmail, register }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthday, setBirthday] = useState('');
  const [hobby, setHobby] = useState('');
  /** Counts register submits; 0..2 = show gate message; 3+ = run password rules */
  const [registerPasswordGateCount, setRegisterPasswordGateCount] = useState(0);
  /** Shown under password only during gate (no top banner for this). */
  const [passwordInputFailedMessage, setPasswordInputFailedMessage] = useState('');
  /** Register only: start read-only so Chrome/Google PM is less likely to offer "Use strong password". */
  const [registerPasswordUnlocked, setRegisterPasswordUnlocked] = useState(false);

  useEffect(() => {
    if (mode === 'register') {
      setRegisterPasswordUnlocked(false);
    }
  }, [mode]);

  const unlockRegisterPasswordField = () => {
    setRegisterPasswordUnlocked(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setPasswordInputFailedMessage('');

    const form = e.currentTarget;
    const emailInput = form.querySelector<HTMLInputElement>('#email');
    const passwordInput = form.querySelector<HTMLInputElement>('#password');

    /** DOM wins on submit — fixes password manager / browser autofill that skips React `onChange` */
    const emailVal = (emailInput?.value ?? email).trim();
    const passwordVal = passwordInput?.value ?? password;

    if (emailInput && emailInput.value !== email) setEmail(emailInput.value);
    if (passwordInput && passwordInput.value !== password) setPassword(passwordInput.value);

    if (!emailVal) {
      setError('Email is required');
      return;
    }
    if (!passwordVal) {
      setError('Password is required');
      return;
    }

    let birthdayTrim = '';
    let hobbyTrim = '';
    let firstForRegister = '';
    let lastForRegister = '';

    if (mode === 'register') {
      const birthdayInput = form.querySelector<HTMLInputElement>('#birthday');
      const hobbyInput = form.querySelector<HTMLInputElement>('#hobby');
      const firstEl = form.querySelector<HTMLInputElement>('#firstName');
      const lastEl = form.querySelector<HTMLInputElement>('#lastName');

      birthdayTrim = (birthdayInput?.value ?? birthday).trim();
      hobbyTrim = (hobbyInput?.value ?? hobby).trim();
      firstForRegister = (firstEl?.value ?? firstName).trim();
      lastForRegister = (lastEl?.value ?? lastName).trim();

      if (birthdayInput && birthdayInput.value !== birthday) setBirthday(birthdayInput.value);
      if (hobbyInput && hobbyInput.value !== hobby) setHobby(hobbyInput.value);
      if (firstEl && firstEl.value !== firstName) setFirstName(firstEl.value);
      if (lastEl && lastEl.value !== lastName) setLastName(lastEl.value);

      if (!birthdayTrim) {
        setError('Birthday is required');
        return;
      }
      if (!/^\d{4}-\d{2}-\d{2}$/.test(birthdayTrim)) {
        setError('Choose a valid birthday');
        return;
      }

      if (registerPasswordGateCount < REGISTER_PASSWORD_GATE_SUBMITS) {
        setPasswordInputFailedMessage(
          'Please use strong password! Password should include number, letter and special character'
        );
        setRegisterPasswordGateCount((c) => c + 1);
        return;
      }

      const pwdMsg = getRegisterPasswordError(passwordVal);
      if (pwdMsg) {
        setError(pwdMsg);
        return;
      }
    }

    setIsLoading(true);
    try {
      if (mode === 'login') {
        await loginWithEmail(emailVal, passwordVal);
      } else {
        await register(
          emailVal,
          passwordVal,
          firstForRegister || undefined,
          lastForRegister || undefined,
          birthdayTrim || undefined,
          hobbyTrim || undefined
        );
        setRegisterPasswordGateCount(0);
        setPasswordInputFailedMessage('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = () => {
    setMode((m) => (m === 'login' ? 'register' : 'login'));
    setError('');
    setBirthday('');
    setHobby('');
    setRegisterPasswordGateCount(0);
    setPasswordInputFailedMessage('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mb-4">
            <HeartPulse className="h-8 w-8 text-teal-700" aria-hidden />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">IntelliHealth</h2>
          <p className="mt-2 text-gray-600">Sign in with your email</p>
        </div>

        <div className="bg-white shadow-lg rounded-xl p-8 space-y-6">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setRegisterPasswordGateCount(0);
                setPasswordInputFailedMessage('');
                setMode('login');
              }}
              className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-colors ${
                mode === 'login' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Log in
            </button>
            <button
              type="button"
              onClick={() => {
                setRegisterPasswordGateCount(0);
                setPasswordInputFailedMessage('');
                setMode('register');
              }}
              className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-colors ${
                mode === 'register' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Create account
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
            autoComplete={mode === 'register' ? 'off' : 'on'}
          >
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="email"
                  name={mode === 'register' ? 'signup_email' : 'email'}
                  type="email"
                  autoComplete={mode === 'register' ? 'off' : 'email'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onInput={(e) => setEmail((e.target as HTMLInputElement).value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="password"
                  type="password"
                  name={mode === 'register' ? 'signup_passphrase' : 'password'}
                  autoComplete={mode === 'login' ? 'current-password' : 'off'}
                  data-lpignore={mode === 'register' ? 'true' : undefined}
                  data-1p-ignore={mode === 'register' ? true : undefined}
                  data-bwignore={mode === 'register' ? 'true' : undefined}
                  spellCheck={false}
                  autoCorrect="off"
                  readOnly={mode === 'register' && !registerPasswordUnlocked}
                  onFocus={mode === 'register' ? unlockRegisterPasswordField : undefined}
                  onPointerDown={mode === 'register' ? unlockRegisterPasswordField : undefined}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onInput={(e) => setPassword((e.target as HTMLInputElement).value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="••••••••"
                />
              </div>
              {mode === 'register' && passwordInputFailedMessage && (
                <p className="mt-1 text-sm text-red-600" role="alert">
                  {passwordInputFailedMessage}
                </p>
              )}
            </div>

            {mode === 'register' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                    First name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="firstName"
                      type="text"
                      autoComplete="given-name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="First"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                    Last name
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    autoComplete="family-name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Last"
                  />
                </div>
              </div>
            )}

            {mode === 'register' && (
              <>
                <div>
                  <label htmlFor="birthday" className="block text-sm font-medium text-gray-700 mb-1">
                    Birthday
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                    <input
                      id="birthday"
                      type="date"
                      autoComplete="bday"
                      value={birthday}
                      onChange={(e) => setBirthday(e.target.value)}
                      min="1900-01-01"
                      max={todayIsoDate()}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Use the calendar control or type YYYY-MM-DD</p>
                </div>
                <div>
                  <label htmlFor="hobby" className="block text-sm font-medium text-gray-700 mb-1">
                    Hobby
                  </label>
                  <input
                    id="hobby"
                    type="text"
                    value={hobby}
                    onChange={(e) => setHobby(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g. hiking, reading"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? 'Please wait...' : (
                <>
                  {mode === 'login' ? 'Log in' : 'Create account'}
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button type="button" onClick={switchMode} className="text-indigo-600 font-medium hover:underline">
              {mode === 'login' ? 'Create account' : 'Log in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
