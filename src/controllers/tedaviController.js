const Tedavi = require('../models/Tedavi');

exports.tedaviOlustur = async (req, res) => {
  const tedavi = await Tedavi.create(req.body);
  res.status(201).json({ basari: true, tedavi });
};

exports.tedavileriGetir = async (req, res) => {
  const filtre = { aktif: true };
  if (req.query.kategori) filtre.kategori = req.query.kategori;
  if (req.query.ara) filtre.ad = { $regex: req.query.ara, $options: 'i' };

  const tedaviler = await Tedavi.find(filtre).sort({ kategori: 1, ad: 1 });
  res.status(200).json({ basari: true, sayi: tedaviler.length, tedaviler });
};

exports.tedaviGetir = async (req, res) => {
  const tedavi = await Tedavi.findById(req.params.id);
  if (!tedavi) return res.status(404).json({ basari: false, mesaj: 'Tedavi bulunamadı' });
  res.status(200).json({ basari: true, tedavi });
};

exports.tedaviGuncelle = async (req, res) => {
  const tedavi = await Tedavi.findByIdAndUpdate(req.params.id, req.body, {
    new: true, runValidators: true
  });
  if (!tedavi) return res.status(404).json({ basari: false, mesaj: 'Tedavi bulunamadı' });
  res.status(200).json({ basari: true, tedavi });
};

exports.kategoriler = async (req, res) => {
  const kategoriler = await Tedavi.distinct('kategori', { aktif: true });
  res.status(200).json({ basari: true, kategoriler });
};
