const express = require('express');
const router = express.Router();
const { webhookDogrula, webhookAl, konusmalariGetir } = require('../controllers/whatsappController');
const { korunanRota } = require('../middleware/auth');

// Meta webhook doğrulama ve mesaj alma (auth yok - Meta doğrudan çağırır)
router.get('/webhook', webhookDogrula);
router.post('/webhook', webhookAl);

// Konuşma listesi (korumalı)
router.get('/konusmalar', korunanRota, konusmalariGetir);

module.exports = router;
