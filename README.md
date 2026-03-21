# Sağlık Turizmi Otomasyon Platformu

Tam entegre sağlık turizmi yönetim sistemi. Hasta başvurusundan tedaviye, transferden konaklamaya kadar tüm süreci kapsayan REST API.

## Özellikler

- **Hasta Yönetimi** - Profil, tıbbi bilgiler, belge yükleme, not sistemi
- **CRM** - Lead takibi, aktivite kaydı, bekleyen görevler, dönüşüm oranları
- **Teklif & Fiyatlandırma** - Otomatik hesaplama, çoklu tedavi, indirim
- **Randevu & Tedavi** - Doktor/klinik/hastane yönetimi, takip randevuları
- **Transfer** - Havalimanı karşılama, hastane transferi, VIP araç
- **Konaklama** - Otel rezervasyonu, oda yönetimi, check-in/out takibi
- **Dashboard** - İstatistikler, gelir analizi, aylık büyüme

## Kurulum

```bash
# Bağımlılıkları yükle
npm install

# .env dosyasını oluştur
cp .env.example .env
# .env içindeki değerleri düzenle

# Başlangıç verilerini yükle
npm run seed

# Geliştirme modunda başlat
npm run dev

# Üretimde başlat
npm start
```

## API Endpointleri

### Auth
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| POST | `/api/auth/giris` | Giriş yap |
| POST | `/api/auth/kayit` | Kullanıcı ekle (admin) |
| GET | `/api/auth/profil` | Profil görüntüle |
| PUT | `/api/auth/sifre-degistir` | Şifre değiştir |

### Hastalar
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | `/api/hastalar` | Liste (filtre: durum, ulke, ara) |
| POST | `/api/hastalar` | Yeni hasta ekle |
| GET | `/api/hastalar/:id` | Hasta detayı |
| PUT | `/api/hastalar/:id` | Güncelle |
| POST | `/api/hastalar/:id/not` | Not ekle |
| POST | `/api/hastalar/:id/belge` | Belge yükle |
| GET | `/api/hastalar/istatistikler` | İstatistikler |

### Teklifler
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | `/api/teklifler` | Liste |
| POST | `/api/teklifler` | Yeni teklif |
| GET | `/api/teklifler/:id` | Detay |
| POST | `/api/teklifler/hesapla` | Otomatik hesapla |
| PATCH | `/api/teklifler/:id/durum` | Durum güncelle |

### Randevular
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | `/api/randevular/bugun` | Bugünkü randevular |
| GET | `/api/randevular` | Liste (filtre: hasta, doktor, tarih) |
| POST | `/api/randevular` | Yeni randevu |
| POST | `/api/randevular/:id/takip` | Takip randevusu ekle |

### Transfer & Konaklama
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET/POST | `/api/transferler` | Transfer listesi/oluştur |
| GET/POST | `/api/konaklamalar` | Konaklama listesi/oluştur |
| GET | `/api/konaklamalar/bugun-cikis` | Bugün çıkış yapacaklar |

### CRM
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | `/api/crm/lead-ozeti` | Lead özeti |
| GET | `/api/crm/istatistikler` | Gelir & tedavi istatistikleri |
| GET | `/api/crm/bekleyen-gorevler` | Bekleyen görevler |
| POST | `/api/crm/aktivite` | Aktivite kaydet |

## Roller

- **admin** - Tüm yetkiler
- **koordinator** - Hasta ve süreç yönetimi
- **doktor** - Randevu ve tedavi görünümü

## Varsayılan Kullanıcılar (seed sonrası)

| Rol | Email | Şifre |
|-----|-------|-------|
| Admin | admin@saglik.com | Admin123! |
| Koordinatör | koordinator@saglik.com | Koord123! |
| Doktor | doktor@saglik.com | Doktor123! |
