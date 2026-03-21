const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.UPLOAD_PATH || './uploads');
  },
  filename: (req, file, cb) => {
    const uzanti = path.extname(file.originalname);
    cb(null, `${uuidv4()}${uzanti}`);
  }
});

const dosyaFiltresi = (req, file, cb) => {
  const izinliTipler = /jpeg|jpg|png|pdf|doc|docx/;
  const uzanti = izinliTipler.test(path.extname(file.originalname).toLowerCase());
  const mimeType = izinliTipler.test(file.mimetype);
  if (uzanti && mimeType) {
    cb(null, true);
  } else {
    cb(new Error('Sadece JPEG, PNG, PDF, DOC dosyaları yüklenebilir'));
  }
};

const upload = multer({
  storage,
  fileFilter: dosyaFiltresi,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760 }
});

module.exports = upload;
