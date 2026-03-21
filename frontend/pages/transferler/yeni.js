import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import api from '../../lib/api';

export default function YeniTransfer() {
  const router = useRouter();
  const [hastalar, setHastalar] = useState([]);
  const [form, setForm] = useState({
    hasta: '', tip: 'havaalani_karsılama',
    kalkis: { yer: '', tarih: '', ucusNo: '' },
    varis: { yer: '' },
    arac: { tip: 'van', surucu: '', plaka: '' },
    notlar: ''
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
      await api.post('/transferler', form);
      router.push('/transferler');
    } catch (err) {
      setHata(err.response?.data?.mesaj || 'Hata');
    } finally {
      setYukleniyor(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-800 mb-6">Yeni Transfer</h2>
        {hata && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">{hata}</div>}
        <form onSubmit={kaydet} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hasta *</label>
              <select className="input" value={form.hasta} onChange={e => setForm(f => ({ ...f, hasta: e.target.value }))} required>
                <option value="">Seçin...</option>
                {hastalar.map(h => <option key={h._id} value={h._id}>{h.ad} {h.soyad}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Transfer Tipi</label>
              <select className="input" value={form.tip} onChange={e => setForm(f => ({ ...f, tip: e.target.value }))}>
                <option value="havaalani_karsılama">Havalimanı Karşılama</option>
                <option value="hastane_transfer">Hastane Transfer</option>
                <option value="otel_transfer">Otel Transfer</option>
                <option value="sehir_ici">Şehir İçi</option>
                <option value="vip">VIP</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kalkış Yeri</label>
              <input className="input" value={form.kalkis.yer} onChange={e => setForm(f => ({ ...f, kalkis: { ...f.kalkis, yer: e.target.value } }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kalkış Tarihi</label>
              <input type="datetime-local" className="input" value={form.kalkis.tarih} onChange={e => setForm(f => ({ ...f, kalkis: { ...f.kalkis, tarih: e.target.value } }))} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Varış Yeri</label>
              <input className="input" value={form.varis.yer} onChange={e => setForm(f => ({ ...f, varis: { yer: e.target.value } }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Uçuş No</label>
              <input className="input" placeholder="TK123" value={form.kalkis.ucusNo} onChange={e => setForm(f => ({ ...f, kalkis: { ...f.kalkis, ucusNo: e.target.value } }))} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Araç Tipi</label>
              <select className="input" value={form.arac.tip} onChange={e => setForm(f => ({ ...f, arac: { ...f.arac, tip: e.target.value } }))}>
                <option value="sedan">Sedan</option>
                <option value="van">Van</option>
                <option value="vip">VIP</option>
                <option value="ambulans">Ambulans</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sürücü</label>
              <input className="input" value={form.arac.surucu} onChange={e => setForm(f => ({ ...f, arac: { ...f.arac, surucu: e.target.value } }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Plaka</label>
              <input className="input" value={form.arac.plaka} onChange={e => setForm(f => ({ ...f, arac: { ...f.arac, plaka: e.target.value } }))} />
            </div>
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
