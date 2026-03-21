const mongoose = require('mongoose');

const CrmAktiviteSchema = new mongoose.Schema({
  hasta: { type: mongoose.Schema.Types.ObjectId, ref: 'Hasta', required: true },
  kullanici: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  tip: {
    type: String,
    enum: ['arama', 'email', 'whatsapp', 'gorusme', 'not', 'gorev', 'hatirlatma'],
    required: true
  },
  yon: { type: String, enum: ['gelen', 'giden'] },

  baslik: { type: String, required: true },
  aciklama: String,

  sonuc: String,
  sonrakiAdim: String,
  sonrakiAdimTarihi: Date,

  tamamlandi: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CrmAktivite', CrmAktiviteSchema);
