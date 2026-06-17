import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { apiRequest } from '../lib/api';

export interface PageSetting {
  pageId: string;
  label: string;
  isHidden: boolean;
}

interface PageSettingsContextType {
  settings: PageSetting[];
  loading: boolean;
  isPageHidden: (pageId: string) => boolean;
  refreshSettings: () => Promise<void>;
}

const PageSettingsContext = createContext<PageSettingsContextType | undefined>(undefined);

export const PageSettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<PageSetting[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const data = await apiRequest<PageSetting[]>('/admin/page-settings');
      setSettings(data);
    } catch (err) {
      console.error('Failed to load page settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const isPageHidden = (pageId: string) => {
    const found = settings.find((s) => s.pageId === pageId);
    return found ? found.isHidden : false;
  };

  return (
    <PageSettingsContext.Provider value={{ settings, loading, isPageHidden, refreshSettings: fetchSettings }}>
      {children}
    </PageSettingsContext.Provider>
  );
};

export const usePageSettings = () => {
  const context = useContext(PageSettingsContext);
  if (context === undefined) {
    throw new Error('usePageSettings must be used within a PageSettingsProvider');
  }
  return context;
};
