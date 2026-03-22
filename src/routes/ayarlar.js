const express = require('express');
const router = express.Router();
const { ayarlariGetir, ayarlariGuncelle, logoYukle } = require('../controllers/ayarlarController');
const { korunanRota, yetkiKontrol } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(korunanRota);

router.get('/', ayarlariGetir);
router.put('/', yetkiKontrol('admin'), ayarlariGuncelle);
router.post('/logo', yetkiKontrol('admin'), upload.single('logo'), logoYukle);

module.exports = router;
