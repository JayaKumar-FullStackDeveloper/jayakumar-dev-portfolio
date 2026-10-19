import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { LEGACY_PROJECTS } from '../data/legacyProjects';
import {
  isSafeUrl,
  LINK_TYPES,
  parseTags,
  parseVideoUrl,
  PROJECT_TYPES,
  slugify,
  validateProject,
  videoEmbedUrl,
  videoFileUrl,
  videoWatchUrl,
} from '../lib/validation';
import { listCategories } from '../services/categoryService';
import {
  archiveProject,
  ConflictError,
  createProject,
  getProject,
  importLegacyProjects,
  listProjects,
  permanentlyDeleteProject,
  publishProject,
  restoreProject,
  softDeleteProject,
  unpublishProject,
  updateProject,
  ValidationError,
} from '../services/projectService';
import { ProjectCard } from '../components/projects';
import { Banner, buttonClass, Field, formatDate, inputClass, smallButtonClass, StatusBadge, useSession } from './ui';
import { MediaPicker, UploadButton } from './MediaAdmin';

const errorMessage = (err) =>
  err instanceof ValidationError ? Object.values(err.fieldErrors).join(' ') : err.message || 'Something went wrong.';

/* ======================================================================
   Project list
   ====================================================================== */

const STATUS_FILTERS = [
  { id: 'active', label: 'All (not in trash)' },
  { id: 'draft', label: 'Drafts' },
  { id: 'published', label: 'Published' },
  { id: 'archived', label: 'Archived' },
  { id: 'trash', label: 'Trash' },
];

function matchesStatus(project, filter) {
  if (filter === 'trash') return Boolean(project.deletedAt);
  if (project.deletedAt) return false;
  return filter === 'active' || project.status === filter;
}

export function ProjectsList() {
  const { user } = useSession();
  const [data, setData] = useState({ status: 'loading', projects: [], categories: [] });
  const [filters, setFilters] = useState({ type: 'all', status: 'active', category: 'all', featured: false, search: '' });
  const [busyId, setBusyId] = useState(null);
  const [notice, setNotice] = useState(null);

  const load = useCallback(async () => {
    try {
      const [projects, categories] = await Promise.all([listProjects(), listCategories()]);
      setData({ status: 'ready', projects, categories });
    } catch (err) {
      setData((d) => ({ ...d, status: 'error' }));
      setNotice({ tone: 'error', text: `Couldn't load projects: ${errorMessage(err)}` });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const categoryName = (id) => data.categories.find((c) => c.id === id)?.name || id;
  const setFilter = (key) => (e) =>
    setFilters((f) => ({ ...f, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const visible = data.projects.filter((p) => {
    const search = filters.search.trim().toLowerCase();
    return (
      matchesStatus(p, filters.status) &&
      (filters.type === 'all' || p.type === filters.type) &&
      (filters.category === 'all' || (p.categoryIds || []).includes(filters.category)) &&
      (!filters.featured || p.featured) &&
      (!search || p.title.toLowerCase().includes(search) || p.slug.includes(search))
    );
  });

  const legacyMissing = LEGACY_PROJECTS.some((l) => !data.projects.some((p) => p.slug === l.slug));

  const run = async (id, action, confirmText, successText) => {
    if (confirmText && !window.confirm(confirmText)) return;
    setBusyId(id);
    setNotice(null);
    try {
      await action();
      setNotice({ tone: 'success', text: successText });
      await load();
    } catch (err) {
      setNotice({ tone: 'error', text: errorMessage(err) });
    } finally {
      setBusyId(null);
    }
  };

  const runImport = () =>
    run('import', async () => {
      const count = await importLegacyProjects(user.uid);
      if (count === 0) throw new Error('Nothing to import: all original projects already exist.');
    }, 'Import the original 4 projects as published Development projects?', 'Original projects imported and published.');

  return (
    <section aria-labelledby="projects-heading">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 id="projects-heading" className="text-xl font-bold text-teal-300">
          Projects
        </h1>
        <div className="flex flex-wrap gap-2">
          {data.status === 'ready' && legacyMissing && (
            <button type="button" className={buttonClass.secondary} onClick={runImport} disabled={busyId === 'import'}>
              {busyId === 'import' ? 'Importing…' : 'Import original projects'}
            </button>
          )}
          <Link to="/admin/projects/new" className={buttonClass.primary}>
            Add project
          </Link>
        </div>
      </div>

      {notice && (
        <Banner tone={notice.tone} onDismiss={() => setNotice(null)}>
          {notice.text}
        </Banner>
      )}

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <input
          type="search"
          placeholder="Search title or slug"
          aria-label="Search projects"
          value={filters.search}
          onChange={setFilter('search')}
          className={`${inputClass} lg:col-span-2`}
        />
        <select aria-label="Filter by type" value={filters.type} onChange={setFilter('type')} className={inputClass}>
          <option value="all">All types</option>
          {PROJECT_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <select aria-label="Filter by status" value={filters.status} onChange={setFilter('status')} className={inputClass}>
          {STATUS_FILTERS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
        <select aria-label="Filter by category" value={filters.category} onChange={setFilter('category')} className={inputClass}>
          <option value="all">All categories</option>
          {data.categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={filters.featured} onChange={setFilter('featured')} className="accent-teal-400" />
          Featured only
        </label>
      </div>

      {data.status === 'loading' && <p role="status">Loading projects…</p>}
      {data.status === 'error' && (
        <button type="button" className={buttonClass.secondary} onClick={load}>
          Try again
        </button>
      )}
      {data.status === 'ready' && visible.length === 0 && (
        <p className="rounded-lg border border-dashed border-slate-700 p-6 text-center text-sm">
          {data.projects.length === 0 ? 'No projects yet. Add your first project to get started.' : 'No projects match these filters.'}
        </p>
      )}

      <ul className="space-y-3">
        {visible.map((p) => {
          const busy = busyId === p.id;
          const uid = user.uid;
          return (
            <li key={p.id} className="flex flex-col gap-4 rounded-lg border border-slate-700/70 p-4 sm:flex-row">
              <div className="aspect-video w-full shrink-0 overflow-hidden rounded-md bg-slate-800 sm:w-36">
                {p.coverMedia?.url && (
                  <img src={p.coverMedia.url} alt="" className="h-full w-full object-cover object-top" loading="lazy" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-medium text-slate-200">{p.title}</h2>
                  <StatusBadge project={p} />
                  {p.featured && <span className="rounded-full bg-slate-700/60 px-2.5 py-0.5 text-xs">Featured</span>}
                </div>
                <p className="mt-1 text-xs text-admin-muted">
                  {p.type} · {(p.categoryIds || []).map(categoryName).join(', ') || 'No category'} · /{p.slug} · Updated{' '}
                  {formatDate(p.updatedAt)}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {p.deletedAt ? (
                    <>
                      <button type="button" disabled={busy} className={smallButtonClass.secondary}
                        onClick={() => run(p.id, () => restoreProject(p.id, uid), null, 'Project restored as a draft.')}>
                        Restore
                      </button>
                      <button type="button" disabled={busy} className={smallButtonClass.danger}
                        onClick={() => run(p.id, () => permanentlyDeleteProject(p.id, uid),
                          `Permanently delete "${p.title}"? This can't be undone.`, 'Project permanently deleted.')}>
                        Delete permanently
                      </button>
                    </>
                  ) : (
                    <>
                      <Link to={`/admin/projects/${p.id}`} className={smallButtonClass.secondary}>
                        Edit
                      </Link>
                      {p.status === 'published' && (
                        <a href={`/projects/${p.slug}`} target="_blank" rel="noreferrer noopener" className={smallButtonClass.secondary}>
                          View
                        </a>
                      )}
                      {p.status === 'published' ? (
                        <button type="button" disabled={busy} className={smallButtonClass.secondary}
                          onClick={() => run(p.id, () => unpublishProject(p.id, uid),
                            `Unpublish "${p.title}"? It will disappear from the public portfolio.`, 'Project unpublished.')}>
                          Unpublish
                        </button>
                      ) : (
                        <button type="button" disabled={busy} className={smallButtonClass.primary}
                          onClick={() => run(p.id, () => publishProject(p.id, uid), null, 'Project published.')}>
                          Publish
                        </button>
                      )}
                      {p.status === 'archived' ? (
                        <button type="button" disabled={busy} className={smallButtonClass.secondary}
                          onClick={() => run(p.id, () => restoreProject(p.id, uid), null, 'Project restored as a draft.')}>
                          Restore
                        </button>
                      ) : (
                        <button type="button" disabled={busy} className={smallButtonClass.secondary}
                          onClick={() => run(p.id, () => archiveProject(p.id, uid),
                            `Archive "${p.title}"? It will be hidden from the public portfolio.`, 'Project archived.')}>
                          Archive
                        </button>
                      )}
                      <button type="button" disabled={busy} className={smallButtonClass.danger}
                        onClick={() => run(p.id, () => softDeleteProject(p.id, uid),
                          `Move "${p.title}" to the trash? It will be hidden from the public portfolio.`, 'Project moved to the trash.')}>
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      {data.projects.length >= 500 && (
        <p className="mt-4 text-xs text-admin-muted">Showing the 500 most recently updated projects.</p>
      )}
    </section>
  );
}

/* ======================================================================
   Project editor
   ====================================================================== */

const EMPTY_FORM = {
  title: '',
  slug: '',
  type: 'Design',
  shortDescription: '',
  description: '',
  categoryIds: [],
  techStackText: '',
  coverUrl: '',
  coverAlt: '',
  videoUrl: '',
  projectUrl: '',
  links: [],
  featured: false,
  sortOrder: 0,
};

function toForm(project) {
  return {
    title: project.title || '',
    slug: project.slug || '',
    type: project.type || 'Design',
    shortDescription: project.shortDescription || '',
    description: project.description || '',
    categoryIds: project.categoryIds || [],
    techStackText: (project.techStack || []).join(', '),
    coverUrl: project.coverMedia?.url || '',
    coverAlt: project.coverMedia?.alt || '',
    videoUrl: videoWatchUrl((project.media || []).find((m) => m.type === 'video')),
    projectUrl: project.projectUrl || '',
    links: project.links || [],
    featured: Boolean(project.featured),
    sortOrder: project.sortOrder ?? 0,
  };
}

function toInput(form) {
  return {
    title: form.title,
    slug: form.slug,
    type: form.type,
    shortDescription: form.shortDescription,
    description: form.description,
    categoryIds: form.categoryIds,
    techStack: parseTags(form.techStackText),
    coverMedia: { url: form.coverUrl.trim(), alt: form.coverAlt },
    videoUrl: form.videoUrl.trim(),
    projectUrl: form.projectUrl.trim(),
    links: form.links,
    featured: form.featured,
    sortOrder: Number(form.sortOrder),
  };
}

export function ProjectEditor() {
  const { id } = useParams();
  const isNew = !id;
  const navigate = useNavigate();
  const { user } = useSession();

  const [loadState, setLoadState] = useState('loading');
  const [categories, setCategories] = useState([]);
  const [stored, setStored] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [initial, setInitial] = useState(EMPTY_FORM);
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoadState('loading');
    try {
      const [cats, project] = await Promise.all([listCategories(), isNew ? null : getProject(id)]);
      setCategories(cats);
      if (!isNew && !project) {
        setLoadState('missing');
        return;
      }
      const next = project ? toForm(project) : EMPTY_FORM;
      setStored(project);
      setForm(next);
      setInitial(next);
      setSlugTouched(Boolean(project));
      setErrors({});
      setLoadState('ready');
    } catch (err) {
      setNotice({ tone: 'error', text: `Couldn't load: ${errorMessage(err)}` });
      setLoadState('error');
    }
  }, [id, isNew]);

  useEffect(() => {
    load();
  }, [load]);

  const dirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(initial), [form, initial]);

  // Warn before closing or reloading the tab with unsaved changes.
  useEffect(() => {
    if (!dirty) return undefined;
    const warn = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  const onTitle = (value) =>
    setForm((f) => ({ ...f, title: value, slug: slugTouched ? f.slug : slugify(value) }));
  const onType = (type) =>
    setForm((f) => ({
      ...f,
      type,
      categoryIds: f.categoryIds.filter((cid) => categories.find((c) => c.id === cid)?.projectTypes?.includes(type)),
    }));
  const toggleCategory = (cid) =>
    setForm((f) => ({
      ...f,
      categoryIds: f.categoryIds.includes(cid) ? f.categoryIds.filter((x) => x !== cid) : [...f.categoryIds, cid],
    }));
  const updateLink = (index, key, value) =>
    setForm((f) => ({ ...f, links: f.links.map((l, i) => (i === index ? { ...l, [key]: value } : l)) }));

  const typeCategories = categories.filter(
    (c) => (c.projectTypes || []).includes(form.type) && (c.active || form.categoryIds.includes(c.id))
  );

  const save = async ({ publish }) => {
    const input = toInput(form);
    const fieldErrors = validateProject(input, {
      publish: publish || stored?.status === 'published',
      categories,
    });
    setErrors(fieldErrors);
    setNotice(null);
    if (Object.keys(fieldErrors).length) {
      setNotice({ tone: 'error', text: 'Please fix the highlighted fields.' });
      return;
    }

    setSaving(true);
    let createdId = null;
    let saved = false;
    try {
      if (isNew) createdId = await createProject(input, user.uid);
      else await updateProject(id, input, user.uid, stored?.updatedAt?.toMillis?.() ?? null);
      saved = true;
      setInitial(form);
      if (publish) await publishProject(createdId || id, user.uid);
      setNotice({ tone: 'success', text: publish ? 'Saved and published.' : 'Saved.' });
    } catch (err) {
      if (err instanceof ValidationError) setErrors(err.fieldErrors);
      setNotice({
        tone: 'error',
        text: saved ? `Saved, but not published: ${errorMessage(err)}` : errorMessage(err),
        conflict: err instanceof ConflictError,
      });
    } finally {
      setSaving(false);
    }
    // A new project now exists: move to its edit URL so saving again doesn't create a duplicate.
    if (createdId) navigate(`/admin/projects/${createdId}`, { replace: true });
    else if (saved) await load();
  };

  const cancel = () => {
    if (dirty && !window.confirm('Discard your unsaved changes?')) return;
    navigate('/admin');
  };

  if (loadState === 'loading') return <p role="status">Loading…</p>;
  if (loadState === 'missing') {
    return (
      <Banner tone="error">
        This project doesn't exist. <Link to="/admin" className="underline">Back to projects</Link>
      </Banner>
    );
  }
  if (loadState === 'error') {
    return (
      <>
        {notice && <Banner tone="error">{notice.text}</Banner>}
        <button type="button" className={buttonClass.secondary} onClick={load}>
          Try again
        </button>
      </>
    );
  }

  const isPublished = stored?.status === 'published';
  const preview = {
    id: 'preview',
    type: form.type,
    title: form.title || 'Project title',
    description: form.shortDescription || 'Short description',
    thumbnail: isSafeUrl(form.coverUrl) ? form.coverUrl : null,
    thumbnailAlt: form.coverAlt,
    tags: parseTags(form.techStackText),
    href: null,
    categoryIds: form.categoryIds,
  };
  const errorProps = (key) =>
    errors[key] ? { 'aria-invalid': true, 'aria-describedby': `${key}-error` } : {};

  return (
    <section aria-labelledby="editor-heading">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <h1 id="editor-heading" className="text-xl font-bold text-teal-300">
          {isNew ? 'New project' : 'Edit project'}
        </h1>
        {stored && <StatusBadge project={stored} />}
        {dirty && <span className="text-xs text-admin-muted">Unsaved changes</span>}
      </div>

      {notice && (
        <Banner tone={notice.tone} onDismiss={() => setNotice(null)}>
          {notice.text}{' '}
          {notice.conflict && (
            <button type="button" className="underline" onClick={load}>
              Reload latest version
            </button>
          )}
        </Banner>
      )}

      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          save({ publish: false });
        }}
        className="grid gap-8 lg:grid-cols-5"
      >
        <div className="space-y-5 lg:col-span-3">
          <Field id="title" label="Title" required error={errors.title}>
            <input id="title" className={inputClass} value={form.title} onChange={(e) => onTitle(e.target.value)} {...errorProps('title')} />
          </Field>
          <Field id="slug" label="Slug" required hint="Used in the project's URL. Lowercase letters, numbers and hyphens." error={errors.slug}>
            <input
              id="slug"
              className={inputClass}
              value={form.slug}
              onChange={(e) => {
                setSlugTouched(true);
                update('slug', e.target.value);
              }}
              onBlur={() => update('slug', slugify(form.slug))}
              {...errorProps('slug')}
            />
          </Field>

          <fieldset>
            <legend className="mb-1 text-sm font-medium text-slate-200">
              Type<span className="text-teal-300"> *</span>
            </legend>
            <div className="flex gap-4">
              {PROJECT_TYPES.map((t) => (
                <label key={t} className="flex items-center gap-2 text-sm">
                  <input type="radio" name="type" value={t} checked={form.type === t} onChange={() => onType(t)} className="accent-teal-400" />
                  {t}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset aria-describedby={errors.categoryIds ? 'categoryIds-error' : undefined}>
            <legend className="mb-1 text-sm font-medium text-slate-200">
              Categories<span className="text-teal-300"> *</span>
            </legend>
            {typeCategories.length === 0 ? (
              <p className="text-xs text-admin-muted">
                No categories for this type yet. <Link to="/admin/categories" className="underline">Manage categories</Link>
              </p>
            ) : (
              <div className="flex flex-wrap gap-x-4 gap-y-2">
                {typeCategories.map((c) => (
                  <label key={c.id} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={form.categoryIds.includes(c.id)} onChange={() => toggleCategory(c.id)} className="accent-teal-400" />
                    {c.name}
                    {!c.active && <span className="text-xs text-admin-muted">(inactive)</span>}
                  </label>
                ))}
              </div>
            )}
            {errors.categoryIds && <p id="categoryIds-error" className="mt-1 text-xs text-red-300">{errors.categoryIds}</p>}
          </fieldset>

          <Field id="shortDescription" label="Short description" required hint="Shown on the project card (2 lines)." error={errors.shortDescription}>
            <textarea id="shortDescription" rows={2} className={inputClass} value={form.shortDescription}
              onChange={(e) => update('shortDescription', e.target.value)} {...errorProps('shortDescription')} />
          </Field>
          <Field id="description" label="Full description / case study" error={errors.description}>
            <textarea id="description" rows={6} className={inputClass} value={form.description}
              onChange={(e) => update('description', e.target.value)} {...errorProps('description')} />
          </Field>
          <Field id="techStack" label="Tools / tech stack" hint="Comma-separated, e.g. Figma, UI Design, Prototyping." error={errors.techStack}>
            <input id="techStack" className={inputClass} value={form.techStackText}
              onChange={(e) => update('techStackText', e.target.value)} {...errorProps('techStack')} />
          </Field>

          <Field id="coverUrl" label="Cover image URL" hint="Use a 16:9 image, ideally 1600 × 900 px (at least 1280 × 720). Upload, choose from the library, or paste an https:// URL. Required to publish." error={errors.coverUrl}>
            <input id="coverUrl" type="url" className={inputClass} value={form.coverUrl}
              onChange={(e) => update('coverUrl', e.target.value)} {...errorProps('coverUrl')} />
          </Field>
          <div className="flex flex-wrap items-start gap-4">
            <UploadButton type="image" label="Upload image"
              onUploaded={(item) => setForm((f) => ({ ...f, coverUrl: item.url, coverAlt: f.coverAlt || item.altText }))} />
            <MediaPicker type="image"
              onPick={(item) => setForm((f) => ({ ...f, coverUrl: item.url, coverAlt: f.coverAlt || item.altText }))} />
          </div>
          <Field id="coverAlt" label="Cover image alt text" hint="Describe the image for screen readers. Required to publish." error={errors.coverAlt}>
            <input id="coverAlt" className={inputClass} value={form.coverAlt}
              onChange={(e) => update('coverAlt', e.target.value)} {...errorProps('coverAlt')} />
          </Field>

          <Field id="videoUrl" label="Video link" hint="Optional. Paste a YouTube or Vimeo link, or upload a video. Shown on the project's detail page." error={errors.videoUrl}>
            <input id="videoUrl" type="url" className={inputClass} value={form.videoUrl}
              onChange={(e) => update('videoUrl', e.target.value)} {...errorProps('videoUrl')} />
          </Field>
          <div className="flex flex-wrap items-start gap-4">
            <UploadButton type="video" label="Upload video" onUploaded={(item) => update('videoUrl', item.url)} />
            <MediaPicker type="video" onPick={(item) => update('videoUrl', item.url)} />
          </div>
          {videoFileUrl(parseVideoUrl(form.videoUrl)) && (
            <video src={videoFileUrl(parseVideoUrl(form.videoUrl))} controls preload="metadata" className="aspect-video w-full rounded-md border border-slate-700 bg-black" />
          )}
          {videoEmbedUrl(parseVideoUrl(form.videoUrl)) && (
            <div className="aspect-video overflow-hidden rounded-md border border-slate-700">
              <iframe
                title="Video preview"
                src={videoEmbedUrl(parseVideoUrl(form.videoUrl))}
                className="h-full w-full"
                loading="lazy"
                allow="encrypted-media; picture-in-picture; fullscreen"
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>
          )}

          <Field id="projectUrl" label="Primary link" hint="Main external link on the project's detail page (live site, case study…). https:// only." error={errors.projectUrl}>
            <input id="projectUrl" type="url" className={inputClass} value={form.projectUrl}
              onChange={(e) => update('projectUrl', e.target.value)} {...errorProps('projectUrl')} />
          </Field>

          <fieldset>
            <legend className="mb-2 text-sm font-medium text-slate-200">Additional links</legend>
            <div className="space-y-3">
              {form.links.map((link, i) => (
                <div key={i}>
                  <div className="grid gap-2 sm:grid-cols-[1fr_9rem_2fr_auto]">
                    <input aria-label={`Link ${i + 1} label`} placeholder="Label" className={inputClass} value={link.label}
                      onChange={(e) => updateLink(i, 'label', e.target.value)} />
                    <select aria-label={`Link ${i + 1} type`} className={inputClass} value={link.type}
                      onChange={(e) => updateLink(i, 'type', e.target.value)}>
                      {LINK_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    <input aria-label={`Link ${i + 1} URL`} type="url" placeholder="https://" className={inputClass} value={link.url}
                      onChange={(e) => updateLink(i, 'url', e.target.value)} />
                    <button type="button" className={smallButtonClass.danger}
                      onClick={() => update('links', form.links.filter((_, x) => x !== i))}>
                      Remove
                    </button>
                  </div>
                  {errors[`link-${i}`] && <p className="mt-1 text-xs text-red-300">{errors[`link-${i}`]}</p>}
                </div>
              ))}
            </div>
            {errors.links && <p className="mt-1 text-xs text-red-300">{errors.links}</p>}
            <button type="button" className={`${smallButtonClass.secondary} mt-3`}
              onClick={() => update('links', [...form.links, { label: '', type: LINK_TYPES[0], url: '' }])}>
              Add link
            </button>
          </fieldset>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="sortOrder" label="Sort order" hint="Lower numbers appear first." error={errors.sortOrder}>
              <input id="sortOrder" type="number" className={inputClass} value={form.sortOrder}
                onChange={(e) => update('sortOrder', e.target.value)} {...errorProps('sortOrder')} />
            </Field>
            <label className="flex items-center gap-2 self-end pb-2 text-sm">
              <input type="checkbox" checked={form.featured} onChange={(e) => update('featured', e.target.checked)} className="accent-teal-400" />
              Featured (shown first)
            </label>
          </div>

          <div className="flex flex-wrap gap-2 border-t border-slate-700 pt-5">
            <button type="submit" className={buttonClass.secondary} disabled={saving}>
              {saving ? 'Saving…' : isPublished ? 'Save changes' : 'Save draft'}
            </button>
            {!isPublished && !stored?.deletedAt && (
              <button type="button" className={buttonClass.primary} disabled={saving} onClick={() => save({ publish: true })}>
                Save &amp; publish
              </button>
            )}
            <button type="button" className={buttonClass.secondary} onClick={cancel} disabled={saving}>
              Cancel
            </button>
          </div>
          {isPublished && (
            <p className="text-xs text-admin-muted">This project is live. Saved changes appear on the public portfolio immediately.</p>
          )}
        </div>

        <aside className="lg:col-span-2">
          <h2 className="mb-2 text-sm font-medium text-slate-200">Preview</h2>
          <p className="mb-3 text-xs text-admin-muted">How the card will look on the portfolio. Only visible to you.</p>
          <ul className="rounded-lg border border-slate-700/70 lg:sticky lg:top-6">
            <ProjectCard project={preview} />
          </ul>
        </aside>
      </form>
    </section>
  );
}
