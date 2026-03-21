import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import api from '../../lib/api';

export default function YeniTeklif() {
  const router = useRouter();
  const { hasta: hastaId } = router.query;
  const [tedaviler, setTedaviler] = useState([]);
  const [hastalar, setHastalar] = useState([]);
  const [seciliHasta, setSeciliHasta] = useState(hastaId || '');
  const [kalemler, setKalemler] = useState([]);
  const [notlar, setNotlar] = useState('');
  const [gecerlilik, setGecerlilik] = useState('');
  const [hata, setHata] = useState('');
  const [yukleniyor, setYukleniyor] = useState(false);

  useEffect(() => {
    const yukle = async () => {
      const [t, h] = await Promise.all([api.get('/tedaviler'), api.get('/hastalar', { params: { limit: 100 } })]);
      setTedaviler(t.data.tedaviler);
      setHastalar(h.data.hastalar);
    };
    yukle();
  }, []);

  useEffect(() => { if (hastaId) setSeciliHasta(hastaId); }, [hastaId]);

  const tedaviEkle = (tedavi) => {
    if (kalemler.find(k => k.tedavi === tedavi._id)) return;
    setKalemler(prev => [...prev, {
      tedavi: tedavi._id,
      tedaviAdi: tedavi.ad,
      miktar: 1,
      birimFiyat: tedavi.baz_fiyat,
      indirim: 0,
    }]);
  };

  const kalemGuncelle = (i, alan, deger) => {
    setKalemler(prev => prev.map((k, idx) => idx === i ? { ...k, [alan]: deger } : k));
  };

  const kalemSil = (i) => setKalemler(prev => prev.filter((_, idx) => idx !== i));

  const hesapla = (kalem) => kalem.birimFiyat * kalem.miktar * (1 - (kalem.indirim || 0) / 100);

  const genelToplam = kalemler.reduce((s, k) => s + hesapla(k), 0);

  const kaydet = async () => {
    if (!seciliHasta || kalemler.length === 0) {
      setHata('Hasta ve en az bir tedavi seçin');
      return;
    }
    setYukleniyor(true);
    setHata('');
    try {
      const { data } = await api.post('/teklifler', {
        hasta: seciliHasta,
        kalemler: kalemler.map(k => ({ ...k, toplam: hesapla(k) })),
        notlar,
        gecerlilikTarihi: gecerlilik || undefined,
        paraBirimi: 'USD',
      });
      router.push(`/teklifler/${data.teklif._id}`);
    } catch (err) {
      setHata(err.response?.data?.mesaj || 'Hata oluştu');
    } finally {
      setYukleniyor(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {hata && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{hata}</div>}

      {/* Hasta seçimi */}
      <div className="card">
        <h3 className="font-semibold text-gray-800 mb-4">Hasta Seçimi</h3>
        <select className="input" value={seciliHasta} onChange={e => setSeciliHasta(e.target.value)}>
          <option value="">Hasta seçin...</option>
          {hastalar.map(h => (
            <option key={h._id} value={h._id}>{h.ad} {h.soyad} ({h.hastaNo}) - {h.ulke}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tedavi listesi */}
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-4">Tedaviler</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {tedaviler.map(t => (
              <button key={t._id} onClick={() => tedaviEkle(t)}
                className="w-full text-left p-3 rounded-lg border border-gray-100 hover:border-blue-300 hover:bg-blue-50 transition-colors">
                <p className="text-sm font-medium text-gray-800">{t.ad}</p>
                <p className="text-xs text-gray-500">{t.kategori} · ${t.baz_fiyat}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Teklif kalemleri */}
        <div className="lg:col-span-2 card">
          <h3 className="font-semibold text-gray-800 mb-4">Teklif Kalemleri</h3>
          {kalemler.length === 0 ? (
            <p className="text-gray-400 text-sm">Soldan tedavi seçin</p>
          ) : (
            <div className="space-y-3">
              {kalemler.map((k, i) => (
                <div key={i} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-sm font-medium text-gray-800">{k.tedaviAdi}</p>
                    <button onClick={() => kalemSil(i)} className="text-red-400 hover:text-red-600 text-sm">✕</button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-xs text-gray-500">Fiyat ($)</label>
                      <input type="number" className="input text-sm py-1" value={k.birimFiyat}
                        onChange={e => kalemGuncelle(i, 'birimFiyat', +e.target.value)} />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Miktar</label>
                      <input type="number" className="input text-sm py-1" value={k.miktar} min={1}
                        onChange={e => kalemGuncelle(i, 'miktar', +e.target.value)} />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">İndirim (%)</label>
                      <input type="number" className="input text-sm py-1" value={k.indirim} min={0} max={100}
                        onChange={e => kalemGuncelle(i, 'indirim', +e.target.value)} />
                    </div>
                  </div>
                  <p className="text-right text-sm font-semibold text-blue-600 mt-2">
                    ${hesapla(k).toLocaleString()}
                  </p>
                </div>
              ))}

              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between text-lg font-bold text-gray-900">
                  <span>Genel Toplam</span>
                  <span>${genelToplam.toLocaleString()} USD</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Ek bilgiler */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Geçerlilik Tarihi</label>
            <input type="date" className="input" value={gecerlilik} onChange={e => setGecerlilik(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notlar</label>
            <textarea className="input resize-none" rows={2} value={notlar} onChange={e => setNotlar(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button onClick={() => router.back()} className="btn-secondary">İptal</button>
        <button onClick={kaydet} className="btn-primary" disabled={yukleniyor}>
          {yukleniyor ? 'Kaydediliyor...' : 'Teklif Oluştur'}
        </button>
      </div>
    </div>
  );
}
