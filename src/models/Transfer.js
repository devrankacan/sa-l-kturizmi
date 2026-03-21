const mongoose = require('mongoose');

const TransferSchema = new mongoose.Schema({
  hasta: { type: mongoose.Schema.Types.ObjectId, ref: 'Hasta', required: true },

  tip: { type: String, enum: ['havaalani_karsılama', 'hastane_transfer', 'otel_transfer', 'sehir_ici', 'vip'] },
  donus: { type: Boolean, default: false },

  kalkis: {
    yer: String,
    tarih: Date,
    ucusNo: String
  },
  varis: {
    yer: String,
    tahminiSaat: Date
  },

  arac: {
    tip: { type: String, enum: ['sedan', 'van', 'vip', 'ambulans'] },
    kapasite: Number,
    surucu: String,
    plaka: String
  },

  ucret: Number,
  paraBirimi: { type: String, default: 'USD' },
  dahilMi: { type: Boolean, default: false },

  durum: {
    type: String,
    enum: ['planlandı', 'onaylandi', 'yolda', 'tamamlandi', 'iptal'],
    default: 'planlandı'
  },

  notlar: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transfer', TransferSchema);
