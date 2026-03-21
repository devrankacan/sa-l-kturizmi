import { useState } from 'react';
import { useRouter } from 'next/router';
import api from '../lib/api';
import { setToken, setUser } from '../lib/auth';

export default function Login() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', sifre: '' });
  const [hata, setHata] = useState('');
  const [yukleniyor, setYukleniyor] = useState(false);

  const girisYap = async (e) => {
    e.preventDefault();
    setYukleniyor(true);
    setHata('');
    try {
      const { data } = await api.post('/auth/giris', form);
      setToken(data.token);
      setUser(data.kullanici);
      router.push('/');
    } catch (err) {
      setHata(err.response?.data?.mesaj || 'Giriş başarısız');
    } finally {
      setYukleniyor(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🏥</div>
          <h1 className="text-2xl font-bold text-gray-900">Sağlık Turizmi</h1>
          <p className="text-gray-500 text-sm mt-1">Yönetim Paneli</p>
        </div>

        {hata && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
            {hata}
          </div>
        )}

        <form onSubmit={girisYap} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              className="input"
              placeholder="admin@saglik.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Şifre</label>
            <input
              type="password"
              className="input"
              placeholder="••••••••"
              value={form.sifre}
              onChange={(e) => setForm({ ...form, sifre: e.target.value })}
              required
            />
          </div>
          <button type="submit" className="btn-primary w-full py-3 mt-2" disabled={yukleniyor}>
            {yukleniyor ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>
      </div>
    </div>
  );
}
