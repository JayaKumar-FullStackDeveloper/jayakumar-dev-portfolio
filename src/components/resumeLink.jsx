import React, { useEffect, useState } from 'react';
import { isFirebaseConfigured } from '../lib/firebaseConfig';

// "View Full Resume" link to the resume published in the admin. Hidden when none is published.
function ResumeLink() {
  const [resume, setResume] = useState(null);

  useEffect(() => {
    if (!isFirebaseConfigured) return undefined;
    let cancelled = false;
    import('../services/publicResumeService')
      .then(({ fetchPublishedResume }) => fetchPublishedResume())
      .then((published) => {
        if (!cancelled) setResume(published);
      })
      .catch((err) => console.error('Failed to load resume', err));
    return () => {
      cancelled = true;
    };
  }, []);

  if (!resume) return null;

  return (
    <div className="mt-2 lg:mb-6 mb-4">
      <a
        className="inline-flex items-baseline leading-tight hover:text-teal-300 focus-visible:text-teal-300 font-semibold text-slate-200 group/link text-base"
        href={resume.url}
        target="_blank"
        rel="noreferrer noopener"
        aria-label="View Full Résumé (opens in a new tab)"
      >
        <span>
          View Full Resume
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="inline-block h-4 w-4 shrink-0 transition-transform group-hover/link:-translate-y-1 group-hover/link:translate-x-1 group-focus-visible/link:-translate-y-1 group-focus-visible/link:translate-x-1 motion-reduce:transition-none ml-1 translate-y-px" aria-hidden="true">
            <path fillRule="evenodd" d="M5.22 14.78a.75.75 0 001.06 0l7.22-7.22v5.69a.75.75 0 001.5 0v-7.5a.75.75 0 00-.75-.75h-7.5a.75.75 0 000 1.5h5.69l-7.22 7.22a.75.75 0 000 1.06z" clipRule="evenodd"></path>
          </svg>
        </span>
      </a>
    </div>
  );
}

export default ResumeLink;
