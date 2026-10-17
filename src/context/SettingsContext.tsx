import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Settings } from '../types';
import { getSettings, updateSettings as updateSettingsService, DEFAULT_SETTINGS } from '../services/settingsService';

interface SettingsContextType {
  settings: Settings;
  loading: boolean;
  refreshSettings: () => Promise<void>;
  updateSettings: (newSettings: Partial<Settings>) => Promise<void>;
  updateSiteSettings: (newSettings: Partial<Settings>) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState<boolean>(true);

  const load = async () => {
    try {
      setLoading(true);
      const data = await getSettings();
      setSettings(data);
    } catch (err) {
      console.warn('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleUpdate = async (newSettings: Partial<Settings>) => {
    const updated = await updateSettingsService(newSettings);
    setSettings(updated);
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        loading,
        refreshSettings: load,
        updateSettings: handleUpdate,
        updateSiteSettings: handleUpdate,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
