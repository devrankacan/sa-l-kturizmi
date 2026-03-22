const mongoose = require('mongoose');

const AyarlarSchema = new mongoose.Schema({
  firmaAdi: { type: String, default: 'Sağlık Turizmi' },
  slogan: { type: String, default: '' },
  logoYolu: { type: String, default: '' },
  telefon: { type: String, default: '' },
  email: { type: String, default: '' },
  adres: { type: String, default: '' },
  webSitesi: { type: String, default: '' },
  primaryRenk: { type: String, default: '#3b82f6' },
  sosyalMedya: {
    instagram: { type: String, default: '' },
    facebook: { type: String, default: '' },
    twitter: { type: String, default: '' },
    youtube: { type: String, default: '' }
  },
  whatsapp: {
    aiAdi: { type: String, default: 'Sağlık Turizmi Asistanı' },
    karsilamaMesaji: { type: String, default: '' },
    aktif: { type: Boolean, default: true }
  }
}, { timestamps: true });

// Singleton: koleksiyonda sadece bir belge olur
AyarlarSchema.statics.getir = async function () {
  let ayarlar = await this.findOne();
  if (!ayarlar) ayarlar = await this.create({});
  return ayarlar;
};

module.exports = mongoose.model('Ayarlar', AyarlarSchema);
