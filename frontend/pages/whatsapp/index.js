import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import api from '../../lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

function sure(tarih) {
  const d = new Date(tarih);
  return d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
}

function tarihBaslik(tarih) {
  const d = new Date(tarih);
  const bugun = new Date();
  const dun = new Date(bugun);
  dun.setDate(dun.getDate() - 1);

  if (d.toDateString() === bugun.toDateString()) return 'Bugün';
  if (d.toDateString() === dun.toDateString()) return 'Dün';
  return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' });
}

function DurumBadge({ durum }) {
  const map = {
    devam_ediyor: 'bg-yellow-100 text-yellow-700',
    hasta_olusturuldu: 'bg-green-100 text-green-700',
    kapandi: 'bg-gray-100 text-gray-500'
  };
  const label = {
    devam_ediyor: 'Devam Ediyor',
    hasta_olusturuldu: 'Hasta Kaydı Oluştu',
    kapandi: 'Kapandı'
  };
  return (
    <span className={`badge ${map[durum] || 'bg-gray-100 text-gray-500'}`}>
      {label[durum] || durum}
    </span>
  );
}

export default function WhatsappSayfasi() {
  const [konusmalar, setKonusmalar] = useState([]);
  const [secili, setSecili] = useState(null);
  const [mesajlar, setMesajlar] = useState([]);
  const [yeniMesaj, setYeniMesaj] = useState('');
  const [gonderiliyor, setGonderiliyor] = useState(false);
  const [yukleniyor, setYukleniyor] = useState(true);
  const mesajSonuRef = useRef(null);
  const pollingRef = useRef(null);

  const konusmalariYukle = async () => {
    try {
      const res = await api.get('/whatsapp/konusmalar');
      setKonusmalar(res.data.konusmalar);
    } catch {
      // sessiz
    } finally {
      setYukleniyor(false);
    }
  };

  const konusmaYukle = async (id) => {
    try {
      const res = await api.get(`/whatsapp/konusmalar/${id}`);
      const k = res.data.konusma;
      setSecili(k);
      setMesajlar(k.mesajlar);
    } catch {
      // sessiz
    }
  };

  useEffect(() => {
    konusmalariYukle();
  }, []);

  // Seçili konuşmayı 5sn'de bir güncelle
  useEffect(() => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    if (!secili) return;

    pollingRef.current = setInterval(async () => {
      const res = await api.get(`/whatsapp/konusmalar/${secili._id}`);
      const k = res.data.konusma;
      setSecili(k);
      setMesajlar(k.mesajlar);
      // Listeyi de güncelle (yeni mesaj sayısı, sıra vs)
      setKonusmalar(prev =>
        prev.map(p => p._id === k._id ? { ...p, updatedAt: k.updatedAt, mesajlar: k.mesajlar } : p)
          .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      );
    }, 5000);

    return () => clearInterval(pollingRef.current);
  }, [secili?._id]);

  // Yeni mesaj gelince en alta in
  useEffect(() => {
    mesajSonuRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mesajlar]);

  const gonder = async (e) => {
    e.preventDefault();
    if (!yeniMesaj.trim() || !secili) return;
    setGonderiliyor(true);
    try {
      const res = await api.post(`/whatsapp/konusmalar/${secili._id}/mesaj`, { metin: yeniMesaj });
      setMesajlar(res.data.konusma.mesajlar);
      setYeniMesaj('');
    } catch (err) {
      alert(err.response?.data?.mesaj || 'Mesaj gönderilemedi');
    } finally {
      setGonderiliyor(false);
    }
  };

  // Mesajları gün gruplarına ayır
  const grupluMesajlar = mesajlar.reduce((acc, m) => {
    const gun = new Date(m.tarih).toDateString();
    if (!acc[gun]) acc[gun] = { tarih: m.tarih, mesajlar: [] };
    acc[gun].mesajlar.push(m);
    return acc;
  }, {});

  return (
    <div className="flex h-[calc(100vh-4rem)] -m-6 overflow-hidden">
      {/* Sol panel: Konuşma listesi */}
      <div className="w-80 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">WhatsApp Konuşmaları</h2>
          <p className="text-xs text-gray-500 mt-0.5">{konusmalar.length} konuşma</p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {yukleniyor ? (
            <div className="p-4 text-center text-gray-400 text-sm">Yükleniyor...</div>
          ) : konusmalar.length === 0 ? (
            <div className="p-6 text-center text-gray-400">
              <div className="text-3xl mb-2">💬</div>
              <p className="text-sm">Henüz konuşma yok</p>
            </div>
          ) : (
            konusmalar.map(k => {
              const sonMesaj = k.mesajlar?.[k.mesajlar.length - 1];
              const isActive = secili?._id === k._id;
              return (
                <button
                  key={k._id}
                  onClick={() => konusmaYukle(k._id)}
                  className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors
                    ${isActive ? 'bg-blue-50 border-l-2 border-l-blue-500' : ''}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm text-gray-800">
                      {k.hastaId ? `${k.hastaId.ad} ${k.hastaId.soyad}` : k.telefon}
                    </span>
                    {sonMesaj && (
                      <span className="text-xs text-gray-400">{sure(sonMesaj.tarih)}</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs text-gray-500 truncate flex-1">
                      {sonMesaj ? (
                        <><span className="mr-1">{sonMesaj.yon === 'giden' ? '✓' : ''}</span>{sonMesaj.metin}</>
                      ) : 'Henüz mesaj yok'}
                    </p>
                    <DurumBadge durum={k.durum} />
                  </div>
                  {k.hastaId && (
                    <p className="text-xs text-blue-500 mt-0.5">{k.hastaId.hastaNo}</p>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Sağ panel: Konuşma */}
      {secili ? (
        <div className="flex-1 flex flex-col bg-gray-50">
          {/* Konuşma başlığı */}
          <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-800">
                {secili.hastaId
                  ? `${secili.hastaId.ad} ${secili.hastaId.soyad}`
                  : secili.telefon}
              </h3>
              <p className="text-xs text-gray-500">{secili.telefon}</p>
            </div>
            <div className="flex items-center gap-3">
              <DurumBadge durum={secili.durum} />
              {secili.hastaId && (
                <Link
                  href={`/hastalar/${secili.hastaId._id}`}
                  className="text-xs text-blue-600 hover:underline font-medium"
                >
                  Hasta Kartı →
                </Link>
              )}
            </div>
          </div>

          {/* Mesajlar */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-1">
            {Object.entries(grupluMesajlar).map(([gun, grup]) => (
              <div key={gun}>
                <div className="text-center my-4">
                  <span className="bg-white text-gray-400 text-xs px-3 py-1 rounded-full shadow-sm border border-gray-100">
                    {tarihBaslik(grup.tarih)}
                  </span>
                </div>
                {grup.mesajlar.map((m, i) => (
                  <div key={i} className={`flex mb-2 ${m.yon === 'giden' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl text-sm shadow-sm
                        ${m.yon === 'giden'
                          ? 'bg-blue-600 text-white rounded-br-sm'
                          : 'bg-white text-gray-800 rounded-bl-sm border border-gray-100'}`}
                    >
                      <p className="leading-relaxed">{m.metin}</p>
                      <p className={`text-xs mt-1 ${m.yon === 'giden' ? 'text-blue-200' : 'text-gray-400'}`}>
                        {sure(m.tarih)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ))}
            <div ref={mesajSonuRef} />
          </div>

          {/* Mesaj gönderme */}
          <div className="bg-white border-t border-gray-200 px-4 py-3">
            <form onSubmit={gonder} className="flex items-center gap-3">
              <input
                type="text"
                value={yeniMesaj}
                onChange={e => setYeniMesaj(e.target.value)}
                placeholder="Mesaj yazın..."
                className="flex-1 input"
                disabled={gonderiliyor}
              />
              <button
                type="submit"
                disabled={gonderiliyor || !yeniMesaj.trim()}
                className="btn-primary px-5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {gonderiliyor ? '...' : 'Gönder'}
              </button>
            </form>
            <p className="text-xs text-gray-400 mt-2 ml-1">
              Bu mesaj doğrudan hastanın WhatsApp'ına gidecek
            </p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center text-gray-400">
            <div className="text-5xl mb-4">💬</div>
            <p className="text-base font-medium">Bir konuşma seçin</p>
            <p className="text-sm mt-1">Sol panelden konuşmaya tıklayın</p>
          </div>
        </div>
      )}
    </div>
  );
}
