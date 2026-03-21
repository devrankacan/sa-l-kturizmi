const Randevu = require('../models/Randevu');

exports.randevuOlustur = async (req, res) => {
  const randevu = await Randevu.create(req.body);
  await randevu.populate('hasta', 'ad soyad email hastaNo');
  res.status(201).json({ basari: true, randevu });
};

exports.randevulariGetir = async (req, res) => {
  const filtre = {};
  if (req.query.hasta) filtre.hasta = req.query.hasta;
  if (req.query.doktor) filtre.doktor = req.query.doktor;
  if (req.query.durum) filtre.durum = req.query.durum;
  if (req.query.baslangic && req.query.bitis) {
    filtre.tarih = {
      $gte: new Date(req.query.baslangic),
      $lte: new Date(req.query.bitis)
    };
  }

  const randevular = await Randevu.find(filtre)
    .populate('hasta', 'ad soyad email hastaNo ulke')
    .populate('doktor', 'ad soyad')
    .sort({ tarih: 1 });

  res.status(200).json({ basari: true, sayi: randevular.length, randevular });
};

exports.randevuGetir = async (req, res) => {
  const randevu = await Randevu.findById(req.params.id)
    .populate('hasta', 'ad soyad email hastaNo ulke telefon tibbiBilgiler')
    .populate('doktor', 'ad soyad email telefon');

  if (!randevu) return res.status(404).json({ basari: false, mesaj: 'Randevu bulunamadı' });
  res.status(200).json({ basari: true, randevu });
};

exports.randevuGuncelle = async (req, res) => {
  const randevu = await Randevu.findByIdAndUpdate(req.params.id, req.body, {
    new: true, runValidators: true
  }).populate('hasta', 'ad soyad email hastaNo');

  if (!randevu) return res.status(404).json({ basari: false, mesaj: 'Randevu bulunamadı' });
  res.status(200).json({ basari: true, randevu });
};

exports.bugunRandevular = async (req, res) => {
  const bugun = new Date();
  bugun.setHours(0, 0, 0, 0);
  const yarin = new Date(bugun);
  yarin.setDate(yarin.getDate() + 1);

  const randevular = await Randevu.find({
    tarih: { $gte: bugun, $lt: yarin }
  })
    .populate('hasta', 'ad soyad hastaNo ulke')
    .populate('doktor', 'ad soyad')
    .sort({ tarih: 1 });

  res.status(200).json({ basari: true, sayi: randevular.length, randevular });
};

exports.takipEkle = async (req, res) => {
  const randevu = await Randevu.findByIdAndUpdate(
    req.params.id,
    { $push: { takipRandevulari: req.body } },
    { new: true }
  );

  if (!randevu) return res.status(404).json({ basari: false, mesaj: 'Randevu bulunamadı' });
  res.status(200).json({ basari: true, randevu });
};
