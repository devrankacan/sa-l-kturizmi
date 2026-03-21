import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import api from '../../lib/api';

const durumRenk = {
  taslak: 'bg-gray-100 text-gray-600',
  gonderildi: 'bg-blue-100 text-blue-700',
  inceleniyor: 'bg-yellow-100 text-yellow-700',
  onaylandi: 'bg-green-100 text-green-700',
  reddedildi: 'bg-red-100 text-red-700',
};

export default function TeklifDetay() {
  const { id } = useRouter().query;
  const [teklif, setTeklif] = useState(null);
  const [yukleniyor, setYukleniyor] = useState(true);

  const yukle = async () => {
    if (!id) return;
    const { data } = await api.get(`/teklifler/${id}`);
    setTeklif(data.teklif);
    setYukleniyor(false);
  };

  useEffect(() => { yukle(); }, [id]);

  const durumGuncelle = async (durum) => {
    await api.patch(`/teklifler/${id}/durum`, { durum });
    yukle();
  };

  if (yukleniyor) return <div className="text-center text-gray-400 py-12">Yükleniyor...</div>;
  if (!teklif) return <div className="text-center text-gray-400">Teklif bulunamadı</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="card">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Teklif #{teklif.teklifNo}</h2>
            <p className="text-sm text-gray-500 mt-1">
              {teklif.hasta?.ad} {teklif.hasta?.soyad} · {teklif.hasta?.ulke} · {new Date(teklif.createdAt).toLocaleDateString('tr-TR')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`badge ${durumRenk[teklif.durum] || ''} text-sm px-3 py-1`}>{teklif.durum}</span>
            <select className="input text-sm py-1.5 w-40" value={teklif.durum} onChange={e => durumGuncelle(e.target.value)}>
              <option value="taslak">Taslak</option>
              <option value="gonderildi">Gönderildi</option>
              <option value="inceleniyor">İnceleniyor</option>
              <option value="onaylandi">Onaylandı</option>
              <option value="reddedildi">Reddedildi</option>
              <option value="revize">Revize</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="font-semibold text-gray-800 mb-4">Teklif Kalemleri</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                {['Tedavi', 'Birim Fiyat', 'Miktar', 'İndirim', 'Toplam'].map(h => (
                  <th key={h} className="text-left text-xs text-gray-500 font-medium pb-3 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {teklif.kalemler?.map((k, i) => (
                <tr key={i}>
                  <td className="py-3 text-sm font-medium text-gray-800">{k.tedaviAdi}</td>
                  <td className="py-3 text-sm text-gray-600">${k.birimFiyat?.toLocaleString()}</td>
                  <td className="py-3 text-sm text-gray-600">{k.miktar}</td>
                  <td className="py-3 text-sm text-gray-600">%{k.indirim || 0}</td>
                  <td className="py-3 text-sm font-semibold text-blue-600">${k.toplam?.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-200">
                <td colSpan={4} className="pt-3 text-right font-bold text-gray-900">Genel Toplam:</td>
                <td className="pt-3 font-bold text-xl text-blue-600">${teklif.genelToplam?.toLocaleString()} {teklif.paraBirimi}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {teklif.notlar && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">{teklif.notlar}</p>
          </div>
        )}
      </div>
    </div>
  );
}
