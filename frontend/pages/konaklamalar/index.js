import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '../../lib/api';

export default function Konaklamalar() {
  const [konaklamalar, setKonaklamalar] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    api.get('/konaklamalar').then(({ data }) => {
      setKonaklamalar(data.konaklamalar);
      setYukleniyor(false);
    });
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Link href="/konaklamalar/yeni" className="btn-primary">+ Yeni Konaklama</Link>
      </div>
      <div className="card p-0 overflow-hidden">
        <div className="px-6 py-4 border-b font-semibold text-gray-800">Konaklamalar ({konaklamalar.length})</div>
        {yukleniyor ? (
          <div className="p-12 text-center text-gray-400">Yükleniyor...</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                {['Hasta', 'Otel', 'Giriş', 'Çıkış', 'Gece', 'Tutar', 'Durum'].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-gray-500 px-6 py-3 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {konaklamalar.map(k => (
                <tr key={k._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium">{k.hasta?.ad} {k.hasta?.soyad}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <p>{k.otel?.ad}</p>
                    <p className="text-xs text-gray-400">{'⭐'.repeat(k.otel?.yildiz || 0)}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{new Date(k.girisTarihi).toLocaleDateString('tr-TR')}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{new Date(k.cikisTarihi).toLocaleDateString('tr-TR')}</td>
                  <td className="px-6 py-4 text-sm font-medium">{k.geceSayisi}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-blue-600">
                    {k.toplamUcret ? `$${k.toplamUcret}` : '-'}
                  </td>
                  <td className="px-6 py-4">
                    <span className="badge bg-blue-100 text-blue-700">{k.durum}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
