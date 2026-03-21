const express = require('express');
const router = express.Router();
const {
  randevuOlustur, randevulariGetir, randevuGetir,
  randevuGuncelle, bugunRandevular, takipEkle
} = require('../controllers/randevuController');
const { korunanRota } = require('../middleware/auth');

router.use(korunanRota);

router.get('/bugun', bugunRandevular);
router.route('/').get(randevulariGetir).post(randevuOlustur);
router.route('/:id').get(randevuGetir).put(randevuGuncelle);
router.post('/:id/takip', takipEkle);

module.exports = router;
