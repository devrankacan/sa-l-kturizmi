const mongoose = require('mongoose');

const BelgeSchema = new mongoose.Schema({
  tip: { type: String, enum: ['pasaport', 'kimlik', 'tibbi_rapor', 'sigorta', 'diger'] },
  dosyaAdi: String,
  dosyaYolu: String,
  yuklenmeTarihi: { type: Date, default: Date.now }
});

const HastaSchema = new mongoose.Schema({
  hastaNo: { type: String, unique: true },
  ad: { type: String, required: true, trim: true },
  soyad: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true },
  telefon: { type: String, required: true },
  whatsapp: String,
  ulke: { type: String, required: true },
  sehir: String,
  dogumTarihi: Date,
  cinsiyet: { type: String, enum: ['erkek', 'kadin', 'belirtilmemis'] },
  uyruk: String,
  pasaportNo: String,
  dil: { type: String, default: 'tr' },

  tibbiBilgiler: {
    boy: Number,
    kilo: Number,
    kanGrubu: String,
    kronikHastaliklar: [String],
    alerjiler: [String],
    kullanilanIlaclar: [String],
    oncekiAmeliyatlar: [String]
  },

  belgeler: [BelgeSchema],

  referans: {
    kaynak: { type: String, enum: ['web', 'sosyal_medya', 'doktor', 'hasta', 'ajans', 'diger'] },
    detay: String
  },

  durum: {
    type: String,
    enum: ['potansiyel', 'aktif', 'tedavi_sureci', 'tamamlandi', 'iptal'],
    default: 'potansiyel'
  },

  atananKoordinator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notlar: [{ metin: String, tarih: { type: Date, default: Date.now }, kullanici: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } }],

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

HastaSchema.pre('save', async function (next) {
  if (!this.hastaNo) {
    const yil = new Date().getFullYear();
    const sayac = await mongoose.model('Hasta').countDocuments();
    this.hastaNo = `HT${yil}${String(sayac + 1).padStart(5, '0')}`;
  }
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Hasta', HastaSchema);
