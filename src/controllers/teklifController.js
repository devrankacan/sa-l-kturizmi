const Teklif = require('../models/Teklif');
const Tedavi = require('../models/Tedavi');

exports.teklifOlustur = async (req, res) => {
  const teklif = await Teklif.create({ ...req.body, olusturan: req.kullanici._id });
  await teklif.populate('hasta', 'ad soyad email hastaNo');
  res.status(201).json({ basari: true, teklif });
};

exports.teklifleriGetir = async (req, res) => {
  const filtre = {};
  if (req.query.hasta) filtre.hasta = req.query.hasta;
  if (req.query.durum) filtre.durum = req.query.durum;

  const teklifler = await Teklif.find(filtre)
    .populate('hasta', 'ad soyad email hastaNo ulke')
    .populate('olusturan', 'ad soyad')
    .sort({ createdAt: -1 });

  res.status(200).json({ basari: true, sayi: teklifler.length, teklifler });
};

exports.teklifGetir = async (req, res) => {
  const teklif = await Teklif.findById(req.params.id)
    .populate('hasta', 'ad soyad email hastaNo ulke telefon')
    .populate('olusturan', 'ad soyad email')
    .populate('kalemler.tedavi', 'ad kategori');

  if (!teklif) return res.status(404).json({ basari: false, mesaj: 'Teklif bulunamadı' });
  res.status(200).json({ basari: true, teklif });
};

exports.teklifGuncelle = async (req, res) => {
  const teklif = await Teklif.findByIdAndUpdate(req.params.id, req.body, {
    new: true, runValidators: true
  }).populate('hasta', 'ad soyad email hastaNo');

  if (!teklif) return res.status(404).json({ basari: false, mesaj: 'Teklif bulunamadı' });
  res.status(200).json({ basari: true, teklif });
};

exports.teklifDurumGuncelle = async (req, res) => {
  const { durum } = req.body;
  const teklif = await Teklif.findByIdAndUpdate(
    req.params.id,
    { durum },
    { new: true }
  ).populate('hasta', 'ad soyad email hastaNo');

  if (!teklif) return res.status(404).json({ basari: false, mesaj: 'Teklif bulunamadı' });
  res.status(200).json({ basari: true, teklif });
};

exports.otomatikTeklifHesapla = async (req, res) => {
  const { tedaviIds } = req.body;
  const tedaviler = await Tedavi.find({ _id: { $in: tedaviIds }, aktif: true });

  const kalemler = tedaviler.map(t => ({
    tedavi: t._id,
    tedaviAdi: t.ad,
    miktar: 1,
    birimFiyat: t.baz_fiyat,
    indirim: 0,
    toplam: t.baz_fiyat
  }));

  const araToplam = kalemler.reduce((sum, k) => sum + k.toplam, 0);

  res.status(200).json({
    basari: true,
    hesaplama: {
      kalemler,
      araToplam,
      genelToplam: araToplam,
      paraBirimi: tedaviler[0]?.para_birimi || 'USD'
    }
  });
};
