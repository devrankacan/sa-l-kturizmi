const mongoose = require('mongoose');

const MesajSchema = new mongoose.Schema({
  yon: { type: String, enum: ['gelen', 'giden'], required: true },
  metin: { type: String, required: true },
  tarih: { type: Date, default: Date.now }
});

const WhatsappKonusmaSchema = new mongoose.Schema({
  telefon: { type: String, required: true, unique: true },
  mesajlar: [MesajSchema],
  toplamVeri: { type: mongoose.Schema.Types.Mixed, default: {} },
  durum: {
    type: String,
    enum: ['devam_ediyor', 'hasta_olusturuldu', 'kapandi'],
    default: 'devam_ediyor'
  },
  hastaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hasta' }
}, { timestamps: true });

module.exports = mongoose.model('WhatsappKonusma', WhatsappKonusmaSchema);
