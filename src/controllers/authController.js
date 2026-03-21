const User = require('../models/User');

const tokenGonder = (kullanici, statusCode, res) => {
  const token = kullanici.tokenOlustur();
  res.status(statusCode).json({
    basari: true,
    token,
    kullanici: {
      id: kullanici._id,
      ad: kullanici.ad,
      soyad: kullanici.soyad,
      email: kullanici.email,
      rol: kullanici.rol
    }
  });
};

exports.girisYap = async (req, res, next) => {
  const { email, sifre } = req.body;

  if (!email || !sifre) {
    return res.status(400).json({ basari: false, mesaj: 'Email ve şifre gerekli' });
  }

  const kullanici = await User.findOne({ email }).select('+sifre');
  if (!kullanici || !(await kullanici.sifreKontrol(sifre))) {
    return res.status(401).json({ basari: false, mesaj: 'Geçersiz email veya şifre' });
  }

  kullanici.sonGiris = Date.now();
  await kullanici.save({ validateBeforeSave: false });

  tokenGonder(kullanici, 200, res);
};

exports.kayitOl = async (req, res, next) => {
  const { ad, soyad, email, sifre, rol, telefon } = req.body;
  const kullanici = await User.create({ ad, soyad, email, sifre, rol, telefon });
  tokenGonder(kullanici, 201, res);
};

exports.profilGetir = async (req, res) => {
  res.status(200).json({ basari: true, kullanici: req.kullanici });
};

exports.sifreDegistir = async (req, res) => {
  const { eskiSifre, yeniSifre } = req.body;
  const kullanici = await User.findById(req.kullanici._id).select('+sifre');

  if (!(await kullanici.sifreKontrol(eskiSifre))) {
    return res.status(401).json({ basari: false, mesaj: 'Mevcut şifre yanlış' });
  }

  kullanici.sifre = yeniSifre;
  await kullanici.save();
  tokenGonder(kullanici, 200, res);
};

exports.kullanicilariGetir = async (req, res) => {
  const kullanicilar = await User.find().select('-sifre');
  res.status(200).json({ basari: true, sayi: kullanicilar.length, kullanicilar });
};
