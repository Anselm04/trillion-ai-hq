import { useState } from "react";
import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { AccessProvider } from "@/components/access-provider";
import { ThemeProvider, useTheme } from "@/components/theme-provider";
import { LocaleProvider } from "@/lib/i18n/locale";
import { DEFAULT_DESCRIPTION, SITE_NAME, organizationJsonLd, pageSeo, websiteJsonLd } from "@/lib/seo";
import appCss from "../styles.css?url";

const THEME_BOOT = `(function(){try{if(localStorage.getItem('trillion-theme')==='day'){document.documentElement.classList.add('light');document.documentElement.style.colorScheme='light'}var l=localStorage.getItem('trillion-locale');if(l){document.documentElement.lang=l;if(l==='ar')document.documentElement.dir='rtl'}}catch(e){}})();`;

export const Route = createRootRoute({
  head: () => {
    const seo = pageSeo({
      title: SITE_NAME,
      description: DEFAULT_DESCRIPTION,
      path: "/",
      jsonLd: [organizationJsonLd(), websiteJsonLd()],
    });
    return {
      meta: [
        { charSet: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
        { name: "theme-color", content: "#0a0908" },
        { name: "color-scheme", content: "dark light" },
        ...seo.meta,
      ],
      links: [
        { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
        { rel: "stylesheet", href: appCss },
        { rel: "manifest", href: "/__grok/manifest.webmanifest" },
        { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
        { rel: "sitemap", type: "application/xml", href: "/sitemap.xml" },
        ...seo.links,
      ],
      scripts: seo.scripts,
    };
  },
  component: RootDocument,
});

function ThemedToaster() {
  const { theme } = useTheme();
  return <Toaster theme={theme === "day" ? "light" : "dark"} position="bottom-right" />;
}

function RootDocument() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: 30_000, gcTime: 300_000, retry: 0, refetchOnWindowFocus: false } },
      }),
  );
  return (
    <html lang="en" className="antialiased" suppressHydrationWarning>
      <head>
        <HeadContent />
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT }} />
      </head>
      <body>
        <PreviewHostBridge />
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <LocaleProvider>
              <AuthProvider>
                <AccessProvider>
                  <Outlet />
                  <ThemedToaster />
                </AccessProvider>
              </AuthProvider>
            </LocaleProvider>
          </ThemeProvider>
        </QueryClientProvider>
        <Scripts />
      </body>
    </html>
  );
}
