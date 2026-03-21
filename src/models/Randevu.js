const mongoose = require('mongoose');

const RandevuSchema = new mongoose.Schema({
  hasta: { type: mongoose.Schema.Types.ObjectId, ref: 'Hasta', required: true },
  doktor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  doktorAdi: String,
  tedavi: { type: mongoose.Schema.Types.ObjectId, ref: 'Tedavi' },
  tedaviAdi: String,
  hastane: String,
  klinik: String,

  tarih: { type: Date, required: true },
  sure: { type: Number, default: 60 }, // dakika

  durum: {
    type: String,
    enum: ['planlandı', 'onaylandi', 'tamamlandi', 'iptal', 'ertelendi'],
    default: 'planlandı'
  },

  notlar: String,
  ameliyatNotlari: String,
  sonuc: String,

  takipRandevulari: [{
    tarih: Date,
    aciklama: String,
    tamamlandi: { type: Boolean, default: false }
  }],

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Randevu', RandevuSchema);
