const mongoose = require('mongoose');

const TedaviSchema = new mongoose.Schema({
  kategori: {
    type: String,
    enum: ['dis', 'estetik', 'goz', 'ortopedi', 'kardiyoloji', 'onkoloji', 'baris', 'diger'],
    required: true
  },
  ad: { type: String, required: true },
  aciklama: String,
  suresi: String,
  hastaneSuresi: String,
  baz_fiyat: { type: Number, required: true },
  para_birimi: { type: String, default: 'USD' },
  aktif: { type: Boolean, default: true }
});

module.exports = mongoose.model('Tedavi', TedaviSchema);
