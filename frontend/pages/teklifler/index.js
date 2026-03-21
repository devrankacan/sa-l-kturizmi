import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '../../lib/api';

const durumRenk = {
  taslak: 'bg-gray-100 text-gray-600',
  gonderildi: 'bg-blue-100 text-blue-700',
  inceleniyor: 'bg-yellow-100 text-yellow-700',
  onaylandi: 'bg-green-100 text-green-700',
  reddedildi: 'bg-red-100 text-red-700',
  revize: 'bg-purple-100 text-purple-700',
};

export default function Teklifler() {
  const [teklifler, setTeklifler] = useState([]);
  const [durumFiltre, setDurumFiltre] = useState('');
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    const yukle = async () => {
      setYukleniyor(true);
      const params = {};
      if (durumFiltre) params.durum = durumFiltre;
      const { data } = await api.get('/teklifler', { params });
      setTeklifler(data.teklifler);
      setYukleniyor(false);
    };
    yukle();
  }, [durumFiltre]);

  const toplamGelir = teklifler
    .filter(t => t.durum === 'onaylandi')
    .reduce((s, t) => s + (t.genelToplam || 0), 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card text-center">
          <p className="text-2xl font-bold text-gray-900">{teklifler.length}</p>
          <p className="text-sm text-gray-500">Toplam Teklif</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-green-600">{teklifler.filter(t => t.durum === 'onaylandi').length}</p>
          <p className="text-sm text-gray-500">Onaylanan</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-yellow-600">{teklifler.filter(t => t.durum === 'inceleniyor').length}</p>
          <p className="text-sm text-gray-500">İnceleniyor</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-blue-600">${toplamGelir.toLocaleString()}</p>
          <p className="text-sm text-gray-500">Toplam Gelir</p>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <select className="input w-48" value={durumFiltre} onChange={e => setDurumFiltre(e.target.value)}>
          <option value="">Tüm Durumlar</option>
          <option value="taslak">Taslak</option>
          <option value="gonderildi">Gönderildi</option>
          <option value="inceleniyor">İnceleniyor</option>
          <option value="onaylandi">Onaylandı</option>
          <option value="reddedildi">Reddedildi</option>
        </select>
        <Link href="/teklifler/yeni" className="btn-primary">+ Yeni Teklif</Link>
      </div>

      <div className="card p-0 overflow-hidden">
        {yukleniyor ? (
          <div className="p-12 text-center text-gray-400">Yükleniyor...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Teklif No', 'Hasta', 'Toplam', 'Durum', 'Tarih', ''].map(h => (
                    <th key={h} className="text-left text-xs font-medium text-gray-500 px-6 py-3 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {teklifler.map(t => (
                  <tr key={t._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-mono text-gray-500">{t.teklifNo}</td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{t.hasta?.ad} {t.hasta?.soyad}</p>
                      <p className="text-xs text-gray-500">{t.hasta?.ulke}</p>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      ${(t.genelToplam || 0).toLocaleString()} {t.paraBirimi}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`badge ${durumRenk[t.durum] || ''}`}>{t.durum}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(t.createdAt).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/teklifler/${t._id}`} className="text-blue-600 hover:text-blue-800 text-sm font-medium">Detay →</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
