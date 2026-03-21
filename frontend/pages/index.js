import { useEffect, useState } from 'react';
import api from '../lib/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const RENKLER = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const StatKart = ({ baslik, deger, ikon, renk }) => (
  <div className="card flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${renk}`}>
      {ikon}
    </div>
    <div>
      <p className="text-sm text-gray-500">{baslik}</p>
      <p className="text-2xl font-bold text-gray-900">{deger}</p>
    </div>
  </div>
);

export default function Dashboard() {
  const [hastaIst, setHastaIst] = useState(null);
  const [crmIst, setCrmIst] = useState(null);
  const [leadOzet, setLeadOzet] = useState(null);
  const [bugunRandevu, setBugunRandevu] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    const yukle = async () => {
      try {
        const [h, c, l, r] = await Promise.all([
          api.get('/hastalar/istatistikler'),
          api.get('/crm/istatistikler'),
          api.get('/crm/lead-ozeti'),
          api.get('/randevular/bugun'),
        ]);
        setHastaIst(h.data.istatistikler);
        setCrmIst(c.data.istatistikler);
        setLeadOzet(l.data.ozet);
        setBugunRandevu(r.data.randevular);
      } catch (e) {
        console.error(e);
      } finally {
        setYukleniyor(false);
      }
    };
    yukle();
  }, []);

  if (yukleniyor) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-gray-500">Yükleniyor...</div>
    </div>
  );

  const aylikVeri = crmIst?.gelirOzeti?.map(g => ({
    name: `${g._id.yil}/${g._id.ay}`,
    gelir: g.gelir
  })).reverse() || [];

  const durumVeri = hastaIst?.durumDagilimi?.map(d => ({
    name: d._id,
    value: d.sayi
  })) || [];

  return (
    <div className="space-y-6">
      {/* Stat kartları */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatKart baslik="Toplam Hasta" deger={hastaIst?.toplamHasta || 0} ikon="👥" renk="bg-blue-50" />
        <StatKart baslik="Potansiyel Lead" deger={leadOzet?.potansiyel || 0} ikon="🎯" renk="bg-yellow-50" />
        <StatKart baslik="Bu Ay Yeni" deger={leadOzet?.buAyYeni || 0} ikon="✨" renk="bg-green-50" />
        <StatKart baslik="Dönüşüm" deger={leadOzet?.donusumOrani || '%0'} ikon="📈" renk="bg-purple-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gelir grafiği */}
        <div className="card lg:col-span-2">
          <h3 className="text-base font-semibold text-gray-800 mb-4">Aylık Gelir (USD)</h3>
          {aylikVeri.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={aylikVeri}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => [`$${v.toLocaleString()}`, 'Gelir']} />
                <Bar dataKey="gelir" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-56 flex items-center justify-center text-gray-400 text-sm">
              Henüz onaylanmış teklif yok
            </div>
          )}
        </div>

        {/* Durum dağılımı */}
        <div className="card">
          <h3 className="text-base font-semibold text-gray-800 mb-4">Hasta Durumları</h3>
          {durumVeri.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={durumVeri} dataKey="value" cx="50%" cy="50%" outerRadius={70}>
                    {durumVeri.map((_, i) => <Cell key={i} fill={RENKLER[i % RENKLER.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1 mt-2">
                {durumVeri.map((d, i) => (
                  <div key={d.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ background: RENKLER[i % RENKLER.length] }} />
                      <span className="text-gray-600">{d.name}</span>
                    </div>
                    <span className="font-medium">{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-40 flex items-center justify-center text-gray-400 text-sm">Veri yok</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bugünkü randevular */}
        <div className="card">
          <h3 className="text-base font-semibold text-gray-800 mb-4">
            Bugünkü Randevular ({bugunRandevu.length})
          </h3>
          {bugunRandevu.length === 0 ? (
            <p className="text-gray-400 text-sm">Bugün randevu yok</p>
          ) : (
            <div className="space-y-3">
              {bugunRandevu.map(r => (
                <div key={r._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">{r.hasta?.ad} {r.hasta?.soyad}</p>
                    <p className="text-xs text-gray-500">{r.tedaviAdi} · {r.hastane}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{new Date(r.tarih).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</p>
                    <DurumBadge durum={r.durum} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ülke dağılımı */}
        <div className="card">
          <h3 className="text-base font-semibold text-gray-800 mb-4">Top 10 Ülke</h3>
          {hastaIst?.ulkeDagilimi?.length === 0 ? (
            <p className="text-gray-400 text-sm">Veri yok</p>
          ) : (
            <div className="space-y-2">
              {hastaIst?.ulkeDagilimi?.map((u, i) => (
                <div key={u._id} className="flex items-center gap-3">
                  <span className="text-sm text-gray-500 w-4">{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{u._id}</span>
                      <span className="text-gray-500">{u.sayi}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full">
                      <div
                        className="h-1.5 bg-blue-500 rounded-full"
                        style={{ width: `${(u.sayi / (hastaIst?.toplamHasta || 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DurumBadge({ durum }) {
  const renkler = {
    planlandı: 'bg-yellow-100 text-yellow-700',
    onaylandi: 'bg-blue-100 text-blue-700',
    tamamlandi: 'bg-green-100 text-green-700',
    iptal: 'bg-red-100 text-red-700',
  };
  return <span className={`badge ${renkler[durum] || 'bg-gray-100 text-gray-600'}`}>{durum}</span>;
}
