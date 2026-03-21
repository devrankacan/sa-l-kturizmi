const Transfer = require('../models/Transfer');

exports.transferOlustur = async (req, res) => {
  const transfer = await Transfer.create(req.body);
  await transfer.populate('hasta', 'ad soyad email hastaNo');
  res.status(201).json({ basari: true, transfer });
};

exports.transferleriGetir = async (req, res) => {
  const filtre = {};
  if (req.query.hasta) filtre.hasta = req.query.hasta;
  if (req.query.durum) filtre.durum = req.query.durum;
  if (req.query.tip) filtre.tip = req.query.tip;

  const transferler = await Transfer.find(filtre)
    .populate('hasta', 'ad soyad email hastaNo ulke')
    .sort({ 'kalkis.tarih': 1 });

  res.status(200).json({ basari: true, sayi: transferler.length, transferler });
};

exports.transferGetir = async (req, res) => {
  const transfer = await Transfer.findById(req.params.id)
    .populate('hasta', 'ad soyad email hastaNo ulke telefon');

  if (!transfer) return res.status(404).json({ basari: false, mesaj: 'Transfer bulunamadı' });
  res.status(200).json({ basari: true, transfer });
};

exports.transferGuncelle = async (req, res) => {
  const transfer = await Transfer.findByIdAndUpdate(req.params.id, req.body, {
    new: true, runValidators: true
  }).populate('hasta', 'ad soyad email hastaNo');

  if (!transfer) return res.status(404).json({ basari: false, mesaj: 'Transfer bulunamadı' });
  res.status(200).json({ basari: true, transfer });
};
