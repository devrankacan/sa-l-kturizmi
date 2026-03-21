import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import api from '../../lib/api';

const durumRenk = {
  potansiyel: 'bg-yellow-100 text-yellow-700',
  aktif: 'bg-blue-100 text-blue-700',
  tedavi_sureci: 'bg-purple-100 text-purple-700',
  tamamlandi: 'bg-green-100 text-green-700',
  iptal: 'bg-red-100 text-red-700',
};

export default function HastaDetay() {
  const router = useRouter();
  const { id } = router.query;
  const [hasta, setHasta] = useState(null);
  const [aktiviteler, setAktiviteler] = useState([]);
  const [not, setNot] = useState('');
  const [aktifTab, setAktifTab] = useState('genel');
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    if (!id) return;
    const yukle = async () => {
      const [h, a] = await Promise.all([
        api.get(`/hastalar/${id}`),
        api.get(`/crm/hasta/${id}`)
      ]);
      setHasta(h.data.hasta);
      setAktiviteler(a.data.aktiviteler);
      setYukleniyor(false);
    };
    yukle();
  }, [id]);

  const notEkle = async () => {
    if (!not.trim()) return;
    await api.post(`/hastalar/${id}/not`, { metin: not });
    setNot('');
    const { data } = await api.get(`/hastalar/${id}`);
    setHasta(data.hasta);
  };

  const durumGuncelle = async (durum) => {
    await api.put(`/hastalar/${id}`, { durum });
    const { data } = await api.get(`/hastalar/${id}`);
    setHasta(data.hasta);
  };

  if (yukleniyor) return <div className="flex items-center justify-center h-64 text-gray-400">Yükleniyor...</div>;
  if (!hasta) return <div className="text-center text-gray-400">Hasta bulunamadı</div>;

  const tabs = [
    { id: 'genel', label: 'Genel Bilgiler' },
    { id: 'tibbi', label: 'Tıbbi Bilgiler' },
    { id: 'notlar', label: `Notlar (${hasta.notlar?.length || 0})` },
    { id: 'aktiviteler', label: `CRM (${aktiviteler.length})` },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-2xl font-bold text-blue-600">
              {hasta.ad[0]}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{hasta.ad} {hasta.soyad}</h2>
              <p className="text-sm text-gray-500">{hasta.hastaNo} · {hasta.ulke} · {hasta.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <select
              className="input text-sm py-1.5"
              value={hasta.durum}
              onChange={(e) => durumGuncelle(e.target.value)}
            >
              <option value="potansiyel">Potansiyel</option>
              <option value="aktif">Aktif</option>
              <option value="tedavi_sureci">Tedavi Süreci</option>
              <option value="tamamlandi">Tamamlandı</option>
              <option value="iptal">İptal</option>
            </select>
            <Link href={`/teklifler/yeni?hasta=${id}`} className="btn-primary text-sm py-1.5">
              + Teklif Oluştur
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-6 border-b border-gray-100">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setAktifTab(t.id)}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px
                ${aktifTab === t.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab içerikleri */}
      {aktifTab === 'genel' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card space-y-3">
            <h3 className="font-semibold text-gray-800">İletişim</h3>
            <InfoSatir label="Telefon" deger={hasta.telefon} />
            <InfoSatir label="WhatsApp" deger={hasta.whatsapp} />
            <InfoSatir label="Email" deger={hasta.email} />
            <InfoSatir label="Şehir" deger={hasta.sehir} />
            <InfoSatir label="Uyruk" deger={hasta.uyruk} />
          </div>
          <div className="card space-y-3">
            <h3 className="font-semibold text-gray-800">Kayıt Bilgileri</h3>
            <InfoSatir label="Referans" deger={hasta.referans?.kaynak} />
            <InfoSatir label="Detay" deger={hasta.referans?.detay} />
            <InfoSatir label="Koordinatör" deger={hasta.atananKoordinator ? `${hasta.atananKoordinator.ad} ${hasta.atananKoordinator.soyad}` : '-'} />
            <InfoSatir label="Kayıt Tarihi" deger={new Date(hasta.createdAt).toLocaleDateString('tr-TR')} />
          </div>
        </div>
      )}

      {aktifTab === 'tibbi' && (
        <div className="card space-y-3">
          <h3 className="font-semibold text-gray-800">Tıbbi Bilgiler</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <InfoSatir label="Boy" deger={hasta.tibbiBilgiler?.boy ? `${hasta.tibbiBilgiler.boy} cm` : '-'} />
            <InfoSatir label="Kilo" deger={hasta.tibbiBilgiler?.kilo ? `${hasta.tibbiBilgiler.kilo} kg` : '-'} />
            <InfoSatir label="Kan Grubu" deger={hasta.tibbiBilgiler?.kanGrubu} />
          </div>
          <InfoSatir label="Kronik Hastalıklar" deger={hasta.tibbiBilgiler?.kronikHastaliklar?.join(', ') || '-'} />
          <InfoSatir label="Alerjiler" deger={hasta.tibbiBilgiler?.alerjiler?.join(', ') || '-'} />
          <InfoSatir label="Kullanılan İlaçlar" deger={hasta.tibbiBilgiler?.kullanilanIlaclar?.join(', ') || '-'} />
        </div>
      )}

      {aktifTab === 'notlar' && (
        <div className="card space-y-4">
          <div className="flex gap-3">
            <input
              className="input flex-1"
              placeholder="Not ekle..."
              value={not}
              onChange={e => setNot(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && notEkle()}
            />
            <button onClick={notEkle} className="btn-primary px-4">Ekle</button>
          </div>
          <div className="space-y-3">
            {hasta.notlar?.length === 0 && <p className="text-gray-400 text-sm">Henüz not yok</p>}
            {[...( hasta.notlar || [])].reverse().map((n, i) => (
              <div key={i} className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-800">{n.metin}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {n.kullanici?.ad} {n.kullanici?.soyad} · {new Date(n.tarih).toLocaleString('tr-TR')}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {aktifTab === 'aktiviteler' && (
        <div className="card space-y-3">
          {aktiviteler.length === 0 && <p className="text-gray-400 text-sm">Aktivite yok</p>}
          {aktiviteler.map(a => (
            <div key={a._id} className="p-3 border border-gray-100 rounded-lg">
              <div className="flex justify-between">
                <p className="text-sm font-medium text-gray-800">{a.baslik}</p>
                <span className="text-xs text-gray-400">{new Date(a.createdAt).toLocaleString('tr-TR')}</span>
              </div>
              {a.aciklama && <p className="text-sm text-gray-600 mt-1">{a.aciklama}</p>}
              <p className="text-xs text-gray-400 mt-1">{a.tip} · {a.kullanici?.ad}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function InfoSatir({ label, deger }) {
  return (
    <div className="flex gap-2">
      <span className="text-sm text-gray-500 w-36 shrink-0">{label}</span>
      <span className="text-sm text-gray-800">{deger || '-'}</span>
    </div>
  );
}
