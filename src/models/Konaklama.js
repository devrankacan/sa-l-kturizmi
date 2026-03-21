const mongoose = require('mongoose');

const KonaklamaSchema = new mongoose.Schema({
  hasta: { type: mongoose.Schema.Types.ObjectId, ref: 'Hasta', required: true },

  otel: {
    ad: { type: String, required: true },
    adres: String,
    yildiz: Number,
    telefon: String,
    reservasyonNo: String
  },

  oda: {
    tip: { type: String, enum: ['standart', 'superior', 'suite', 'apart'] },
    numara: String,
    kisiSayisi: { type: Number, default: 1 }
  },

  girisTarihi: { type: Date, required: true },
  cikisTarihi: { type: Date, required: true },
  geceSayisi: Number,

  gecelikUcret: Number,
  toplamUcret: Number,
  paraBirimi: { type: String, default: 'USD' },
  dahilMi: { type: Boolean, default: false },

  durum: {
    type: String,
    enum: ['beklemede', 'rezerve', 'giriş_yapildi', 'cikis_yapildi', 'iptal'],
    default: 'beklemede'
  },

  ozelIstekler: String,
  notlar: String,
  createdAt: { type: Date, default: Date.now }
});

KonaklamaSchema.pre('save', function (next) {
  if (this.girisTarihi && this.cikisTarihi) {
    const diff = this.cikisTarihi - this.girisTarihi;
    this.geceSayisi = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (this.gecelikUcret) {
      this.toplamUcret = this.geceSayisi * this.gecelikUcret;
    }
  }
  next();
});

module.exports = mongoose.model('Konaklama', KonaklamaSchema);
