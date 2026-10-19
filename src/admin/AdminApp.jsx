import React, { useEffect, useState } from 'react';
import { Navigate, NavLink, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { isFirebaseConfigured } from '../lib/firebaseConfig';
import { isActiveAdmin, requestPasswordReset, signIn, signOutUser, watchAuth } from '../services/authService';
import { Banner, buttonClass, Field, inputClass, SessionContext, useSession } from './ui';
import { ProjectEditor, ProjectsList } from './ProjectsAdmin';
import CategoriesAdmin from './CategoriesAdmin';

// Private admin area, mounted at /admin/*. Not linked from the public site.
// Route guards here are for UX only; Firestore Security Rules are the security boundary.

const SESSION_TIMEOUT_MS = 10000;

function useNoIndex() {
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    const previousTitle = document.title;
    document.title = 'Admin · Portfolio';
    return () => {
      meta.remove();
      document.title = previousTitle;
    };
  }, []);
}

function Screen({ children }) {
  return (
    <div className="min-h-screen bg-slate-900 px-4 py-10 text-slate-300 antialiased selection:bg-teal-300 selection:text-teal-900">
      {children}
    </div>
  );
}

function CenteredCard({ title, children }) {
  return (
    <div className="mx-auto mt-10 max-w-sm rounded-lg border border-slate-700 bg-slate-800/30 p-6">
      <h1 className="mb-4 text-xl font-bold text-teal-300">{title}</h1>
      {children}
    </div>
  );
}

function SessionProvider({ children }) {
  const [session, setSession] = useState({ status: 'loading', user: null });
  const [attempt, setAttempt] = useState(0);

  useEffect(
    () =>
      watchAuth(async (user) => {
        if (!user) {
          setSession({ status: 'signedOut', user: null });
          return;
        }
        setSession({ status: 'loading', user });
        try {
          const admin = await isActiveAdmin(user.uid);
          setSession({ status: admin ? 'admin' : 'denied', user });
        } catch (err) {
          setSession({ status: err.code === 'permission-denied' ? 'denied' : 'error', user });
        }
      }),
    [attempt]
  );

  // Don't spin forever if Firebase can't be reached.
  useEffect(() => {
    if (session.status !== 'loading') return undefined;
    const timer = setTimeout(
      () => setSession((s) => (s.status === 'loading' ? { ...s, status: 'error' } : s)),
      SESSION_TIMEOUT_MS
    );
    return () => clearTimeout(timer);
  }, [session.status, attempt]);

  const value = {
    ...session,
    retry: () => {
      setSession((s) => ({ ...s, status: 'loading' }));
      setAttempt((n) => n + 1);
    },
  };
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

function AccessDenied() {
  return (
    <CenteredCard title="Access denied">
      <p className="mb-4 text-sm">This account doesn't have admin access.</p>
      <button type="button" className={buttonClass.secondary} onClick={signOutUser}>
        Sign out
      </button>
    </CenteredCard>
  );
}

function SessionError() {
  const { retry } = useSession();
  return (
    <CenteredCard title="Couldn't reach the sign-in service">
      <p className="mb-4 text-sm">Check your connection and try again.</p>
      <div className="flex gap-2">
        <button type="button" className={buttonClass.primary} onClick={retry}>
          Try again
        </button>
        <button type="button" className={buttonClass.secondary} onClick={signOutUser}>
          Sign out
        </button>
      </div>
    </CenteredCard>
  );
}

function RequireAdmin() {
  const { status } = useSession();
  const location = useLocation();
  if (status === 'loading') return <p className="text-center text-sm" role="status">Checking your session…</p>;
  if (status === 'signedOut') return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  if (status === 'denied') return <AccessDenied />;
  if (status === 'error') return <SessionError />;
  return <Outlet />;
}

function LoginPage() {
  const { status } = useSession();
  const location = useLocation();
  const [mode, setMode] = useState('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  if (status === 'admin') return <Navigate to={location.state?.from || '/admin'} replace />;
  if (status === 'denied') return <AccessDenied />;

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setNotice('');
    setBusy(true);
    try {
      if (mode === 'signIn') {
        await signIn(email, password);
      } else {
        await requestPasswordReset(email);
        setNotice('If that email belongs to an admin account, a reset link is on its way.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <CenteredCard title={mode === 'signIn' ? 'Admin sign in' : 'Reset password'}>
      {error && <Banner tone="error">{error}</Banner>}
      {notice && <Banner tone="success">{notice}</Banner>}
      <form onSubmit={submit} className="space-y-4" noValidate>
        <Field id="email" label="Email" required>
          <input
            id="email"
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
        </Field>
        {mode === 'signIn' && (
          <Field id="password" label="Password" required>
            <div className="flex gap-2">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
              />
              <button
                type="button"
                className={buttonClass.secondary}
                onClick={() => setShowPassword((v) => !v)}
                aria-pressed={showPassword}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </Field>
        )}
        <button
          type="submit"
          className={`${buttonClass.primary} w-full`}
          disabled={busy || !email || (mode === 'signIn' && !password)}
        >
          {busy ? 'Please wait…' : mode === 'signIn' ? 'Sign in' : 'Send reset link'}
        </button>
      </form>
      <button
        type="button"
        className="mt-4 text-sm text-slate-400 hover:text-teal-300"
        onClick={() => {
          setMode(mode === 'signIn' ? 'reset' : 'signIn');
          setError('');
          setNotice('');
        }}
      >
        {mode === 'signIn' ? 'Forgot password?' : 'Back to sign in'}
      </button>
    </CenteredCard>
  );
}

function AdminLayout() {
  const { user } = useSession();
  const navClass = ({ isActive }) =>
    `rounded-full px-3 py-1 text-sm font-medium ${isActive ? 'bg-teal-400/10 text-teal-200' : 'text-slate-400 hover:text-teal-300'}`;

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-slate-700 pb-4">
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-lg font-bold text-slate-200">Portfolio admin</span>
          <nav className="flex gap-1" aria-label="Admin">
            <NavLink to="/admin" end className={navClass}>
              Projects
            </NavLink>
            <NavLink to="/admin/categories" className={navClass}>
              Categories
            </NavLink>
          </nav>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <a href="/" target="_blank" rel="noreferrer noopener" className="text-slate-400 hover:text-teal-300">
            View site
          </a>
          <span className="text-slate-500">{user?.email}</span>
          <button type="button" className={buttonClass.secondary} onClick={signOutUser}>
            Sign out
          </button>
        </div>
      </header>
      <Outlet />
    </div>
  );
}

export default function AdminApp() {
  useNoIndex();

  if (!isFirebaseConfigured) {
    return (
      <Screen>
        <CenteredCard title="Admin unavailable">
          <p className="text-sm">
            Firebase isn't configured for this build. Set the REACT_APP_FIREBASE_* environment variables and rebuild.
          </p>
        </CenteredCard>
      </Screen>
    );
  }

  return (
    <SessionProvider>
      <Screen>
        <Routes>
          <Route path="login" element={<LoginPage />} />
          <Route element={<RequireAdmin />}>
            <Route element={<AdminLayout />}>
              <Route index element={<ProjectsList />} />
              <Route path="projects/new" element={<ProjectEditor />} />
              <Route path="projects/:id" element={<ProjectEditor />} />
              <Route path="categories" element={<CategoriesAdmin />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </Screen>
    </SessionProvider>
  );
}
