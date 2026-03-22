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

export function SettingsProvider({ children }) {
  const [ayarlar, setAyarlar] = useState(VARSAYILAN);

  useEffect(() => {
    api.get('/ayarlar')
      .then(res => setAyarlar({ ...VARSAYILAN, ...res.data.ayarlar }))
      .catch(() => {});
  }, []);

  // Tema renginden koyu ton türet (hover için)
  const koyuRenk = (hex) => {
    try {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgb(${Math.max(0, r - 30)}, ${Math.max(0, g - 30)}, ${Math.max(0, b - 30)})`;
    } catch {
      return '#2563eb';
    }
  };

  return (
    <SettingsContext.Provider value={{ ayarlar, setAyarlar, koyuRenk }}>
      {/* CSS değişkenlerini global olarak enjekte et */}
      <style>{`
        :root {
          --renk-primary: ${ayarlar.primaryRenk};
          --renk-primary-koyu: ${koyuRenk(ayarlar.primaryRenk)};
          --renk-primary-acik: ${ayarlar.primaryRenk}20;
        }
        .btn-primary {
          background-color: var(--renk-primary) !important;
        }
        .btn-primary:hover:not(:disabled) {
          background-color: var(--renk-primary-koyu) !important;
        }
        .tema-bg { background-color: var(--renk-primary) !important; }
        .tema-text { color: var(--renk-primary) !important; }
        .tema-border { border-color: var(--renk-primary) !important; }
        .tema-ring:focus { --tw-ring-color: var(--renk-primary) !important; }
      `}</style>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);
