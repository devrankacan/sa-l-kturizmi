const Konaklama = require('../models/Konaklama');

exports.konaklamaOlustur = async (req, res) => {
  const konaklama = await Konaklama.create(req.body);
  await konaklama.populate('hasta', 'ad soyad email hastaNo');
  res.status(201).json({ basari: true, konaklama });
};

exports.konaklamilariGetir = async (req, res) => {
  const filtre = {};
  if (req.query.hasta) filtre.hasta = req.query.hasta;
  if (req.query.durum) filtre.durum = req.query.durum;
  if (req.query.aktif === 'true') {
    const bugun = new Date();
    filtre.girisTarihi = { $lte: bugun };
    filtre.cikisTarihi = { $gte: bugun };
  }

  const konaklamalar = await Konaklama.find(filtre)
    .populate('hasta', 'ad soyad email hastaNo ulke')
    .sort({ girisTarihi: 1 });

  res.status(200).json({ basari: true, sayi: konaklamalar.length, konaklamalar });
};

exports.konaklamaGetir = async (req, res) => {
  const konaklama = await Konaklama.findById(req.params.id)
    .populate('hasta', 'ad soyad email hastaNo ulke telefon');

  if (!konaklama) return res.status(404).json({ basari: false, mesaj: 'Konaklama bulunamadı' });
  res.status(200).json({ basari: true, konaklama });
};

exports.konaklamaGuncelle = async (req, res) => {
  const konaklama = await Konaklama.findByIdAndUpdate(req.params.id, req.body, {
    new: true, runValidators: true
  }).populate('hasta', 'ad soyad email hastaNo');

  if (!konaklama) return res.status(404).json({ basari: false, mesaj: 'Konaklama bulunamadı' });
  res.status(200).json({ basari: true, konaklama });
};

exports.bugunCikislar = async (req, res) => {
  const bugun = new Date();
  bugun.setHours(0, 0, 0, 0);
  const yarin = new Date(bugun);
  yarin.setDate(yarin.getDate() + 1);

  const konaklamalar = await Konaklama.find({
    cikisTarihi: { $gte: bugun, $lt: yarin }
  }).populate('hasta', 'ad soyad hastaNo telefon');

  res.status(200).json({ basari: true, sayi: konaklamalar.length, konaklamalar });
};
