import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EventHub - Discover Amazing Events",
  description: "A modern event management platform where organizers create events and attendees discover unforgettable experiences.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head suppressHydrationWarning>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Handle browser extension interference
              (function() {
                if (typeof window !== 'undefined') {
                  // Remove browser extension attributes that cause hydration mismatches
                  const observer = new MutationObserver(function(mutations) {
                    mutations.forEach(function(mutation) {
                      if (mutation.type === 'attributes') {
                        const target = mutation.target;
                        if (target.hasAttribute && target.hasAttribute('bis_skin_checked')) {
                          target.removeAttribute('bis_skin_checked');
                        }
                      }
                    });
                  });
                  
                  // Start observing when DOM is ready
                  if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', function() {
                      observer.observe(document.body, {
                        attributes: true,
                        subtree: true,
                        attributeFilter: ['bis_skin_checked']
                      });
                    });
                  } else {
                    observer.observe(document.body, {
                      attributes: true,
                      subtree: true,
                      attributeFilter: ['bis_skin_checked']
                    });
                  }
                }
              })();
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning>
        <div suppressHydrationWarning>
          {children}
        </div>
      </body>
    </html>
  );
}
