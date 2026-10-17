import { useEffect } from 'react';

/**
 * Hook to set the document title dynamically per page.
 */
export function useDocumentTitle(title: string) {
  useEffect(() => {
    const originalTitle = document.title;
    document.title = title.includes('Cosy Reality') ? title : `${title} | Cosy Reality`;
    return () => {
      document.title = originalTitle;
    };
  }, [title]);
}

/**
 * Utility to generate SEO friendly meta tags
 */
export function getMetaDescription(desc?: string) {
  return desc || 'Cosy Reality — 15 Years of Experience in Real Estate & Construction. Premium residential, plotted land, and commercial developments with live inventory status.';
}
