import { useEffect, useState } from 'react';

export function useHydration() {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Mark as hydrated after component mounts
    setIsHydrated(true);

    // Clean up any browser extension attributes that might cause hydration issues
    const cleanupExtensionAttributes = () => {
      const elements = document.querySelectorAll('[bis_skin_checked]');
      elements.forEach(element => {
        element.removeAttribute('bis_skin_checked');
      });
    };

    // Run cleanup immediately and after a short delay
    cleanupExtensionAttributes();
    const timeoutId = setTimeout(cleanupExtensionAttributes, 100);

    // Set up mutation observer to catch future additions
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes') {
          const target = mutation.target as Element;
          if (target.hasAttribute('bis_skin_checked')) {
            target.removeAttribute('bis_skin_checked');
          }
        }
      });
    });

    observer.observe(document.body, {
      attributes: true,
      subtree: true,
      attributeFilter: ['bis_skin_checked']
    });

    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, []);

  return isHydrated;
}
