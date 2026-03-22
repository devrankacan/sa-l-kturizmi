import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { logout, getUser } from '../lib/auth';
import { useSettings, kontrastRenk } from '../lib/settingsContext';

const UPLOADS_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api').replace('/api', '/uploads');

const menuItems = [
  { href: '/', label: 'Dashboard', icon: '📊' },
  { href: '/hastalar', label: 'Hastalar', icon: '👥' },
  { href: '/whatsapp', label: 'WhatsApp', icon: '💬' },
  { href: '/teklifler', label: 'Teklifler', icon: '📋' },
  { href: '/randevular', label: 'Randevular', icon: '📅' },
  { href: '/transferler', label: 'Transferler', icon: '🚗' },
  { href: '/konaklamalar', label: 'Konaklamalar', icon: '🏨' },
  { href: '/ayarlar', label: 'Ayarlar', icon: '⚙️' },
];

export default function Layout({ children }) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = getUser();
  const { ayarlar } = useSettings();
  const renk = ayarlar?.primaryRenk || '#3b82f6';
  const yaziRenk = kontrastRenk(renk);

  const aktifStil = { backgroundColor: renk, color: yaziRenk };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 transform transition-transform duration-200 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0`}>

        {/* Logo alanı */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-gray-700">
          {ayarlar?.logoYolu ? (
            <img
              src={`${UPLOADS_URL}/${ayarlar.logoYolu}`}
              alt={ayarlar.firmaAdi}
              className="h-9 w-auto object-contain max-w-[160px]"
            />
          ) : (
            <span className="text-white font-bold text-lg truncate">
              🏥 {ayarlar?.firmaAdi || 'Sağlık Turizmi'}
            </span>
          )}
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-white ml-2">✕</button>
        </div>

        {/* Menü */}
        <nav className="mt-4 px-3">
          {menuItems.map((item) => {
            const aktif = router.pathname === item.href || router.pathname.startsWith(item.href + '/');
            return (
              <Link key={item.href} href={item.href}
                style={aktif ? aktifStil : {}}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 text-sm font-medium transition-colors
                  ${aktif ? '' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
                <span>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Kullanıcı */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700">
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
              style={{ backgroundColor: renk, color: yaziRenk }}
            >
              {user?.ad?.[0] || 'A'}
            </div>
            <div>
              <p className="text-white text-sm font-medium">{user?.ad} {user?.soyad}</p>
              <p className="text-gray-400 text-xs">{user?.rol}</p>
            </div>
          </div>
          <button onClick={logout} className="w-full text-left text-gray-400 hover:text-white text-sm px-2 py-1">
            🚪 Çıkış Yap
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6 gap-4">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-500 hover:text-gray-700">
            ☰
          </button>
          <h1 className="text-gray-800 font-semibold">
            {menuItems.find(m => router.pathname === m.href || router.pathname.startsWith(m.href + '/'))?.label || 'Panel'}
          </h1>
        </header>
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
