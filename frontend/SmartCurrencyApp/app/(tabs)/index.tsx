import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// 換成你電腦的區域網路 IP
const API_URL = 'http://192.168.0.160:5000';

interface RatesResponse {
  base: string;
  rates: {
    [key: string]: number; 
  };
}

export default function IndexScreen() {
  const [ratesData, setRatesData] = useState<RatesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/api/rates`);
        if (!response.ok) {
          throw new Error('網路回應不正確');
        }
        const data = await response.json() as RatesResponse; 
        
        if ('error' in data) {
            throw new Error((data as any).error);
        }

        setRatesData(data);
        setError(null);
      } catch (err) {
        console.error("獲取匯率失敗:", err);
        setError(err instanceof Error ? err.message : '發生未知錯誤');
      } finally {
        setLoading(false);
      }
    };

    fetchRates();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>正在載入即時匯率...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* 由於我們定義了類型，TypeScript 現在知道 ratesData 可能為 null，所以 ?. 的用法是安全的 */}
      <Text style={styles.title}>即時匯率 (基準: {ratesData?.base})</Text>
      <FlatList
        // 現在 TypeScript 知道 ratesData.rates 是一個鍵為 string、值為 number 的物件
        data={Object.entries(ratesData?.rates || {})}
        keyExtractor={item => item[0]}
        renderItem={({ item }) => (
          <View style={styles.rateItem}>
            <Text style={styles.currency}>{item[0]}</Text>
            {/* 修正 #4：TypeScript 現在知道 item[1] 是 number 類型，可以直接渲染 */}
            <Text style={styles.rateValue}>{item[1]}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f0f0' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginVertical: 16 },
  rateItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: '#fff',
  },
  currency: { fontSize: 16, fontWeight: '500' },
  rateValue: { fontSize: 16 },
  errorText: { fontSize: 18, color: 'red' },
});