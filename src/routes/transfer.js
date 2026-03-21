const express = require('express');
const router = express.Router();
const { transferOlustur, transferleriGetir, transferGetir, transferGuncelle } = require('../controllers/transferController');
const { korunanRota } = require('../middleware/auth');

router.use(korunanRota);
router.route('/').get(transferleriGetir).post(transferOlustur);
router.route('/:id').get(transferGetir).put(transferGuncelle);

module.exports = router;
