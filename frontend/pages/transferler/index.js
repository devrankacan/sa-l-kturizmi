import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '../../lib/api';

export default function Transferler() {
  const [transferler, setTransferler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    api.get('/transferler').then(({ data }) => {
      setTransferler(data.transferler);
      setYukleniyor(false);
    });
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Link href="/transferler/yeni" className="btn-primary">+ Yeni Transfer</Link>
      </div>
      <div className="card p-0 overflow-hidden">
        <div className="px-6 py-4 border-b font-semibold text-gray-800">Transferler ({transferler.length})</div>
        {yukleniyor ? (
          <div className="p-12 text-center text-gray-400">Yükleniyor...</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                {['Hasta', 'Tip', 'Kalkış', 'Varış', 'Araç', 'Durum'].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-gray-500 px-6 py-3 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {transferler.map(t => (
                <tr key={t._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium">{t.hasta?.ad} {t.hasta?.soyad}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{t.tip?.replace('_', ' ')}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <p>{t.kalkis?.yer}</p>
                    <p className="text-xs text-gray-400">{t.kalkis?.tarih ? new Date(t.kalkis.tarih).toLocaleString('tr-TR') : '-'}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{t.varis?.yer || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{t.arac?.tip || '-'}</td>
                  <td className="px-6 py-4">
                    <span className="badge bg-blue-100 text-blue-700">{t.durum}</span>
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
