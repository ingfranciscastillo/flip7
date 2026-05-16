import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from 'react-router';

import type { Route } from './+types/root';
import './app.css';
import { Toaster } from 'sonner';
import { useSocketLifecycle } from './hooks/useSocket';
import { AnnouncementOverlay } from './components/AnnouncementOverlay';

const BASE_URL = 'https://flip7-web.vercel.app';

export const meta: Route.MetaFunction = () => [
  { title: 'Flip 7 Online' },
  {
    name: 'description',
    content:
      'Juego de cartas multiplayer en tiempo real. Basado en Flip 7 de The Op Games. ¡Juega online con hasta 8 jugadores!',
  },
  { property: 'og:title', content: 'Flip 7 Online' },
  {
    property: 'og:description',
    content:
      'Juega Flip 7 online con hasta 8 jugadores en tiempo real. Un juego press-your-luck lleno de emoción.',
  },
  { property: 'og:type', content: 'website' },
  { property: 'og:url', content: BASE_URL },
  { name: 'twitter:card', content: 'summary' },
  { name: 'twitter:title', content: 'Flip 7 Online' },
  {
    name: 'twitter:description',
    content: 'Juego de cartas multiplayer en tiempo real',
  },
];

export const links: Route.LinksFunction = () => [
  { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous',
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Bangers&family=Fredoka:wght@300;400;500;600&display=swap',
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <AnnouncementOverlay />
        <ScrollRestoration />
        <Scripts />
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}

export default function App() {
  useSocketLifecycle();
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = 'Oops!';
  let details = 'An unexpected error occurred.';
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? '404' : 'Error';
    details =
      error.status === 404
        ? 'The requested page could not be found.'
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
