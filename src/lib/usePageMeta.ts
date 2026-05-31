import { useEffect } from 'react';

/**
 * Sets the per-page document title and meta description for SEO.
 * Since this is a SPA, each route should call this to keep the tab title
 * and meta description in sync with the visible content.
 */
export function usePageMeta(title: string, description?: string) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title;

    let metaEl: HTMLMetaElement | null = null;
    let previousDescription: string | null = null;
    if (description) {
      metaEl = document.querySelector('meta[name="description"]');
      if (metaEl) {
        previousDescription = metaEl.getAttribute('content');
        metaEl.setAttribute('content', description);
      }
    }

    return () => {
      document.title = previousTitle;
      if (metaEl && previousDescription !== null) {
        metaEl.setAttribute('content', previousDescription);
      }
    };
  }, [title, description]);
}
