const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  ad: { type: String, required: true, trim: true },
  soyad: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  sifre: { type: String, required: true, minlength: 6, select: false },
  rol: {
    type: String,
    enum: ['admin', 'koordinator', 'doktor', 'hasta'],
    default: 'koordinator'
  },
  telefon: String,
  aktif: { type: Boolean, default: true },
  sonGiris: Date,
  createdAt: { type: Date, default: Date.now }
});

UserSchema.pre('save', async function (next) {
  if (!this.isModified('sifre')) return next();
  this.sifre = await bcrypt.hash(this.sifre, 10);
  next();
});

UserSchema.methods.sifreKontrol = async function (girilenSifre) {
  return await bcrypt.compare(girilenSifre, this.sifre);
};

UserSchema.methods.tokenOlustur = function () {
  return jwt.sign({ id: this._id, rol: this.rol }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

module.exports = mongoose.model('User', UserSchema);
