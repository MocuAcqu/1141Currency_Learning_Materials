import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';

const API_URL = 'http://172.30.70.96:5000';

interface CurrencyInfo {
  id: number;
  currency_code: string;
  name_zh: string;
  country_zh: string;
  symbol: string;
  image_url: string;
}

interface RatesData {
  base: string;
  rates: { [key: string]: number };
}

interface RatesContextType {
  ratesData: RatesData | null; 
  currenciesInfo: CurrencyInfo[] | null;
  loading: boolean;
  error: string | null;
}

const RatesContext = createContext<RatesContextType | undefined>(undefined);

export const RatesProvider = ({ children }: { children: ReactNode }) => {
  const [ratesData, setRatesData] = useState<RatesData | null>(null);
  const [currenciesInfo, setCurrenciesInfo] = useState<CurrencyInfo[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [ratesResponse, currenciesResponse] = await Promise.all([
          fetch(`${API_URL}/api/rates`),
          fetch(`${API_URL}/api/currencies`)
        ]);

        if (!ratesResponse.ok) throw new Error('無法獲取匯率資料');
        if (!currenciesResponse.ok) throw new Error('無法獲取貨幣資訊');

        const ratesJson = await ratesResponse.json();
        const currenciesJson = await currenciesResponse.json();
        
        if (ratesJson.error) throw new Error(ratesJson.error);
        if (currenciesJson.error) throw new Error(currenciesJson.error);

        setRatesData(ratesJson);
        setCurrenciesInfo(currenciesJson);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : '發生未知錯誤');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const value = { ratesData,  currenciesInfo, loading, error };

  return <RatesContext.Provider value={value}>{children}</RatesContext.Provider>;
};

export const useRates = () => {
  const context = useContext(RatesContext);
  if (context === undefined) {
    throw new Error('useRates must be used within a RatesProvider');
  }
  return context;
};