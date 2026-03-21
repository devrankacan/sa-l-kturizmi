import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import api from '../../lib/api';

export default function YeniKonaklama() {
  const router = useRouter();
  const [hastalar, setHastalar] = useState([]);
  const [form, setForm] = useState({
    hasta: '',
    otel: { ad: '', adres: '', yildiz: 4, telefon: '', reservasyonNo: '' },
    oda: { tip: 'standart', numara: '', kisiSayisi: 1 },
    girisTarihi: '', cikisTarihi: '',
    gecelikUcret: '', ozelIstekler: ''
  });
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState('');

  useEffect(() => {
    api.get('/hastalar', { params: { limit: 100 } }).then(({ data }) => setHastalar(data.hastalar));
  }, []);

  const kaydet = async (e) => {
    e.preventDefault();
    setYukleniyor(true);
    try {
      await api.post('/konaklamalar', form);
      router.push('/konaklamalar');
    } catch (err) {
      setHata(err.response?.data?.mesaj || 'Hata');
    } finally {
      setYukleniyor(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-800 mb-6">Yeni Konaklama</h2>
        {hata && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">{hata}</div>}
        <form onSubmit={kaydet} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hasta *</label>
            <select className="input" value={form.hasta} onChange={e => setForm(f => ({ ...f, hasta: e.target.value }))} required>
              <option value="">Seçin...</option>
              {hastalar.map(h => <option key={h._id} value={h._id}>{h.ad} {h.soyad} ({h.hastaNo})</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Otel Adı *</label>
              <input className="input" value={form.otel.ad} onChange={e => setForm(f => ({ ...f, otel: { ...f.otel, ad: e.target.value } }))} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Yıldız</label>
              <select className="input" value={form.otel.yildiz} onChange={e => setForm(f => ({ ...f, otel: { ...f.otel, yildiz: +e.target.value } }))}>
                {[1,2,3,4,5].map(y => <option key={y} value={y}>{y} Yıldız</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rezervasyon No</label>
              <input className="input" value={form.otel.reservasyonNo} onChange={e => setForm(f => ({ ...f, otel: { ...f.otel, reservasyonNo: e.target.value } }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Oda Tipi</label>
              <select className="input" value={form.oda.tip} onChange={e => setForm(f => ({ ...f, oda: { ...f.oda, tip: e.target.value } }))}>
                <option value="standart">Standart</option>
                <option value="superior">Superior</option>
                <option value="suite">Suite</option>
                <option value="apart">Apart</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Giriş Tarihi *</label>
              <input type="date" className="input" value={form.girisTarihi} onChange={e => setForm(f => ({ ...f, girisTarihi: e.target.value }))} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Çıkış Tarihi *</label>
              <input type="date" className="input" value={form.cikisTarihi} onChange={e => setForm(f => ({ ...f, cikisTarihi: e.target.value }))} required />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gecelik Ücret ($)</label>
            <input type="number" className="input" value={form.gecelikUcret} onChange={e => setForm(f => ({ ...f, gecelikUcret: +e.target.value }))} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Özel İstekler</label>
            <textarea className="input resize-none" rows={2} value={form.ozelIstekler} onChange={e => setForm(f => ({ ...f, ozelIstekler: e.target.value }))} />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={() => router.back()} className="btn-secondary">İptal</button>
            <button type="submit" className="btn-primary" disabled={yukleniyor}>{yukleniyor ? 'Kaydediliyor...' : 'Kaydet'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
