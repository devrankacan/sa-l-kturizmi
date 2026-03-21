import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import api from '../../lib/api';

export default function YeniRandevu() {
  const router = useRouter();
  const [hastalar, setHastalar] = useState([]);
  const [tedaviler, setTedaviler] = useState([]);
  const [form, setForm] = useState({
    hasta: '', tedaviAdi: '', doktorAdi: '', hastane: '', klinik: '',
    tarih: '', sure: 60, notlar: ''
  });
  const [hata, setHata] = useState('');
  const [yukleniyor, setYukleniyor] = useState(false);

  useEffect(() => {
    const yukle = async () => {
      const [h, t] = await Promise.all([
        api.get('/hastalar', { params: { limit: 100 } }),
        api.get('/tedaviler')
      ]);
      setHastalar(h.data.hastalar);
      setTedaviler(t.data.tedaviler);
    };
    yukle();
  }, []);

  const kaydet = async (e) => {
    e.preventDefault();
    setYukleniyor(true);
    setHata('');
    try {
      await api.post('/randevular', form);
      router.push('/randevular');
    } catch (err) {
      setHata(err.response?.data?.mesaj || 'Hata oluştu');
    } finally {
      setYukleniyor(false);
    }
  };

  const g = (alan, val) => setForm(f => ({ ...f, [alan]: val }));

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-800 mb-6">Yeni Randevu</h2>
        {hata && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">{hata}</div>}

        <form onSubmit={kaydet} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hasta *</label>
            <select className="input" value={form.hasta} onChange={e => g('hasta', e.target.value)} required>
              <option value="">Hasta seçin...</option>
              {hastalar.map(h => (
                <option key={h._id} value={h._id}>{h.ad} {h.soyad} ({h.hastaNo})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tedavi</label>
              <select className="input" value={form.tedaviAdi} onChange={e => g('tedaviAdi', e.target.value)}>
                <option value="">Seçin...</option>
                {tedaviler.map(t => <option key={t._id} value={t.ad}>{t.ad}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Süre (dk)</label>
              <input type="number" className="input" value={form.sure} onChange={e => g('sure', +e.target.value)} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tarih & Saat *</label>
            <input type="datetime-local" className="input" value={form.tarih} onChange={e => g('tarih', e.target.value)} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hastane/Klinik</label>
              <input className="input" placeholder="Hastane adı" value={form.hastane} onChange={e => g('hastane', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Doktor</label>
              <input className="input" placeholder="Dr. Ad Soyad" value={form.doktorAdi} onChange={e => g('doktorAdi', e.target.value)} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notlar</label>
            <textarea className="input resize-none" rows={3} value={form.notlar} onChange={e => g('notlar', e.target.value)} />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={() => router.back()} className="btn-secondary">İptal</button>
            <button type="submit" className="btn-primary" disabled={yukleniyor}>
              {yukleniyor ? 'Kaydediliyor...' : 'Randevu Oluştur'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
