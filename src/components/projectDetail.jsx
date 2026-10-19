import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { isFirebaseConfigured } from '../lib/firebaseConfig';

// Public detail page for one published project: /projects/:slug

const tagClass = 'flex items-center rounded-full bg-teal-400/10 px-3 py-1 text-xs font-medium leading-4 text-teal-200';

function ArrowIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="inline-block h-4 w-4 shrink-0 transition-transform group-hover/link:-translate-y-1 group-hover/link:translate-x-1 motion-reduce:transition-none ml-1 translate-y-px" aria-hidden="true">
      <path fillRule="evenodd" d="M5.22 14.78a.75.75 0 001.06 0l7.22-7.22v5.69a.75.75 0 001.5 0v-7.5a.75.75 0 00-.75-.75h-7.5a.75.75 0 000 1.5h5.69l-7.22 7.22a.75.75 0 000 1.06z" clipRule="evenodd"></path>
    </svg>
  );
}

function useProject(slug) {
  const [state, setState] = useState({ status: isFirebaseConfigured ? 'loading' : 'missing', project: null });

  useEffect(() => {
    if (!isFirebaseConfigured) return undefined;
    let cancelled = false;
    setState({ status: 'loading', project: null });
    Promise.all([import('../services/publicProjectService'), import('../services/analyticsService')])
      .then(async ([{ fetchPublishedProjectBySlug }, analytics]) => {
        const project = await fetchPublishedProjectBySlug(slug);
        if (cancelled) return;
        setState({ status: project ? 'ready' : 'missing', project, analytics });
        if (project) analytics.recordView(project.id);
      })
      .catch((err) => {
        console.error('Failed to load project', err);
        if (!cancelled) setState({ status: 'error', project: null });
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  return state;
}

export default function ProjectDetail() {
  const { slug } = useParams();
  const { status, project, analytics } = useProject(slug);

  useEffect(() => {
    if (project) document.title = `${project.title} · Jayakumar`;
  }, [project]);

  const trackClick = (url) => () => analytics?.recordOutboundClick(project.id, url);

  return (
    <div className="min-h-screen bg-slate-900 leading-relaxed text-slate-400 antialiased selection:bg-teal-300 selection:text-teal-900">
      <div className="mx-auto max-w-3xl px-6 py-12 md:px-12 md:py-20">
        <Link to="/" className="group inline-flex items-center text-sm font-semibold text-slate-200 hover:text-teal-300 focus-visible:text-teal-300">
          <span aria-hidden="true" className="mr-1 transition-transform group-hover:-translate-x-1">←</span>
          Jayakumar
        </Link>

        {status === 'loading' && (
          <p className="mt-12 text-sm" role="status">Loading project…</p>
        )}
        {status === 'missing' && (
          <div className="mt-12">
            <h1 className="text-xl font-bold text-teal-300">Project not found</h1>
            <p className="mt-2 text-sm">This project isn't available. It may have been moved or unpublished.</p>
          </div>
        )}
        {status === 'error' && (
          <p className="mt-12 text-sm" role="alert">
            This project couldn't be loaded right now. Please refresh the page to try again.
          </p>
        )}

        {status === 'ready' && (
          <article className="mt-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-teal-300">
              {[project.type, ...project.categoryNames].join(' · ')}
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-200 sm:text-4xl">{project.title}</h1>
            <p className="mt-4 text-base">{project.description}</p>

            <div className="mt-8 overflow-hidden rounded-lg border border-slate-700/70">
              {project.videoEmbedUrl ? (
                <iframe
                  title={`${project.title} video`}
                  src={project.videoEmbedUrl}
                  className="aspect-video w-full"
                  loading="lazy"
                  allow="encrypted-media; picture-in-picture; fullscreen"
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              ) : (
                project.thumbnail && (
                  <img src={project.thumbnail} alt={project.thumbnailAlt} width="1280" height="720" className="aspect-video w-full object-cover object-top" />
                )
              )}
            </div>

            {project.tags.length > 0 && (
              <ul className="mt-6 flex flex-wrap gap-2" aria-label="Tools and technologies">
                {project.tags.map((tag) => (
                  <li key={tag} className={tagClass}>{tag}</li>
                ))}
              </ul>
            )}

            {project.fullDescription && (
              <div className="mt-8 space-y-4 text-base">
                {project.fullDescription.split(/\n\s*\n/).map((paragraph, i) => (
                  <p key={i} className="whitespace-pre-line">{paragraph}</p>
                ))}
              </div>
            )}

            {(project.projectUrl || project.links.length > 0) && (
              <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-3" aria-label="Project links">
                {project.projectUrl && (
                  <li>
                    <a href={project.projectUrl} target="_blank" rel="noreferrer noopener" onClick={trackClick(project.projectUrl)}
                      className="group/link inline-flex items-baseline font-semibold text-teal-300 hover:text-teal-200">
                      View project<ArrowIcon /><span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  </li>
                )}
                {project.links.map((link) => (
                  <li key={`${link.label}-${link.url}`}>
                    <a href={link.url} target="_blank" rel="noreferrer noopener" onClick={trackClick(link.url)}
                      className="group/link inline-flex items-baseline font-semibold text-slate-200 hover:text-teal-300">
                      {link.label}<ArrowIcon /><span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </article>
        )}
      </div>
    </div>
  );
}
