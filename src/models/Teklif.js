const mongoose = require('mongoose');

const TeklifKalemiSchema = new mongoose.Schema({
  tedavi: { type: mongoose.Schema.Types.ObjectId, ref: 'Tedavi' },
  tedaviAdi: String,
  miktar: { type: Number, default: 1 },
  birimFiyat: Number,
  indirim: { type: Number, default: 0 },
  toplam: Number
});

const TeklifSchema = new mongoose.Schema({
  teklifNo: { type: String, unique: true },
  hasta: { type: mongoose.Schema.Types.ObjectId, ref: 'Hasta', required: true },
  olusturan: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  kalemler: [TeklifKalemiSchema],

  araToplam: Number,
  toplamIndirim: { type: Number, default: 0 },
  genelToplam: Number,
  paraBirimi: { type: String, default: 'USD' },

  dahilHizmetler: [String],
  haricHizmetler: [String],

  gecerlilikTarihi: Date,

  durum: {
    type: String,
    enum: ['taslak', 'gonderildi', 'inceleniyor', 'onaylandi', 'reddedildi', 'revize'],
    default: 'taslak'
  },

  notlar: String,
  hastaNotlari: String,

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

TeklifSchema.pre('save', async function (next) {
  if (!this.teklifNo) {
    const yil = new Date().getFullYear();
    const ay = String(new Date().getMonth() + 1).padStart(2, '0');
    const sayac = await mongoose.model('Teklif').countDocuments();
    this.teklifNo = `TKL${yil}${ay}${String(sayac + 1).padStart(4, '0')}`;
  }

  // Toplamları hesapla
  if (this.kalemler && this.kalemler.length) {
    this.araToplam = this.kalemler.reduce((sum, k) => {
      k.toplam = k.birimFiyat * k.miktar * (1 - (k.indirim || 0) / 100);
      return sum + k.toplam;
    }, 0);
    this.toplamIndirim = this.kalemler.reduce((sum, k) => {
      return sum + (k.birimFiyat * k.miktar * ((k.indirim || 0) / 100));
    }, 0);
    this.genelToplam = this.araToplam;
  }

  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Teklif', TeklifSchema);
