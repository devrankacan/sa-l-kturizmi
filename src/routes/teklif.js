const express = require('express');
const router = express.Router();
const {
  teklifOlustur, teklifleriGetir, teklifGetir,
  teklifGuncelle, teklifDurumGuncelle, otomatikTeklifHesapla
} = require('../controllers/teklifController');
const { korunanRota } = require('../middleware/auth');

router.use(korunanRota);

router.post('/hesapla', otomatikTeklifHesapla);
router.route('/').get(teklifleriGetir).post(teklifOlustur);
router.route('/:id').get(teklifGetir).put(teklifGuncelle);
router.patch('/:id/durum', teklifDurumGuncelle);

module.exports = router;
