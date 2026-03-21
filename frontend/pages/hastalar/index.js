import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '../../lib/api';

const durumRenk = {
  potansiyel: 'bg-yellow-100 text-yellow-700',
  aktif: 'bg-blue-100 text-blue-700',
  tedavi_sureci: 'bg-purple-100 text-purple-700',
  tamamlandi: 'bg-green-100 text-green-700',
  iptal: 'bg-red-100 text-red-700',
};

export default function Hastalar() {
  const [hastalar, setHastalar] = useState([]);
  const [toplam, setToplam] = useState(0);
  const [sayfa, setSayfa] = useState(1);
  const [sayfaSayisi, setSayfaSayisi] = useState(1);
  const [ara, setAra] = useState('');
  const [durumFiltre, setDurumFiltre] = useState('');
  const [yukleniyor, setYukleniyor] = useState(true);

  const yukle = async () => {
    setYukleniyor(true);
    try {
      const params = { sayfa, limit: 20 };
      if (ara) params.ara = ara;
      if (durumFiltre) params.durum = durumFiltre;
      const { data } = await api.get('/hastalar', { params });
      setHastalar(data.hastalar);
      setToplam(data.toplam);
      setSayfaSayisi(data.sayfaSayisi);
    } finally {
      setYukleniyor(false);
    }
  };

  useEffect(() => { yukle(); }, [sayfa, durumFiltre]);

  const aramaYap = (e) => {
    e.preventDefault();
    setSayfa(1);
    yukle();
  };

  return (
    <div className="space-y-4">
      {/* Üst bar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <form onSubmit={aramaYap} className="flex gap-2">
          <input
            className="input w-64"
            placeholder="Ad, soyad, email, hasta no..."
            value={ara}
            onChange={(e) => setAra(e.target.value)}
          />
          <button type="submit" className="btn-primary px-4">Ara</button>
        </form>
        <div className="flex gap-2">
          <select
            className="input w-44"
            value={durumFiltre}
            onChange={(e) => { setDurumFiltre(e.target.value); setSayfa(1); }}
          >
            <option value="">Tüm Durumlar</option>
            <option value="potansiyel">Potansiyel</option>
            <option value="aktif">Aktif</option>
            <option value="tedavi_sureci">Tedavi Süreci</option>
            <option value="tamamlandi">Tamamlandı</option>
            <option value="iptal">İptal</option>
          </select>
          <Link href="/hastalar/yeni" className="btn-primary whitespace-nowrap">+ Yeni Hasta</Link>
        </div>
      </div>

      {/* Tablo */}
      <div className="card p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-800">Hastalar ({toplam})</h3>
        </div>
        {yukleniyor ? (
          <div className="p-12 text-center text-gray-400">Yükleniyor...</div>
        ) : hastalar.length === 0 ? (
          <div className="p-12 text-center text-gray-400">Hasta bulunamadı</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Hasta No', 'Ad Soyad', 'Ülke', 'Telefon', 'Durum', 'Koordinatör', ''].map(h => (
                    <th key={h} className="text-left text-xs font-medium text-gray-500 px-6 py-3 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {hastalar.map(h => (
                  <tr key={h._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-mono text-gray-500">{h.hastaNo}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{h.ad} {h.soyad}</div>
                      <div className="text-xs text-gray-500">{h.email}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{h.ulke}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{h.telefon}</td>
                    <td className="px-6 py-4">
                      <span className={`badge ${durumRenk[h.durum] || 'bg-gray-100 text-gray-600'}`}>
                        {h.durum}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {h.atananKoordinator ? `${h.atananKoordinator.ad} ${h.atananKoordinator.soyad}` : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/hastalar/${h._id}`} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        Detay →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Sayfalama */}
        {sayfaSayisi > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-sm text-gray-500">{toplam} kayıt</span>
            <div className="flex gap-2">
              <button onClick={() => setSayfa(p => Math.max(1, p - 1))} disabled={sayfa === 1} className="btn-secondary text-sm py-1 px-3 disabled:opacity-40">← Önceki</button>
              <span className="text-sm text-gray-600 py-1 px-2">{sayfa} / {sayfaSayisi}</span>
              <button onClick={() => setSayfa(p => Math.min(sayfaSayisi, p + 1))} disabled={sayfa === sayfaSayisi} className="btn-secondary text-sm py-1 px-3 disabled:opacity-40">Sonraki →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
