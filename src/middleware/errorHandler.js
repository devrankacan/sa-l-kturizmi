const errorHandler = (err, req, res, next) => {
  let hata = { ...err };
  hata.mesaj = err.message;

  console.error(err);

  // Mongoose geçersiz ObjectId
  if (err.name === 'CastError') {
    hata.mesaj = 'Kaynak bulunamadı';
    return res.status(404).json({ basari: false, mesaj: hata.mesaj });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const alan = Object.keys(err.keyValue)[0];
    hata.mesaj = `Bu ${alan} zaten kayıtlı`;
    return res.status(400).json({ basari: false, mesaj: hata.mesaj });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    hata.mesaj = Object.values(err.errors).map(e => e.message).join(', ');
    return res.status(400).json({ basari: false, mesaj: hata.mesaj });
  }

  res.status(err.statusCode || 500).json({
    basari: false,
    mesaj: hata.mesaj || 'Sunucu hatası'
  });
};

module.exports = errorHandler;
