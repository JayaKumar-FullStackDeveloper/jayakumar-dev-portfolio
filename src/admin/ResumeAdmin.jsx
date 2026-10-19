import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FaCheckCircle, FaCloudUploadAlt, FaEllipsisV, FaEye, FaFilePdf } from 'react-icons/fa';
import { MEDIA_LIMITS } from '../services/mediaService';
import {
  deleteResume,
  listResumes,
  publishResume,
  renameResume,
  RESUME_TITLE_MAX,
  unpublishResume,
  uploadResume,
  validateResumeTitle,
} from '../services/resumeService';
import {
  Button,
  buttonClass,
  Card,
  EmptyState,
  ErrorState,
  Field,
  formatDate,
  Icon,
  inputClass,
  MenuButton,
  SkeletonRows,
  smallButtonClass,
  StatusBadge,
  useConfirm,
  useSession,
  useToast,
} from './ui';

// Resume manager: upload PDFs, choose the ONE shown on the portfolio's "View Full Resume" link.

const formatBytes = (bytes) =>
  bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
const titleFromFile = (name) => name.replace(/\.pdf$/i, '').replace(/[_-]+/g, ' ').trim();
const kebabClass =
  'flex h-8 w-8 items-center justify-center rounded-full border border-admin-border text-admin-body hover:border-admin-accent-border hover:text-admin-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-admin-accent max-md:h-11 max-md:w-11';
const errorText = (err) =>
  err?.code === 'permission-denied'
    ? 'Firebase refused this change. Re-publish firestore.rules in the Firebase console (Firestore → Rules), then try again.'
    : err?.message || 'Something went wrong.';

function UploadCard({ onUploaded }) {
  const { user } = useSession();
  const toast = useToast();
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [titleError, setTitleError] = useState('');
  const [progress, setProgress] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');

  const pick = (picked) => {
    if (!picked) return;
    setError('');
    if (picked.type !== 'application/pdf') {
      setError('Choose a PDF file.');
      return;
    }
    if (picked.size > MEDIA_LIMITS.raw.maxBytes) {
      setError(`That file is too large. Use ${MEDIA_LIMITS.raw.label}.`);
      return;
    }
    setFile(picked);
    setTitle((t) => t || titleFromFile(picked.name).slice(0, RESUME_TITLE_MAX));
  };

  const reset = () => {
    setFile(null);
    setTitle('');
    setTitleError('');
    setError('');
    if (inputRef.current) inputRef.current.value = '';
  };

  const submit = async (e) => {
    e.preventDefault();
    const problem = validateResumeTitle(title);
    setTitleError(problem || '');
    if (problem || !file) return;
    setError('');
    setProgress(0);
    try {
      await uploadResume(file, title, user.uid, { onProgress: setProgress });
      toast.show({ text: `"${title.trim()}" uploaded. Publish it to show it on the portfolio.` });
      reset();
      onUploaded();
    } catch (err) {
      setError(errorText(err));
    } finally {
      setProgress(null);
    }
  };

  const uploading = progress !== null;

  return (
    <Card as="form" onSubmit={submit} noValidate className="flex flex-col gap-4 p-5" aria-labelledby="upload-heading">
      <h2 id="upload-heading" className="font-semibold text-admin-strong">Upload a resume</h2>

      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          pick(e.dataTransfer.files[0]);
        }}
        className={`flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed px-6 py-8 text-center transition-colors ${
          dragging ? 'border-admin-accent-border bg-admin-accent-bg' : 'border-admin-border hover:border-admin-accent-border'
        }`}
      >
        <Icon as={file ? FaFilePdf : FaCloudUploadAlt} size={28} className={file ? 'text-admin-accent' : 'text-admin-muted'} />
        {file ? (
          <>
            <span className="font-medium text-admin-strong">{file.name}</span>
            <span className="text-xs text-admin-muted">{formatBytes(file.size)} · click to choose a different file</span>
          </>
        ) : (
          <>
            <span className="font-medium text-admin-label">Drop a PDF here, or click to browse</span>
            <span className="text-xs text-admin-muted">{MEDIA_LIMITS.raw.label}</span>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={MEDIA_LIMITS.raw.accept}
          className="sr-only"
          disabled={uploading}
          onChange={(e) => pick(e.target.files[0])}
        />
      </label>

      <Field id="resume-title" label="Name" required hint="Only you see this. It helps you tell versions apart." error={titleError}>
        <input
          id="resume-title"
          className={inputClass}
          value={title}
          maxLength={RESUME_TITLE_MAX}
          placeholder="UI/UX Designer resume 2026"
          onChange={(e) => setTitle(e.target.value)}
          aria-invalid={Boolean(titleError)}
          aria-describedby={titleError ? 'resume-title-error' : 'resume-title-hint'}
        />
      </Field>

      {uploading && (
        <div className="h-1.5 overflow-hidden rounded bg-slate-800" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label="Upload progress">
          <div className="h-full bg-teal-400 transition-all" style={{ width: `${progress}%` }} />
        </div>
      )}
      {error && <p className="text-sm text-admin-danger-text" role="alert">{error}</p>}

      <div className="flex flex-wrap gap-2">
        <Button type="submit" variant="primary" disabled={!file} loading={uploading}>
          {uploading ? `Uploading… ${progress}%` : 'Upload resume'}
        </Button>
        {file && !uploading && (
          <button type="button" className={buttonClass.secondary} onClick={reset}>
            Clear
          </button>
        )}
      </div>
    </Card>
  );
}

export default function ResumeAdmin() {
  const { user } = useSession();
  const toast = useToast();
  const [confirm, confirmDialog] = useConfirm();
  const [data, setData] = useState({ status: 'loading', resumes: [], publishedId: null });
  const [loadError, setLoadError] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [renaming, setRenaming] = useState(null); // { id, title, error }

  const load = useCallback(async () => {
    setLoadError('');
    try {
      const result = await listResumes();
      setData({ status: 'ready', ...result });
    } catch (err) {
      setData((d) => ({ ...d, status: 'error' }));
      setLoadError(errorText(err));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const published = data.resumes.find((r) => r.published) || null;

  const run = async (id, action, success) => {
    setBusyId(id);
    try {
      await action();
      toast.show({ text: success });
      await load();
    } catch (err) {
      toast.show({ tone: 'error', text: errorText(err) });
    } finally {
      setBusyId(null);
    }
  };

  const publish = async (resume) => {
    if (
      published &&
      !(await confirm({
        title: `Publish "${resume.title}"?`,
        description: `It replaces "${published.title}" as the resume on your portfolio. Only one resume can be published at a time.`,
        confirmLabel: 'Publish',
      }))
    ) {
      return;
    }
    run(resume.id, () => publishResume(resume, user.uid), `"${resume.title}" is now the resume on your portfolio.`);
  };

  const unpublish = async (resume) => {
    if (
      !(await confirm({
        title: `Unpublish "${resume.title}"?`,
        description: 'The "View Full Resume" link disappears from your portfolio until you publish a resume again.',
        confirmLabel: 'Unpublish',
        tone: 'warn',
      }))
    ) {
      return;
    }
    run(resume.id, () => unpublishResume(resume, user.uid), 'Resume unpublished. No resume is shown on the portfolio.');
  };

  const remove = async (resume) => {
    if (
      !(await confirm({
        title: `Delete "${resume.title}"?`,
        description: 'The PDF is removed from Cloudinary and this list. It cannot be undone.',
        confirmLabel: 'Delete',
        tone: 'danger',
      }))
    ) {
      return;
    }
    run(resume.id, () => deleteResume(resume, user.uid), 'Resume deleted.');
  };

  const saveRename = async (resume) => {
    const error = validateResumeTitle(renaming.title);
    if (error) {
      setRenaming((r) => ({ ...r, error }));
      return;
    }
    const title = renaming.title.trim();
    setRenaming(null);
    if (title !== resume.title) run(resume.id, () => renameResume(resume, title, user.uid), 'Resume renamed.');
  };

  return (
    <section aria-labelledby="resume-heading" className="flex flex-col gap-6">
      {confirmDialog}

      <div className="flex flex-col gap-1">
        <h1 id="resume-heading" className="text-xl font-bold text-admin-heading">Resume</h1>
        <p className="text-admin-muted">
          Upload PDF versions of your resume and choose the one behind the portfolio's "View Full Resume" link. Only one can be published at a time.
        </p>
      </div>

      {data.status === 'ready' && (
        <Card className="flex flex-wrap items-center justify-between gap-4 p-5">
          <div className="flex min-w-0 items-center gap-3">
            <span
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${
                published ? 'border-admin-accent-border bg-admin-accent-bg text-admin-accent' : 'border-admin-warn-border bg-admin-warn-bg text-admin-warn-text'
              }`}
            >
              <Icon as={published ? FaCheckCircle : FaFilePdf} size={16} />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-admin-muted">Live on portfolio</p>
              <p className="truncate font-medium text-admin-strong">
                {published ? published.title : 'No resume published: the "View Full Resume" link is hidden.'}
              </p>
            </div>
          </div>
          {published && (
            <a href={published.url} target="_blank" rel="noreferrer noopener" className={buttonClass.secondary}>
              <Icon as={FaEye} size={14} />
              Open PDF
            </a>
          )}
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <UploadCard onUploaded={load} />

        <div className="flex min-w-0 flex-col gap-3">
          <h2 className="font-semibold text-admin-strong">All resumes</h2>
          {data.status === 'loading' && <SkeletonRows count={3} label="Loading resumes" />}
          {data.status === 'error' && (
            <ErrorState title="Couldn't load resumes" onRetry={load}>
              {loadError}
            </ErrorState>
          )}
          {data.status === 'ready' && data.resumes.length === 0 && (
            <EmptyState title="No resumes yet">Upload your first PDF, then publish it.</EmptyState>
          )}
          {data.status === 'ready' && data.resumes.length > 0 && (
            <ul className="flex flex-col gap-3" aria-label="Resumes">
              {data.resumes.map((resume) => {
                const busy = busyId === resume.id;
                const editing = renaming?.id === resume.id;
                return (
                  <Card as="li" key={resume.id} className={`flex flex-col gap-3 p-4 ${resume.published ? 'border-admin-accent-border' : ''}`}>
                    <div className="flex items-start gap-3">
                      <Icon as={FaFilePdf} size={22} className="mt-0.5 text-admin-muted" />
                      <div className="min-w-0 flex-1">
                        {editing ? (
                          <form
                            className="flex flex-wrap items-start gap-2"
                            onSubmit={(e) => {
                              e.preventDefault();
                              saveRename(resume);
                            }}
                          >
                            <div className="min-w-[12rem] flex-1">
                              <label htmlFor={`rename-${resume.id}`} className="sr-only">Resume name</label>
                              <input
                                id={`rename-${resume.id}`}
                                className={inputClass}
                                value={renaming.title}
                                maxLength={RESUME_TITLE_MAX}
                                autoFocus
                                onChange={(e) => setRenaming({ id: resume.id, title: e.target.value })}
                                onKeyDown={(e) => e.key === 'Escape' && setRenaming(null)}
                                aria-invalid={Boolean(renaming.error)}
                              />
                              {renaming.error && <p className="mt-1 text-xs text-admin-danger-text">{renaming.error}</p>}
                            </div>
                            <button type="submit" className={smallButtonClass.primary}>Save</button>
                            <button type="button" className={smallButtonClass.secondary} onClick={() => setRenaming(null)}>Cancel</button>
                          </form>
                        ) : (
                          <p className="truncate font-medium text-admin-strong" title={resume.title}>{resume.title}</p>
                        )}
                        <p className="truncate text-xs text-admin-muted" title={resume.fileName}>
                          {resume.fileName} · {formatBytes(resume.sizeBytes)} · Uploaded {formatDate(resume.createdAt)}
                        </p>
                      </div>
                      <StatusBadge status={resume.published ? 'published' : 'draft'} />
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-2 border-t border-admin-subtle pt-3">
                      <a href={resume.url} target="_blank" rel="noreferrer noopener" className={smallButtonClass.secondary}>
                        <Icon as={FaEye} size={11} />
                        Preview
                      </a>
                      {resume.published ? (
                        <button type="button" className={smallButtonClass.secondary} disabled={busy} onClick={() => unpublish(resume)}>
                          Unpublish
                        </button>
                      ) : (
                        <button type="button" className={smallButtonClass.primary} disabled={busy} onClick={() => publish(resume)}>
                          {busy ? 'Publishing…' : 'Publish'}
                        </button>
                      )}
                      <MenuButton
                        ariaLabel={`More actions for ${resume.title}`}
                        buttonClassName={kebabClass}
                        label={<Icon as={FaEllipsisV} size={13} />}
                        items={[
                          { label: 'Rename', disabled: busy, onSelect: () => setRenaming({ id: resume.id, title: resume.title }) },
                          {
                            label: resume.published ? 'Delete (unpublish first)' : 'Delete',
                            tone: 'danger',
                            disabled: busy || resume.published,
                            onSelect: () => remove(resume),
                          },
                        ]}
                      />
                    </div>
                  </Card>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
