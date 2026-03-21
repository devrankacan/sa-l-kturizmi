const express = require('express');
const router = express.Router();
const {
  hastaOlustur, hastalariGetir, hastaGetir, hastaGuncelle,
  hastaSil, notEkle, belgeYukle, istatistikler
} = require('../controllers/hastaController');
const { korunanRota, yetkiKontrol } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(korunanRota);

router.get('/istatistikler', istatistikler);
router.route('/').get(hastalariGetir).post(hastaOlustur);
router.route('/:id').get(hastaGetir).put(hastaGuncelle).delete(yetkiKontrol('admin'), hastaSil);
router.post('/:id/not', notEkle);
router.post('/:id/belge', upload.single('dosya'), belgeYukle);

module.exports = router;
