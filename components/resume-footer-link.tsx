'use client';

import { usePublishedResumes } from '@/hooks/use-published-resumes';

/**
 * The footer's résumé link, which has to disappear when nothing is published.
 *
 * Its own component so the home page can stay a server component that renders
 * no queries: reading the résumé table there would make `/` dynamic, and the
 * page is otherwise entirely static with its content fetched client-side. One
 * small island is cheaper than that.
 *
 * Always `/resume` rather than a link each — a footer is a list of destinations,
 * not a menu. The About band is where the versions are listed.
 */
export function ResumeFooterLink() {
  const resumes = usePublishedResumes();

  if (resumes.length === 0) return null;

  return (
    <a
      href="/resume"
      target="_blank"
      rel="noopener noreferrer"
      className="text-gray-400 transition-colors hover:text-green-400"
    >
      Résumé
    </a>
  );
}
