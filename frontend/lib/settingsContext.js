import { createContext, useContext, useEffect, useState } from 'react';
import api from './api';

const SettingsContext = createContext(null);

const VARSAYILAN = {
  firmaAdi: 'Sağlık Turizmi',
  slogan: '',
  logoYolu: '',
  primaryRenk: '#3b82f6',
  sosyalMedya: {},
  whatsapp: { aiAdi: 'Sağlık Turizmi Asistanı', aktif: true }
};

// Arka plan rengine göre yazı rengi (koyu/açık kontrast)
function kontrastRenk(hex) {
  try {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const luminans = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminans > 0.55 ? '#1f2937' : '#ffffff';
  } catch {
    return '#ffffff';
  }
}

// Rengi koyulaştır (hover için)
function koyulaştir(hex, miktar = 30) {
  try {
    const r = Math.max(0, parseInt(hex.slice(1, 3), 16) - miktar);
    const g = Math.max(0, parseInt(hex.slice(3, 5), 16) - miktar);
    const b = Math.max(0, parseInt(hex.slice(5, 7), 16) - miktar);
    return `rgb(${r}, ${g}, ${b})`;
  } catch {
    return '#2563eb';
  }
}

// Rengi açık tona çevir (arka plan aksan için)
function acikTon(hex, opaklık = '15') {
  return hex + opaklık;
}

export function SettingsProvider({ children }) {
  const [ayarlar, setAyarlar] = useState(VARSAYILAN);

  useEffect(() => {
    api.get('/ayarlar')
      .then(res => setAyarlar({ ...VARSAYILAN, ...res.data.ayarlar }))
      .catch(() => {});
  }, []);

  const renk = ayarlar.primaryRenk || '#3b82f6';
  const yaziRenk = kontrastRenk(renk);
  const koyuRenk = koyulaştir(renk);
  const acikRenk = acikTon(renk);

  return (
    <SettingsContext.Provider value={{ ayarlar, setAyarlar }}>
      <style>{`
        :root {
          --renk-primary: ${renk};
          --renk-primary-koyu: ${koyuRenk};
          --renk-primary-acik: ${acikRenk};
          --renk-primary-yazi: ${yaziRenk};
        }
        .btn-primary {
          background-color: var(--renk-primary) !important;
          color: var(--renk-primary-yazi) !important;
        }
        .btn-primary:hover:not(:disabled) {
          background-color: var(--renk-primary-koyu) !important;
        }
        .tema-bg {
          background-color: var(--renk-primary) !important;
          color: var(--renk-primary-yazi) !important;
        }
        .tema-text { color: var(--renk-primary) !important; }
        .tema-border { border-color: var(--renk-primary) !important; }
        input[type="range"]:accent-color,
        input:focus { outline-color: var(--renk-primary) !important; }
      `}</style>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);
export { kontrastRenk };
