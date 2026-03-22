import '../styles/globals.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-datepicker/dist/react-datepicker.css';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { isLoggedIn } from '../lib/auth';
import Layout from '../components/Layout';
import { SettingsProvider } from '../lib/settingsContext';

const PUBLIC_ROUTES = ['/login'];

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isLoggedIn() && !PUBLIC_ROUTES.includes(router.pathname)) {
      router.replace('/login').then(() => setReady(true));
    } else {
      setReady(true);
    }
  }, [router.pathname]);

  if (!ready) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f9fafb' }}>
      <div style={{ color: '#6b7280', fontSize: '14px' }}>Yükleniyor...</div>
    </div>
  );

  if (PUBLIC_ROUTES.includes(router.pathname)) {
    return <Component {...pageProps} />;
  }

  return (
    <SettingsProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </SettingsProvider>
  );
}
