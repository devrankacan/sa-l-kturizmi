require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Tedavi = require('../models/Tedavi');

const tedaviVerileri = [
  { kategori: 'dis', ad: 'Diş İmplant', aciklama: 'Tek diş implant uygulaması', suresi: '2-3 saat', baz_fiyat: 800, para_birimi: 'USD' },
  { kategori: 'dis', ad: 'Zirkonyum Kaplama (Full Ağız)', aciklama: '20 diş zirkonyum kaplama', suresi: '5-7 gün', baz_fiyat: 2500, para_birimi: 'USD' },
  { kategori: 'dis', ad: 'Hollywood Smile', aciklama: 'Komple gülüş tasarımı', suresi: '5-7 gün', baz_fiyat: 3000, para_birimi: 'USD' },
  { kategori: 'estetik', ad: 'Gastrik Sleeve (Tüp Mide)', aciklama: 'Laparoskopik tüp mide ameliyatı', suresi: '3-4 gün', hastaneSuresi: '2 gece', baz_fiyat: 3500, para_birimi: 'USD' },
  { kategori: 'estetik', ad: 'Saç Ekimi (FUE)', aciklama: 'Follicular Unit Extraction yöntemi', suresi: '6-8 saat', baz_fiyat: 1500, para_birimi: 'USD' },
  { kategori: 'estetik', ad: 'Rinoplasti', aciklama: 'Burun estetiği ameliyatı', suresi: '2-3 saat', hastaneSuresi: '1 gece', baz_fiyat: 2500, para_birimi: 'USD' },
  { kategori: 'estetik', ad: 'Meme Büyütme', aciklama: 'Silikon implant ile meme büyütme', suresi: '1-2 saat', hastaneSuresi: '1 gece', baz_fiyat: 2800, para_birimi: 'USD' },
  { kategori: 'goz', ad: 'Lasik Göz Ameliyatı', aciklama: 'Her iki göz lazer tedavisi', suresi: '30 dakika', baz_fiyat: 1200, para_birimi: 'USD' },
  { kategori: 'ortopedi', ad: 'Diz Protezi (Tek)', aciklama: 'Tek taraflı diz protezi', suresi: '2 saat', hastaneSuresi: '3-5 gece', baz_fiyat: 6000, para_birimi: 'USD' },
  { kategori: 'ortopedi', ad: 'Kalça Protezi', aciklama: 'Toplam kalça değiştirme', suresi: '2 saat', hastaneSuresi: '3-5 gece', baz_fiyat: 7000, para_birimi: 'USD' }
];

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB bağlandı');

  await User.deleteMany({});
  await Tedavi.deleteMany({});

  await User.create([
    { ad: 'Admin', soyad: 'Kullanıcı', email: 'admin@saglik.com', sifre: 'Admin123!', rol: 'admin', telefon: '+905001234567' },
    { ad: 'Mehmet', soyad: 'Yılmaz', email: 'koordinator@saglik.com', sifre: 'Koord123!', rol: 'koordinator', telefon: '+905001234568' },
    { ad: 'Dr. Ayşe', soyad: 'Kaya', email: 'doktor@saglik.com', sifre: 'Doktor123!', rol: 'doktor', telefon: '+905001234569' }
  ]);

  await Tedavi.insertMany(tedaviVerileri);

  console.log('Seed tamamlandı!');
  console.log('Admin: admin@saglik.com / Admin123!');
  console.log('Koordinatör: koordinator@saglik.com / Koord123!');
  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });
