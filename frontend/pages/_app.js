import '../styles/globals.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-datepicker/dist/react-datepicker.css';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { isLoggedIn } from '../lib/auth';
import Layout from '../components/Layout';

const PUBLIC_ROUTES = ['/login'];

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isLoggedIn() && !PUBLIC_ROUTES.includes(router.pathname)) {
      router.replace('/login');
    } else {
      setReady(true);
    }
  }, [router.pathname]);

  if (!ready) return null;

  if (PUBLIC_ROUTES.includes(router.pathname)) {
    return <Component {...pageProps} />;
  }

  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}
