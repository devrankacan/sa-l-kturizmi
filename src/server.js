require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('../config/database');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/hastalar', require('./routes/hasta'));
app.use('/api/teklifler', require('./routes/teklif'));
app.use('/api/randevular', require('./routes/randevu'));
app.use('/api/transferler', require('./routes/transfer'));
app.use('/api/konaklamalar', require('./routes/konaklama'));
app.use('/api/crm', require('./routes/crm'));
app.use('/api/tedaviler', require('./routes/tedavi'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    basari: true,
    mesaj: 'Sağlık Turizmi API çalışıyor',
    versiyon: '1.0.0',
    zaman: new Date().toISOString()
  });
});

// 404
app.use('*', (req, res) => {
  res.status(404).json({ basari: false, mesaj: 'Endpoint bulunamadı' });
});

app.use(errorHandler);

const PORT = process.env.PORT || 3000;

const baslat = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Sunucu ${PORT} portunda çalışıyor`);
    console.log(`Ortam: ${process.env.NODE_ENV || 'development'}`);
  });
};

baslat();

module.exports = app;
