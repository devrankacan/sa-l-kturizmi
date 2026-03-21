const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.korunanRota = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ basari: false, mesaj: 'Bu rotaya erişim için giriş yapmalısınız' });
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.kullanici = await User.findById(decoded.id);

  if (!req.kullanici || !req.kullanici.aktif) {
    return res.status(401).json({ basari: false, mesaj: 'Kullanıcı bulunamadı veya hesap devre dışı' });
  }

  next();
};

exports.yetkiKontrol = (...roller) => {
  return (req, res, next) => {
    if (!roller.includes(req.kullanici.rol)) {
      return res.status(403).json({
        basari: false,
        mesaj: `${req.kullanici.rol} rolü bu işlem için yetkili değil`
      });
    }
    next();
  };
};
