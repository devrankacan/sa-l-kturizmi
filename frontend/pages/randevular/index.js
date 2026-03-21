import { useEffect, useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/tr';
import api from '../../lib/api';
import Link from 'next/link';

moment.locale('tr');
const localizer = momentLocalizer(moment);

const durumRenk = {
  'planlandı': '#f59e0b',
  'onaylandi': '#3b82f6',
  'tamamlandi': '#10b981',
  'iptal': '#ef4444',
  'ertelendi': '#8b5cf6',
};

export default function Randevular() {
  const [randevular, setRandevular] = useState([]);
  const [gorunum, setGorunum] = useState('takvim');
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    const yukle = async () => {
      const { data } = await api.get('/randevular');
      setRandevular(data.randevular);
      setYukleniyor(false);
    };
    yukle();
  }, []);

  const takvimOlaylari = randevular.map(r => ({
    id: r._id,
    title: `${r.hasta?.ad} ${r.hasta?.soyad} - ${r.tedaviAdi || ''}`,
    start: new Date(r.tarih),
    end: new Date(new Date(r.tarih).getTime() + (r.sure || 60) * 60000),
    resource: r,
  }));

  const olayStili = (olay) => ({
    style: {
      backgroundColor: durumRenk[olay.resource.durum] || '#3b82f6',
      borderRadius: '4px',
      border: 'none',
      color: 'white',
      fontSize: '12px',
    }
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <button onClick={() => setGorunum('takvim')}
            className={`btn-secondary text-sm py-1.5 px-3 ${gorunum === 'takvim' ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}`}>
            📅 Takvim
          </button>
          <button onClick={() => setGorunum('liste')}
            className={`btn-secondary text-sm py-1.5 px-3 ${gorunum === 'liste' ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}`}>
            📋 Liste
          </button>
        </div>
        <Link href="/randevular/yeni" className="btn-primary">+ Yeni Randevu</Link>
      </div>

      {gorunum === 'takvim' ? (
        <div className="card" style={{ height: 600 }}>
          {yukleniyor ? (
            <div className="flex items-center justify-center h-full text-gray-400">Yükleniyor...</div>
          ) : (
            <Calendar
              localizer={localizer}
              events={takvimOlaylari}
              startAccessor="start"
              endAccessor="end"
              eventPropGetter={olayStili}
              messages={{
                next: 'İleri', previous: 'Geri', today: 'Bugün',
                month: 'Ay', week: 'Hafta', day: 'Gün', agenda: 'Ajanda',
                noEventsInRange: 'Bu aralıkta randevu yok'
              }}
              style={{ height: '100%' }}
            />
          )}
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                {['Tarih & Saat', 'Hasta', 'Tedavi', 'Klinik', 'Durum', ''].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-gray-500 px-6 py-3 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {randevular.map(r => (
                <tr key={r._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm">
                    <p className="font-medium">{new Date(r.tarih).toLocaleDateString('tr-TR')}</p>
                    <p className="text-gray-500">{new Date(r.tarih).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium">{r.hasta?.ad} {r.hasta?.soyad}</p>
                    <p className="text-xs text-gray-500">{r.hasta?.ulke}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{r.tedaviAdi || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{r.hastane || '-'}</td>
                  <td className="px-6 py-4">
                    <span className="badge" style={{ background: `${durumRenk[r.durum]}20`, color: durumRenk[r.durum] }}>
                      {r.durum}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Link href={`/randevular/${r._id}`} className="text-blue-600 text-sm">Detay →</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
