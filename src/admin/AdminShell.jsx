import React, { useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { signOutUser } from '../services/authService';
import { Icon, MenuButton, useSession } from './ui';

// Sidebar + top bar around every signed-in admin page.
// Add a nav entry here when its page and route exist.

const NAV = [
  {
    to: '/admin',
    label: 'Projects',
    icon: 'M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
    match: (path) => path === '/admin' || path.startsWith('/admin/projects'),
  },
  {
    to: '/admin/categories',
    label: 'Categories',
    icon: 'M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z M7.5 7.5h.01',
  },
  {
    to: '/admin/media',
    label: 'Media',
    icon: 'M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M8.5 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z M21 15l-5-5L5 21',
  },
  {
    to: '/admin/analytics',
    label: 'Analytics',
    icon: 'M3 3v18h18 M7 15v3 M12 9v9 M17 6v12',
  },
];

const EXTERNAL_ICON = 'M14 4h6v6 M20 4l-9 9 M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5';
const COLLAPSE_ICON = 'M11 17l-5-5 5-5 M18 17l-5-5 5-5';
const EXPAND_ICON = 'M13 17l5-5-5-5 M6 17l5-5-5-5';
const STORAGE_KEY = 'admin.sidebar.collapsed';

function readCollapsed() {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

function writeCollapsed(value) {
  try {
    window.localStorage.setItem(STORAGE_KEY, value ? '1' : '0');
  } catch {
    // Storage can be blocked (private window, site data cleared). The sidebar still works.
  }
}

// Trail of [label, path?] pairs for the top bar. The last entry is the current page.
function breadcrumbFor(pathname) {
  const parts = pathname.replace(/\/+$/, '').split('/').filter(Boolean); // ['admin', ...]
  const [, section, id, sub] = parts;
  if (!section) return [['Projects']];
  if (section === 'projects') {
    if (id === 'new') return [['Projects', '/admin'], ['New project']];
    if (sub === 'preview') return [['Projects', '/admin'], ['Edit project', `/admin/projects/${id}`], ['Preview']];
    return [['Projects', '/admin'], ['Edit project']];
  }
  const found = NAV.find((n) => n.to === `/admin/${section}`);
  return [[found ? found.label : 'Admin']];
}

const initials = (email) => (email ? email.slice(0, 2).toUpperCase() : 'AD');

export default function AdminShell() {
  const { user } = useSession();
  const { pathname } = useLocation();
  const [collapsed, setCollapsed] = useState(readCollapsed);
  const trail = breadcrumbFor(pathname);

  const toggle = () => {
    setCollapsed((c) => {
      writeCollapsed(!c);
      return !c;
    });
  };

  const navClass = (active) =>
    `group relative flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-admin-accent md:h-10 ${
      collapsed ? 'md:justify-center md:px-0' : ''
    } ${active ? 'bg-admin-accent-bg text-admin-accent-text' : 'text-admin-muted hover:bg-slate-800/60 hover:text-admin-label'}`;

  // Label stays in the DOM when collapsed (screen readers), but is hidden visually on md+.
  const labelClass = collapsed ? 'md:sr-only' : '';
  const tip = (text) =>
    collapsed ? (
      <span
        role="tooltip"
        className="pointer-events-none absolute left-full top-1/2 z-30 ml-2 hidden -translate-y-1/2 whitespace-nowrap rounded-md border border-admin-border bg-admin-app px-2 py-1 text-xs text-admin-label shadow-overlay md:group-hover:block md:group-focus-visible:block"
      >
        {text}
      </span>
    ) : null;

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <a
        href="#admin-main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-admin-app focus:px-3 focus:py-2 focus:text-admin-accent"
      >
        Skip to content
      </a>

      <aside
        className={`flex shrink-0 flex-col gap-4 border-b border-admin-subtle p-3 md:sticky md:top-0 md:h-screen md:gap-6 md:border-b-0 md:border-r md:p-4 ${
          collapsed ? 'md:w-14 md:px-2' : 'md:w-[248px]'
        }`}
      >
        <div className={`flex items-center gap-3 md:px-1 ${collapsed ? 'md:justify-center md:px-0' : ''}`}>
          <div
            aria-hidden="true"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border border-admin-accent-border bg-admin-accent-bg font-bold text-admin-accent"
          >
            P
          </div>
          <div className={`flex flex-col ${collapsed ? 'md:hidden' : ''}`}>
            <span className="font-semibold text-admin-strong">Portfolio Admin</span>
            <span className="text-xs text-admin-muted">Project management</span>
          </div>
        </div>

        <nav aria-label="Primary" className="flex gap-1 overflow-x-auto md:flex-col md:overflow-visible">
          {NAV.map((item) => {
            const active = item.match ? item.match(pathname) : pathname.startsWith(item.to);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                aria-current={active ? 'page' : undefined}
                aria-label={collapsed ? item.label : undefined}
                className={navClass(active)}
              >
                <Icon d={item.icon} />
                <span className={labelClass}>{item.label}</span>
                {tip(item.label)}
              </NavLink>
            );
          })}
        </nav>

        <div className="mt-auto hidden flex-col gap-1 md:flex">
          <a
            href="/"
            target="_blank"
            rel="noreferrer noopener"
            aria-label={collapsed ? 'View public site (opens in a new tab)' : undefined}
            className={navClass(false)}
          >
            <Icon d={EXTERNAL_ICON} />
            <span className={labelClass}>View public site</span>
            {tip('View public site')}
          </a>
          <button
            type="button"
            onClick={toggle}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-expanded={!collapsed}
            className={`${navClass(false)} w-full`}
          >
            <Icon d={collapsed ? EXPAND_ICON : COLLAPSE_ICON} />
            <span className={labelClass}>Collapse</span>
            {tip(collapsed ? 'Expand sidebar' : 'Collapse sidebar')}
          </button>
        </div>
        <a
          href="/"
          target="_blank"
          rel="noreferrer noopener"
          className="flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium text-admin-muted hover:text-admin-label md:hidden"
        >
          <Icon d={EXTERNAL_ICON} />
          View public site
        </a>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex min-h-16 flex-wrap items-center justify-between gap-4 border-b border-admin-subtle px-4 py-2 md:px-8">
          <nav aria-label="Breadcrumb" className="text-sm text-admin-muted">
            <ol className="flex flex-wrap items-center">
              <li>Admin</li>
              {trail.map(([label, to], i) => (
                <li key={label} className="flex items-center">
                  <span aria-hidden="true" className="px-1.5">/</span>
                  {to && i < trail.length - 1 ? (
                    <Link to={to} className="hover:text-admin-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-admin-accent">
                      {label}
                    </Link>
                  ) : (
                    <span aria-current="page" className="text-admin-label">{label}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>

          <MenuButton
            ariaLabel="Account menu"
            buttonClassName="flex h-11 items-center gap-2 rounded-full border border-admin-border pl-1 pr-3 text-admin-label hover:border-admin-accent-border focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-admin-accent md:h-10"
            label={
              <>
                <span
                  aria-hidden="true"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-admin-accent-border bg-admin-accent-bg text-xs font-semibold text-admin-accent-text"
                >
                  {initials(user?.email)}
                </span>
                <span className="hidden max-w-[16rem] truncate font-medium sm:inline">{user?.email || 'Administrator'}</span>
                <Icon d="M6 9l6 6 6-6" size={16} />
              </>
            }
            items={[
              { label: 'View public site', href: '/', external: true },
              { label: 'Sign out', tone: 'danger', onSelect: signOutUser },
            ]}
          />
        </header>

        <main id="admin-main" tabIndex={-1} className="mx-auto w-full max-w-shell p-4 focus:outline-none md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
