const WhatsappKonusma = require('../models/WhatsappKonusma');
const Hasta = require('../models/Hasta');
const User = require('../models/User');
const { mesajGonder } = require('../services/whatsappService');
const { konusmayiAnalizEt } = require('../services/aiService');

// Sistem kullanıcısını önbellekte tut
let sistemKullanicisi = null;
const sistemKullanicisiGetir = async () => {
  if (sistemKullanicisi) return sistemKullanicisi;
  sistemKullanicisi = await User.findOne({ rol: 'admin' }).select('_id');
  return sistemKullanicisi;
};

// GET /api/whatsapp/webhook - Meta doğrulama
exports.webhookDogrula = (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    console.log('[WhatsApp] Webhook doğrulandı');
    return res.status(200).send(challenge);
  }
  res.status(403).json({ basari: false, mesaj: 'Doğrulama başarısız' });
};

// POST /api/whatsapp/webhook - Gelen mesajlar
exports.webhookAl = async (req, res) => {
  // Meta 200 bekliyor, hızlıca cevap ver
  res.status(200).send('OK');

  try {
    const entry = req.body?.entry?.[0];
    const degisiklik = entry?.changes?.[0]?.value;

    if (!degisiklik?.messages?.length) return;

    const mesaj = degisiklik.messages[0];
    if (mesaj.type !== 'text') return; // Sadece metin mesajları işle

    const telefonNo = mesaj.from;
    const metin = mesaj.text.body;

    console.log(`[WhatsApp] Gelen mesaj - ${telefonNo}: ${metin}`);

    // Konuşmayı bul veya oluştur
    let konusma = await WhatsappKonusma.findOne({ telefon: telefonNo });
    if (!konusma) {
      konusma = await WhatsappKonusma.create({ telefon: telefonNo, mesajlar: [], toplamVeri: {} });
    }

    // Hasta zaten oluşturulduysa sadece not ekle
    if (konusma.durum === 'hasta_olusturuldu') {
      konusma.mesajlar.push({ yon: 'gelen', metin });
      await konusma.save();

      if (konusma.hastaId) {
        await Hasta.findByIdAndUpdate(konusma.hastaId, {
          $push: { notlar: { metin: `[WhatsApp] ${metin}`, kullanici: (await sistemKullanicisiGetir())._id } }
        });
      }

      await mesajGonder(telefonNo, 'Mesajınız alındı. Koordinatörünüz en kısa sürede size dönecektir. 🙏');
      return;
    }

    // Gelen mesajı kaydet
    konusma.mesajlar.push({ yon: 'gelen', metin });

    // AI ile analiz et
    const sonuc = await konusmayiAnalizEt(konusma.mesajlar, konusma.toplamVeri);

    // Toplanan veriyi güncelle
    if (sonuc.guncelVeri) {
      konusma.toplamVeri = { ...konusma.toplamVeri, ...sonuc.guncelVeri };
    }

    // Cevabı kaydet
    konusma.mesajlar.push({ yon: 'giden', metin: sonuc.yanit });

    if (!sonuc.devam && sonuc.hastaVerisi) {
      // Yeterli bilgi toplandı, hasta oluştur
      const kullanici = await sistemKullanicisiGetir();
      const hasta = await Hasta.create({
        ad: sonuc.hastaVerisi.ad,
        soyad: sonuc.hastaVerisi.soyad,
        email: sonuc.hastaVerisi.email,
        telefon: telefonNo,
        whatsapp: telefonNo,
        ulke: sonuc.hastaVerisi.ulke,
        dil: sonuc.hastaVerisi.dil || 'tr',
        durum: 'potansiyel',
        referans: { kaynak: 'sosyal_medya', detay: 'WhatsApp' },
        atananKoordinator: kullanici._id,
        notlar: sonuc.hastaVerisi.tedaviTalebi ? [{
          metin: `Tedavi talebi: ${sonuc.hastaVerisi.tedaviTalebi}`,
          kullanici: kullanici._id
        }] : []
      });

      konusma.durum = 'hasta_olusturuldu';
      konusma.hastaId = hasta._id;
      console.log(`[WhatsApp] Hasta oluşturuldu: ${hasta.hastaNo} - ${hasta.ad} ${hasta.soyad}`);
    }

    await konusma.save();
    await mesajGonder(telefonNo, sonuc.yanit);

  } catch (err) {
    console.error('[WhatsApp] Webhook işleme hatası:', err.message);
  }
};

// GET /api/whatsapp/konusmalar - Tüm konuşmaları listele (korumalı)
exports.konusmalariGetir = async (req, res) => {
  const konusmalar = await WhatsappKonusma.find()
    .populate('hastaId', 'ad soyad hastaNo')
    .sort({ updatedAt: -1 })
    .limit(100);
  res.json({ basari: true, konusmalar });
};

// GET /api/whatsapp/konusmalar/:id - Tek konuşma detayı
exports.konusmaGetir = async (req, res) => {
  const konusma = await WhatsappKonusma.findById(req.params.id)
    .populate('hastaId', 'ad soyad hastaNo durum');
  if (!konusma) return res.status(404).json({ basari: false, mesaj: 'Konuşma bulunamadı' });
  res.json({ basari: true, konusma });
};

// POST /api/whatsapp/konusmalar/:id/mesaj - Koordinatör mesaj gönderir
exports.koordinatorMesajGonder = async (req, res) => {
  const { metin } = req.body;
  if (!metin?.trim()) return res.status(400).json({ basari: false, mesaj: 'Mesaj boş olamaz' });

  const konusma = await WhatsappKonusma.findById(req.params.id);
  if (!konusma) return res.status(404).json({ basari: false, mesaj: 'Konuşma bulunamadı' });

  // WhatsApp API üzerinden gönder
  await mesajGonder(konusma.telefon, metin);

  // Konuşmaya kaydet
  konusma.mesajlar.push({ yon: 'giden', metin });
  await konusma.save();

  // Hasta varsa nota ekle
  if (konusma.hastaId) {
    await Hasta.findByIdAndUpdate(konusma.hastaId, {
      $push: { notlar: { metin: `[WhatsApp - Koordinatör] ${metin}`, kullanici: req.kullanici._id } }
    });
  }

  res.json({ basari: true, konusma });
};
