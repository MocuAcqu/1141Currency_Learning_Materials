import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';

// 記得換成你電腦的區域網路 IP
const API_URL = 'http://172.30.64.255:5000';

interface RatesData {
  base: string;
  rates: { [key: string]: number };
}

interface RatesContextType {
  ratesData: RatesData | null;
  loading: boolean;
  error: string | null;
}

const RatesContext = createContext<RatesContextType | undefined>(undefined);

export const RatesProvider = ({ children }: { children: ReactNode }) => {
  const [ratesData, setRatesData] = useState<RatesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const response = await fetch(`${API_URL}/api/rates`);
        if (!response.ok) throw new Error('網路回應不正確');
        const data = await response.json();
        if ('error' in data) throw new Error(data.error);

        setRatesData(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : '發生未知錯誤');
      } finally {
        setLoading(false);
      }
    };

    fetchRates(); // 這個 effect 只會在 App 啟動時執行一次
  }, []);

  const value = { ratesData, loading, error };

  return <RatesContext.Provider value={value}>{children}</RatesContext.Provider>;
};

export const useRates = () => {
  const context = useContext(RatesContext);
  if (context === undefined) {
    throw new Error('useRates must be used within a RatesProvider');
  }
  return context;
};