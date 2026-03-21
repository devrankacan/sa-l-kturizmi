const CrmAktivite = require('../models/CrmAktivite');
const Hasta = require('../models/Hasta');

exports.aktiviteOlustur = async (req, res) => {
  const aktivite = await CrmAktivite.create({
    ...req.body,
    kullanici: req.kullanici._id
  });
  await aktivite.populate('kullanici', 'ad soyad');
  res.status(201).json({ basari: true, aktivite });
};

exports.hasstaAktiviteleri = async (req, res) => {
  const aktiviteler = await CrmAktivite.find({ hasta: req.params.hastaId })
    .populate('kullanici', 'ad soyad')
    .sort({ createdAt: -1 });

  res.status(200).json({ basari: true, sayi: aktiviteler.length, aktiviteler });
};

exports.bekleyenGorevler = async (req, res) => {
  const gorevler = await CrmAktivite.find({
    tamamlandi: false,
    tip: { $in: ['gorev', 'hatirlatma'] },
    kullanici: req.query.hepsi === 'true' ? undefined : req.kullanici._id
  })
    .populate('hasta', 'ad soyad hastaNo')
    .populate('kullanici', 'ad soyad')
    .sort({ sonrakiAdimTarihi: 1 });

  res.status(200).json({ basari: true, sayi: gorevler.length, gorevler });
};

exports.aktiviteTamamla = async (req, res) => {
  const aktivite = await CrmAktivite.findByIdAndUpdate(
    req.params.id,
    { tamamlandi: true },
    { new: true }
  );

  if (!aktivite) return res.status(404).json({ basari: false, mesaj: 'Aktivite bulunamadı' });
  res.status(200).json({ basari: true, aktivite });
};

exports.leadOzeti = async (req, res) => {
  const [potansiyel, aktif, buAyYeni, donusumOrani] = await Promise.all([
    Hasta.countDocuments({ durum: 'potansiyel' }),
    Hasta.countDocuments({ durum: 'aktif' }),
    Hasta.countDocuments({
      createdAt: {
        $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      }
    }),
    Hasta.aggregate([
      {
        $group: {
          _id: null,
          toplam: { $sum: 1 },
          aktif: { $sum: { $cond: [{ $in: ['$durum', ['aktif', 'tedavi_sureci', 'tamamlandi']] }, 1, 0] } }
        }
      }
    ])
  ]);

  const oran = donusumOrani[0]
    ? ((donusumOrani[0].aktif / donusumOrani[0].toplam) * 100).toFixed(1)
    : 0;

  res.status(200).json({
    basari: true,
    ozet: { potansiyel, aktif, buAyYeni, donusumOrani: `%${oran}` }
  });
};

exports.tedaviIstatistikler = async (req, res) => {
  const Teklif = require('../models/Teklif');
  const Randevu = require('../models/Randevu');

  const [teklifler, randevular, gelirOzeti] = await Promise.all([
    Teklif.aggregate([
      { $group: { _id: '$durum', sayi: { $sum: 1 }, toplam: { $sum: '$genelToplam' } } }
    ]),
    Randevu.aggregate([
      { $group: { _id: '$durum', sayi: { $sum: 1 } } }
    ]),
    Teklif.aggregate([
      { $match: { durum: 'onaylandi' } },
      {
        $group: {
          _id: { yil: { $year: '$createdAt' }, ay: { $month: '$createdAt' } },
          gelir: { $sum: '$genelToplam' }
        }
      },
      { $sort: { '_id.yil': -1, '_id.ay': -1 } },
      { $limit: 12 }
    ])
  ]);

  res.status(200).json({ basari: true, istatistikler: { teklifler, randevular, gelirOzeti } });
};
