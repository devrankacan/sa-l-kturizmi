const express = require('express');
const router = express.Router();
const {
  tedaviOlustur, tedavileriGetir, tedaviGetir, tedaviGuncelle, kategoriler
} = require('../controllers/tedaviController');
const { korunanRota, yetkiKontrol } = require('../middleware/auth');

router.use(korunanRota);
router.get('/kategoriler', kategoriler);
router.route('/').get(tedavileriGetir).post(yetkiKontrol('admin'), tedaviOlustur);
router.route('/:id').get(tedaviGetir).put(yetkiKontrol('admin'), tedaviGuncelle);

module.exports = router;
