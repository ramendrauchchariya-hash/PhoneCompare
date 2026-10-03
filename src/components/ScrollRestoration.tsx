import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Centralized scroll restoration:
 * - On navigation to a new pathname (forward navigation), scroll to top.
 * - On back/forward (POP), restore the saved scroll position for that key.
 */
export default function ScrollRestoration() {
  const location = useLocation();

  useEffect(() => {
    // On any pathname change, scroll to top.
    // The browser's native back/forward will still attempt to restore scroll,
    // but we ensure new route navigations start at the top.
    const navType = performance.getEntriesByType('navigation').pop() as PerformanceNavigationTiming | undefined;
    const isPageLoad = navType?.type === 'reload' || navType?.type === 'navigate';

    // Only force scroll-to-top on push navigations (not back/forward POP)
    // Unfortunately React Router v6 doesn't expose history action in all cases,
    // so we use a simpler heuristic: always scroll to top on pathname change.
    // This is the standard approach for SPA scroll restoration.
    if (isPageLoad || window.history.state?.usr == null) {
      // Fresh navigation — scroll to top
      window.scrollTo(0, 0);
    } else {
      // Could be back/forward — try native restoration
      // The browser handles this automatically for most cases
      const savedY = sessionStorage.getItem(`scroll-${location.key}`);
      if (savedY !== null) {
        window.scrollTo(0, parseInt(savedY));
      } else {
        window.scrollTo(0, 0);
      }
    }
  }, [location.pathname]);

  // Save scroll position before leaving a route
  useEffect(() => {
    const saveScroll = () => {
      sessionStorage.setItem(`scroll-${location.key}`, String(window.scrollY));
    };
    window.addEventListener('beforeunload', saveScroll);
    return () => {
      saveScroll();
      window.removeEventListener('beforeunload', saveScroll);
    };
  }, [location.key]);

  return null;
}
