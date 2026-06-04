import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { I18nProvider } from "@/lib/i18n";
import { LanguageGate } from "@/components/LanguageGate";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-display gold-text">404</h1>
        <p className="mt-4 text-muted-foreground">The page you're looking for doesn't exist.</p>
        <a href="/" className="mt-6 inline-flex px-5 py-2.5 rounded-md btn-gold font-semibold">Go home</a>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  useEffect(() => { reportLovableError(error, { boundary: "tanstack_root_error_component" }); }, [error]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-display">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <button onClick={() => { router.invalidate(); reset(); }} className="mt-6 px-5 py-2.5 rounded-md btn-gold font-semibold">Try again</button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Elimi Trust Ltd — Premium Marketplace Rwanda" },
      { name: "description", content: "Multi-category classified marketplace in Rwanda. Real estate, vehicles, electronics, services and more." },
      { name: "author", content: "Elimi Trust Ltd" },
      { property: "og:title", content: "Elimi Trust Ltd — Premium Marketplace Rwanda" },
      { property: "og:description", content: "Multi-category classified marketplace in Rwanda. Real estate, vehicles, electronics, services and more." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Elimi Trust Ltd — Premium Marketplace Rwanda" },
      { name: "twitter:description", content: "Multi-category classified marketplace in Rwanda. Real estate, vehicles, electronics, services and more." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/4992267c-4de0-4158-aae1-2c8c5dd98dd0/id-preview-1a9967c1--c9ade646-f32b-4e4e-9be8-35461fe46bf5.lovable.app-1780596190383.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/4992267c-4de0-4158-aae1-2c8c5dd98dd0/id-preview-1a9967c1--c9ade646-f32b-4e4e-9be8-35461fe46bf5.lovable.app-1780596190383.png" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <LanguageGate />
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1"><Outlet /></main>
          <Footer />
        </div>
      </I18nProvider>
    </QueryClientProvider>
  );
}
