import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { useSettings } from '../../lib/settingsContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

const BolumBaslik = ({ ikon, baslik, aciklama }) => (
  <div className="flex items-center gap-3 mb-4">
    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-xl">{ikon}</div>
    <div>
      <h3 className="font-semibold text-gray-800">{baslik}</h3>
      {aciklama && <p className="text-xs text-gray-500">{aciklama}</p>}
    </div>
  </div>
);

export default function AyarlarSayfasi() {
  const { setAyarlar } = useSettings();
  const [form, setForm] = useState({
    firmaAdi: '',
    slogan: '',
    telefon: '',
    email: '',
    adres: '',
    webSitesi: '',
    primaryRenk: '#3b82f6',
    sosyalMedya: { instagram: '', facebook: '', twitter: '', youtube: '' },
    whatsapp: { aiAdi: '', karsilamaMesaji: '', aktif: true }
  });
  const [logoOnizleme, setLogoOnizleme] = useState(null);
  const [logoDosya, setLogoDosya] = useState(null);
  const [kaydediliyor, setKaydediliyor] = useState(false);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [basarili, setBasarili] = useState(false);

  useEffect(() => {
    const yukle = async () => {
      try {
        const res = await api.get('/ayarlar');
        const a = res.data.ayarlar;
        setForm({
          firmaAdi: a.firmaAdi || '',
          slogan: a.slogan || '',
          telefon: a.telefon || '',
          email: a.email || '',
          adres: a.adres || '',
          webSitesi: a.webSitesi || '',
          primaryRenk: a.primaryRenk || '#3b82f6',
          sosyalMedya: {
            instagram: a.sosyalMedya?.instagram || '',
            facebook: a.sosyalMedya?.facebook || '',
            twitter: a.sosyalMedya?.twitter || '',
            youtube: a.sosyalMedya?.youtube || ''
          },
          whatsapp: {
            aiAdi: a.whatsapp?.aiAdi || 'Sağlık Turizmi Asistanı',
            karsilamaMesaji: a.whatsapp?.karsilamaMesaji || '',
            aktif: a.whatsapp?.aktif !== false
          }
        });
        if (a.logoYolu) {
          setLogoOnizleme(`${API_URL.replace('/api', '')}/uploads/${a.logoYolu}`);
        }
      } catch {
        // sessiz
      } finally {
        setYukleniyor(false);
      }
    };
    yukle();
  }, []);

  const degistir = (alan, deger) => setForm(prev => ({ ...prev, [alan]: deger }));
  const sosyalDegistir = (alan, deger) =>
    setForm(prev => ({ ...prev, sosyalMedya: { ...prev.sosyalMedya, [alan]: deger } }));
  const whatsappDegistir = (alan, deger) =>
    setForm(prev => ({ ...prev, whatsapp: { ...prev.whatsapp, [alan]: deger } }));

  const logoDegistir = (e) => {
    const dosya = e.target.files[0];
    if (!dosya) return;
    setLogoDosya(dosya);
    setLogoOnizleme(URL.createObjectURL(dosya));
  };

  const kaydet = async (e) => {
    e.preventDefault();
    setKaydediliyor(true);
    setBasarili(false);
    try {
      // Önce logo yükleme
      if (logoDosya) {
        const fd = new FormData();
        fd.append('logo', logoDosya);
        await api.post('/ayarlar/logo', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      // Ayarları kaydet
      const res = await api.put('/ayarlar', form);
      setAyarlar(prev => ({ ...prev, ...res.data.ayarlar }));
      setBasarili(true);
      setTimeout(() => setBasarili(false), 3000);
    } catch (err) {
      alert(err.response?.data?.mesaj || 'Kayıt başarısız');
    } finally {
      setKaydediliyor(false);
    }
  };

  if (yukleniyor) {
    return <div className="flex items-center justify-center h-64 text-gray-400">Yükleniyor...</div>;
  }

  return (
    <form onSubmit={kaydet} className="max-w-3xl mx-auto space-y-6">
      {basarili && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm font-medium">
          Ayarlar başarıyla kaydedildi!
        </div>
      )}

      {/* Firma Kimliği */}
      <div className="card">
        <BolumBaslik ikon="🏢" baslik="Firma Kimliği" aciklama="Platformda görünecek firma bilgileri" />

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Firma Logosu</label>
          <div className="flex items-center gap-5">
            <div className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden bg-gray-50">
              {logoOnizleme
                ? <img src={logoOnizleme} alt="Logo" className="w-full h-full object-contain" />
                : <span className="text-3xl">🏥</span>}
            </div>
            <div>
              <label className="btn-secondary cursor-pointer text-sm">
                Logo Seç
                <input type="file" accept="image/*" onChange={logoDegistir} className="hidden" />
              </label>
              <p className="text-xs text-gray-400 mt-1.5">PNG, JPG, SVG · Maks 2MB</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Firma Adı *</label>
            <input
              type="text"
              value={form.firmaAdi}
              onChange={e => degistir('firmaAdi', e.target.value)}
              className="input"
              required
              placeholder="Örn: İstanbul Sağlık Turizmi"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Slogan</label>
            <input
              type="text"
              value={form.slogan}
              onChange={e => degistir('slogan', e.target.value)}
              className="input"
              placeholder="Örn: Sağlığınız için en iyi tercih"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
            <input
              type="tel"
              value={form.telefon}
              onChange={e => degistir('telefon', e.target.value)}
              className="input"
              placeholder="+90 212 000 00 00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-posta</label>
            <input
              type="email"
              value={form.email}
              onChange={e => degistir('email', e.target.value)}
              className="input"
              placeholder="info@firma.com"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Web Sitesi</label>
            <input
              type="url"
              value={form.webSitesi}
              onChange={e => degistir('webSitesi', e.target.value)}
              className="input"
              placeholder="https://www.firmaniz.com"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Adres</label>
            <textarea
              value={form.adres}
              onChange={e => degistir('adres', e.target.value)}
              className="input resize-none"
              rows={2}
              placeholder="Firma adresi..."
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Tema Rengi</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={form.primaryRenk}
              onChange={e => degistir('primaryRenk', e.target.value)}
              className="w-10 h-10 rounded-lg cursor-pointer border border-gray-200"
            />
            <span className="text-sm text-gray-600">{form.primaryRenk}</span>
            <div
              className="ml-2 px-4 py-1.5 rounded-lg text-white text-sm font-medium"
              style={{ backgroundColor: form.primaryRenk }}
            >
              Önizleme
            </div>
          </div>
        </div>
      </div>

      {/* Sosyal Medya */}
      <div className="card">
        <BolumBaslik ikon="📱" baslik="Sosyal Medya" aciklama="Firma sosyal medya hesapları" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { key: 'instagram', label: 'Instagram', placeholder: '@hesabiniz' },
            { key: 'facebook', label: 'Facebook', placeholder: 'facebook.com/hesabiniz' },
            { key: 'twitter', label: 'X (Twitter)', placeholder: '@hesabiniz' },
            { key: 'youtube', label: 'YouTube', placeholder: 'youtube.com/@kanaliniz' }
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <input
                type="text"
                value={form.sosyalMedya[key]}
                onChange={e => sosyalDegistir(key, e.target.value)}
                className="input"
                placeholder={placeholder}
              />
            </div>
          ))}
        </div>
      </div>

      {/* WhatsApp AI Ayarları */}
      <div className="card">
        <BolumBaslik ikon="🤖" baslik="WhatsApp AI Asistanı" aciklama="Hastalarla otomatik konuşan AI'ın davranış ayarları" />

        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl mb-4">
          <div>
            <p className="text-sm font-medium text-gray-800">AI Asistanı Aktif</p>
            <p className="text-xs text-gray-500">Kapalıyken gelen mesajlara AI cevap vermez</p>
          </div>
          <button
            type="button"
            onClick={() => whatsappDegistir('aktif', !form.whatsapp.aktif)}
            className={`w-12 h-6 rounded-full transition-colors relative ${form.whatsapp.aktif ? 'bg-blue-600' : 'bg-gray-300'}`}
          >
            <span
              className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.whatsapp.aktif ? 'translate-x-7' : 'translate-x-1'}`}
            />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">AI Asistan Adı</label>
            <input
              type="text"
              value={form.whatsapp.aiAdi}
              onChange={e => whatsappDegistir('aiAdi', e.target.value)}
              className="input"
              placeholder="Örn: Sağlık Turizmi Asistanı"
            />
            <p className="text-xs text-gray-400 mt-1">AI kendini bu isimle tanıtır</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Özel Karşılama Mesajı
              <span className="text-gray-400 font-normal ml-1">(opsiyonel)</span>
            </label>
            <textarea
              value={form.whatsapp.karsilamaMesaji}
              onChange={e => whatsappDegistir('karsilamaMesaji', e.target.value)}
              className="input resize-none"
              rows={3}
              placeholder="Boş bırakırsanız AI otomatik karşılama yazar. Örn: Merhaba! Türkiye'nin önde gelen sağlık turizmi platformuna hoş geldiniz..."
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pb-6">
        <button type="submit" disabled={kaydediliyor} className="btn-primary px-8 disabled:opacity-50">
          {kaydediliyor ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
      </div>
    </form>
  );
}
