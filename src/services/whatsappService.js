const axios = require('axios');

const API_URL = `https://graph.facebook.com/v19.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;

const headers = () => ({
  'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
  'Content-Type': 'application/json'
});

exports.mesajGonder = async (telefon, metin) => {
  try {
    const res = await axios.post(API_URL, {
      messaging_product: 'whatsapp',
      to: telefon,
      type: 'text',
      text: { body: metin }
    }, { headers: headers() });
    return res.data;
  } catch (err) {
    console.error('[WhatsApp] Mesaj gönderilemedi:', err.response?.data || err.message);
    throw err;
  }
};

exports.okunduIsaretle = async (mesajId) => {
  try {
    await axios.post(API_URL.replace('/messages', '/messages'), {
      messaging_product: 'whatsapp',
      status: 'read',
      message_id: mesajId
    }, { headers: headers() });
  } catch {
    // Sessizce geç
  }
};
