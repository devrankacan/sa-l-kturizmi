import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import api from '../../lib/api';

export default function RandevuDetay() {
  const { id } = useRouter().query;
  const [randevu, setRandevu] = useState(null);
  const [yukleniyor, setYukleniyor] = useState(true);

  const yukle = async () => {
    if (!id) return;
    const { data } = await api.get(`/randevular/${id}`);
    setRandevu(data.randevu);
    setYukleniyor(false);
  };

  useEffect(() => { yukle(); }, [id]);

  const durumGuncelle = async (durum) => {
    await api.put(`/randevular/${id}`, { durum });
    yukle();
  };

  if (yukleniyor) return <div className="text-center py-12 text-gray-400">Yükleniyor...</div>;
  if (!randevu) return <div className="text-center text-gray-400">Randevu bulunamadı</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="card">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {randevu.hasta?.ad} {randevu.hasta?.soyad}
            </h2>
            <p className="text-sm text-gray-500">{randevu.tedaviAdi} · {randevu.hastane}</p>
          </div>
          <select className="input w-40 text-sm" value={randevu.durum} onChange={e => durumGuncelle(e.target.value)}>
            <option value="planlandı">Planlandı</option>
            <option value="onaylandi">Onaylandı</option>
            <option value="tamamlandi">Tamamlandı</option>
            <option value="iptal">İptal</option>
            <option value="ertelendi">Ertelendi</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6">
          {[
            ['Tarih', new Date(randevu.tarih).toLocaleString('tr-TR')],
            ['Süre', `${randevu.sure} dakika`],
            ['Doktor', randevu.doktorAdi || '-'],
            ['Klinik', randevu.klinik || '-'],
          ].map(([label, val]) => (
            <div key={label}>
              <p className="text-xs text-gray-500">{label}</p>
              <p className="text-sm font-medium text-gray-800">{val}</p>
            </div>
          ))}
        </div>

        {randevu.notlar && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">{randevu.notlar}</p>
          </div>
        )}
      </div>
    </div>
  );
}
