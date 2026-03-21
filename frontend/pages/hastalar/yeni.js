import { useState } from 'react';
import { useRouter } from 'next/router';
import api from '../../lib/api';

export default function YeniHasta() {
  const router = useRouter();
  const [form, setForm] = useState({
    ad: '', soyad: '', email: '', telefon: '', ulke: '', sehir: '',
    cinsiyet: '', uyruk: '', dil: 'tr',
    referans: { kaynak: 'web', detay: '' }
  });
  const [hata, setHata] = useState('');
  const [yukleniyor, setYukleniyor] = useState(false);

  const kaydet = async (e) => {
    e.preventDefault();
    setYukleniyor(true);
    setHata('');
    try {
      const { data } = await api.post('/hastalar', form);
      router.push(`/hastalar/${data.hasta._id}`);
    } catch (err) {
      setHata(err.response?.data?.mesaj || 'Hata oluştu');
    } finally {
      setYukleniyor(false);
    }
  };

  const guncelle = (alan, deger) => setForm(f => ({ ...f, [alan]: deger }));

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-800 mb-6">Yeni Hasta Ekle</h2>

        {hata && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">{hata}</div>}

        <form onSubmit={kaydet} className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b">Kişisel Bilgiler</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ad *</label>
                <input className="input" value={form.ad} onChange={e => guncelle('ad', e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Soyad *</label>
                <input className="input" value={form.soyad} onChange={e => guncelle('soyad', e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input type="email" className="input" value={form.email} onChange={e => guncelle('email', e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefon *</label>
                <input className="input" placeholder="+90 555 000 00 00" value={form.telefon} onChange={e => guncelle('telefon', e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                <input className="input" value={form.whatsapp || ''} onChange={e => guncelle('whatsapp', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cinsiyet</label>
                <select className="input" value={form.cinsiyet} onChange={e => guncelle('cinsiyet', e.target.value)}>
                  <option value="">Seçin</option>
                  <option value="erkek">Erkek</option>
                  <option value="kadin">Kadın</option>
                  <option value="belirtilmemis">Belirtilmemiş</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ülke *</label>
                <input className="input" value={form.ulke} onChange={e => guncelle('ulke', e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Şehir</label>
                <input className="input" value={form.sehir} onChange={e => guncelle('sehir', e.target.value)} />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b">Referans Bilgisi</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kaynak</label>
                <select className="input" value={form.referans.kaynak} onChange={e => guncelle('referans', { ...form.referans, kaynak: e.target.value })}>
                  <option value="web">Web Sitesi</option>
                  <option value="sosyal_medya">Sosyal Medya</option>
                  <option value="doktor">Doktor Referansı</option>
                  <option value="hasta">Hasta Referansı</option>
                  <option value="ajans">Ajans</option>
                  <option value="diger">Diğer</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Detay</label>
                <input className="input" placeholder="Instagram, Facebook..." value={form.referans.detay} onChange={e => guncelle('referans', { ...form.referans, detay: e.target.value })} />
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t">
            <button type="button" onClick={() => router.back()} className="btn-secondary">İptal</button>
            <button type="submit" className="btn-primary" disabled={yukleniyor}>
              {yukleniyor ? 'Kaydediliyor...' : 'Hasta Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
