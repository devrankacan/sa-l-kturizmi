const express = require('express');
const router = express.Router();
const {
  aktiviteOlustur, hasstaAktiviteleri, bekleyenGorevler,
  aktiviteTamamla, leadOzeti, tedaviIstatistikler
} = require('../controllers/crmController');
const { korunanRota } = require('../middleware/auth');

router.use(korunanRota);
router.get('/lead-ozeti', leadOzeti);
router.get('/istatistikler', tedaviIstatistikler);
router.get('/bekleyen-gorevler', bekleyenGorevler);
router.post('/aktivite', aktiviteOlustur);
router.get('/hasta/:hastaId', hasstaAktiviteleri);
router.patch('/aktivite/:id/tamamla', aktiviteTamamla);

module.exports = router;
