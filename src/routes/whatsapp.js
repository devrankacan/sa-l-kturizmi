const express = require('express');
const router = express.Router();
const { webhookDogrula, webhookAl, konusmalariGetir, konusmaGetir, koordinatorMesajGonder } = require('../controllers/whatsappController');
const { korunanRota } = require('../middleware/auth');

// Meta webhook doğrulama ve mesaj alma (auth yok - Meta doğrudan çağırır)
router.get('/webhook', webhookDogrula);
router.post('/webhook', webhookAl);

// Konuşma listesi ve detay (korumalı)
router.get('/konusmalar', korunanRota, konusmalariGetir);
router.get('/konusmalar/:id', korunanRota, konusmaGetir);
router.post('/konusmalar/:id/mesaj', korunanRota, koordinatorMesajGonder);

module.exports = router;
