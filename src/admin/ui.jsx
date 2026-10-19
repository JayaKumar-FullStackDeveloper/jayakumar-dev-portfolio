import React, { createContext, useContext } from 'react';

// Shared admin styles and small building blocks (same slate/teal palette as the public site).

export const inputClass =
  'w-full rounded-md border border-slate-700 bg-slate-800/50 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-teal-400/60 focus:outline-none focus:ring-1 focus:ring-teal-300';

const buttonBase =
  'inline-flex items-center justify-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-teal-300 disabled:cursor-not-allowed disabled:opacity-50';

export const buttonClass = {
  primary: `${buttonBase} border-teal-400/40 bg-teal-400/10 text-teal-200 hover:bg-teal-400/20`,
  secondary: `${buttonBase} border-slate-700 text-slate-300 hover:text-teal-300`,
  danger: `${buttonBase} border-red-400/40 text-red-300 hover:bg-red-400/10`,
};

export const smallButtonClass = {
  secondary: buttonClass.secondary.replace('px-4 py-2', 'px-3 py-1 text-xs'),
  danger: buttonClass.danger.replace('px-4 py-2', 'px-3 py-1 text-xs'),
  primary: buttonClass.primary.replace('px-4 py-2', 'px-3 py-1 text-xs'),
};

export function Field({ id, label, hint, error, required, children }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-slate-200">
        {label}
        {required && <span className="text-teal-300"> *</span>}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
      {error && (
        <p id={`${id}-error`} className="mt-1 text-xs text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}

export function Banner({ tone = 'info', children, onDismiss }) {
  const tones = {
    info: 'border-slate-700 bg-slate-800/60 text-slate-300',
    success: 'border-teal-400/40 bg-teal-400/10 text-teal-100',
    error: 'border-red-400/40 bg-red-400/10 text-red-200',
  };
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={`mb-4 flex items-start justify-between gap-4 rounded-lg border px-4 py-3 text-sm ${tones[tone]}`}
    >
      <div>{children}</div>
      {onDismiss && (
        <button type="button" onClick={onDismiss} className="text-xs underline-offset-2 hover:underline">
          Dismiss
        </button>
      )}
    </div>
  );
}

const STATUS_STYLES = {
  published: 'bg-teal-400/10 text-teal-200',
  draft: 'bg-slate-700/60 text-slate-300',
  archived: 'bg-amber-400/10 text-amber-200',
  trash: 'bg-red-400/10 text-red-200',
};

export function StatusBadge({ project }) {
  const key = project.deletedAt ? 'trash' : project.status;
  const label = project.deletedAt ? 'In trash' : project.status[0].toUpperCase() + project.status.slice(1);
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[key]}`}>{label}</span>;
}

export function formatDate(timestamp) {
  const date = timestamp?.toDate?.();
  return date ? date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '—';
}

// Signed-in admin session, provided by AdminApp.
export const SessionContext = createContext({ status: 'loading', user: null });
export const useSession = () => useContext(SessionContext);
