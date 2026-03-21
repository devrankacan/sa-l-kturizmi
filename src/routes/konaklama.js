const express = require('express');
const router = express.Router();
const {
  konaklamaOlustur, konaklamilariGetir, konaklamaGetir,
  konaklamaGuncelle, bugunCikislar
} = require('../controllers/konaklamaController');
const { korunanRota } = require('../middleware/auth');

router.use(korunanRota);
router.get('/bugun-cikis', bugunCikislar);
router.route('/').get(konaklamilariGetir).post(konaklamaOlustur);
router.route('/:id').get(konaklamaGetir).put(konaklamaGuncelle);

module.exports = router;
