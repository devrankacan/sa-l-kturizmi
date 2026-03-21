const Hasta = require('../models/Hasta');
const path = require('path');

exports.hastaOlustur = async (req, res) => {
  const hasta = await Hasta.create({
    ...req.body,
    atananKoordinator: req.body.atananKoordinator || req.kullanici._id
  });
  res.status(201).json({ basari: true, hasta });
};

exports.hastalariGetir = async (req, res) => {
  const filtre = {};
  if (req.query.durum) filtre.durum = req.query.durum;
  if (req.query.ulke) filtre.ulke = req.query.ulke;
  if (req.query.koordinator) filtre.atananKoordinator = req.query.koordinator;
  if (req.query.ara) {
    filtre.$or = [
      { ad: { $regex: req.query.ara, $options: 'i' } },
      { soyad: { $regex: req.query.ara, $options: 'i' } },
      { email: { $regex: req.query.ara, $options: 'i' } },
      { hastaNo: { $regex: req.query.ara, $options: 'i' } }
    ];
  }

  const sayfa = parseInt(req.query.sayfa) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const atla = (sayfa - 1) * limit;

  const toplam = await Hasta.countDocuments(filtre);
  const hastalar = await Hasta.find(filtre)
    .populate('atananKoordinator', 'ad soyad email')
    .sort({ createdAt: -1 })
    .skip(atla)
    .limit(limit);

  res.status(200).json({
    basari: true,
    toplam,
    sayfa,
    sayfaSayisi: Math.ceil(toplam / limit),
    hastalar
  });
};

exports.hastaGetir = async (req, res) => {
  const hasta = await Hasta.findById(req.params.id)
    .populate('atananKoordinator', 'ad soyad email telefon')
    .populate('notlar.kullanici', 'ad soyad');

  if (!hasta) return res.status(404).json({ basari: false, mesaj: 'Hasta bulunamadı' });
  res.status(200).json({ basari: true, hasta });
};

exports.hastaGuncelle = async (req, res) => {
  const hasta = await Hasta.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  }).populate('atananKoordinator', 'ad soyad email');

  if (!hasta) return res.status(404).json({ basari: false, mesaj: 'Hasta bulunamadı' });
  res.status(200).json({ basari: true, hasta });
};

exports.hastaSil = async (req, res) => {
  const hasta = await Hasta.findByIdAndDelete(req.params.id);
  if (!hasta) return res.status(404).json({ basari: false, mesaj: 'Hasta bulunamadı' });
  res.status(200).json({ basari: true, mesaj: 'Hasta silindi' });
};

exports.notEkle = async (req, res) => {
  const hasta = await Hasta.findByIdAndUpdate(
    req.params.id,
    {
      $push: {
        notlar: {
          metin: req.body.metin,
          kullanici: req.kullanici._id
        }
      }
    },
    { new: true }
  ).populate('notlar.kullanici', 'ad soyad');

  if (!hasta) return res.status(404).json({ basari: false, mesaj: 'Hasta bulunamadı' });
  res.status(200).json({ basari: true, hasta });
};

exports.belgeYukle = async (req, res) => {
  if (!req.file) return res.status(400).json({ basari: false, mesaj: 'Dosya yüklenmedi' });

  const hasta = await Hasta.findByIdAndUpdate(
    req.params.id,
    {
      $push: {
        belgeler: {
          tip: req.body.tip || 'diger',
          dosyaAdi: req.file.originalname,
          dosyaYolu: req.file.filename
        }
      }
    },
    { new: true }
  );

  if (!hasta) return res.status(404).json({ basari: false, mesaj: 'Hasta bulunamadı' });
  res.status(200).json({ basari: true, mesaj: 'Belge yüklendi', hasta });
};

exports.istatistikler = async (req, res) => {
  const [
    toplamHasta,
    durumDagilimi,
    ulkeDagilimi,
    referansDagilimi,
    aylikBuyume
  ] = await Promise.all([
    Hasta.countDocuments(),
    Hasta.aggregate([{ $group: { _id: '$durum', sayi: { $sum: 1 } } }]),
    Hasta.aggregate([
      { $group: { _id: '$ulke', sayi: { $sum: 1 } } },
      { $sort: { sayi: -1 } },
      { $limit: 10 }
    ]),
    Hasta.aggregate([{ $group: { _id: '$referans.kaynak', sayi: { $sum: 1 } } }]),
    Hasta.aggregate([
      {
        $group: {
          _id: { yil: { $year: '$createdAt' }, ay: { $month: '$createdAt' } },
          sayi: { $sum: 1 }
        }
      },
      { $sort: { '_id.yil': -1, '_id.ay': -1 } },
      { $limit: 12 }
    ])
  ]);

  res.status(200).json({
    basari: true,
    istatistikler: { toplamHasta, durumDagilimi, ulkeDagilimi, referansDagilimi, aylikBuyume }
  });
};
