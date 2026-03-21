const express = require('express');
const router = express.Router();
const { girisYap, kayitOl, profilGetir, sifreDegistir, kullanicilariGetir } = require('../controllers/authController');
const { korunanRota, yetkiKontrol } = require('../middleware/auth');

router.post('/giris', girisYap);
router.post('/kayit', korunanRota, yetkiKontrol('admin'), kayitOl);
router.get('/profil', korunanRota, profilGetir);
router.put('/sifre-degistir', korunanRota, sifreDegistir);
router.get('/kullanicilar', korunanRota, yetkiKontrol('admin'), kullanicilariGetir);

module.exports = router;
