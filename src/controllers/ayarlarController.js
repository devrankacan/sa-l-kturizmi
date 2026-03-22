const Ayarlar = require('../models/Ayarlar');
const upload = require('../middleware/upload');

exports.ayarlariGetir = async (req, res) => {
  const ayarlar = await Ayarlar.getir();
  res.json({ basari: true, ayarlar });
};

exports.ayarlariGuncelle = async (req, res) => {
  const ayarlar = await Ayarlar.findOneAndUpdate(
    {},
    { $set: req.body },
    { new: true, upsert: true, runValidators: true }
  );
  res.json({ basari: true, ayarlar });
};

exports.logoYukle = async (req, res) => {
  if (!req.file) return res.status(400).json({ basari: false, mesaj: 'Dosya yüklenmedi' });

  const ayarlar = await Ayarlar.findOneAndUpdate(
    {},
    { $set: { logoYolu: req.file.filename } },
    { new: true, upsert: true }
  );
  res.json({ basari: true, logoYolu: req.file.filename, ayarlar });
};
