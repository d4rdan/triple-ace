// /client/src/pages/_app.tsx - Fixed for hydration
import type { AppProps } from 'next/app';
import { ErrorBoundary } from '../components/shared/ErrorBoundary';
import '../styles/globals.css';
import { useEffect } from 'react';

export default function App({ Component, pageProps }: AppProps) {
  // Prevent hydration mismatches by ensuring consistent initial state
  useEffect(() => {
    // Remove any server-side generated content that might cause mismatches
    const serverStyleTags = document.querySelectorAll('[data-emotion]');
    serverStyleTags.forEach(tag => tag.remove());
  }, []);

  return (
    <ErrorBoundary>
      <Component {...pageProps} />
    </ErrorBoundary>
  );
}