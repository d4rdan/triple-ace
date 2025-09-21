// pages/_app.tsx - With SessionProvider if needed

import '../styles/globals.css';
import '../components/roulette/styles/rouletteWheel.css';
import { useEffect } from 'react';
import { SessionProvider } from 'next-auth/react';
import type { AppProps } from 'next/app';

export default function App({ 
  Component, 
  pageProps: { session, ...pageProps }
}: AppProps) {
  // Prevent hydration mismatches by ensuring consistent initial state
  useEffect(() => {
    // Any client-side initialization
  }, []);

  return (
    <SessionProvider session={session}>
      <Component {...pageProps} />
    </SessionProvider>
  );
}