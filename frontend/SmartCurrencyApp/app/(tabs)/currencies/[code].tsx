import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
const API_URL = 'http://192.168.0.160:5000';

// 為單一貨幣的完整資料定義 TypeScript 介面
interface CurrencyDetail {
    id: number;
    currency_code: string;
    name_zh: string;
    name_en: string;
    country_zh: string;
    country_en: string;
    symbol: string;
    description_zh: string;
    image_url: string;
}

// 本地圖片對應表 (需要與 collection.tsx 同步)
const currencyImages: { [key: string]: any } = {
  'twd.png': require('../../../assets/currency_images/twd.png'),
  'usd.png': require('../../../assets/currency_images/usd.png'),
  'jpy.png': require('../../../assets/currency_images/jpy.png'),
  // ... 其他貨幣圖片
};

const StatItem = ({ label, value }: { label: string, value: string | undefined }) => (
    <View style={styles.statItem}>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={styles.statValue}>{value || 'N/A'}</Text>
    </View>
);

export default function CurrencyDetailScreen() {
    // 1. 從 URL 中獲取動態參數 'code'
    const { code } = useLocalSearchParams<{ code: string }>();
    
    const [currency, setCurrency] = useState<CurrencyDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!code) return; // 如果 code 不存在，就不執行 fetch

        const fetchCurrencyDetail = async () => {
            try {
                setLoading(true);
                // 2. 使用 code 參數呼叫後端 API
                const response = await fetch(`${API_URL}/api/currencies/${code}`);
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || '找不到貨幣資料');
                }
                const data = await response.json();
                setCurrency(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : '發生未知錯誤');
            } finally {
                setLoading(false);
            }
        };

        fetchCurrencyDetail();
    }, [code]); // 當 code 參數改變時，重新 fetch

    if (loading) {
        return <View style={styles.center}><ActivityIndicator size="large" /></View>;
    }
    if (error || !currency) {
        return <View style={styles.center}><Text style={styles.errorText}>{error || '無法載入資料'}</Text></View>;
    }

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            {/* 使用 Stack.Screen 來動態設定頁面標題 */}
            <Stack.Screen options={{ title: currency.name_zh }} />
            
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* 主視覺區 */}
                <View style={styles.header}>
                    <Image source={currencyImages[currency.image_url]} style={styles.mainImage} />
                </View>

                {/* 標題與代碼 */}
                <View style={styles.titleContainer}>
                    <Text style={styles.currencyName}>{currency.name_zh}</Text>
                    <Text style={styles.currencyCode}>{currency.currency_code}</Text>
                </View>

                {/* 屬性面板 */}
                <View style={styles.statsCard}>
                    <StatItem label="英文名稱" value={currency.name_en} />
                    <StatItem label="所屬國家/地區" value={currency.country_zh} />
                    <StatItem label="貨幣符號" value={currency.symbol} />
                </View>

                {/* 歷史與故事 */}
                <View style={styles.descriptionCard}>
                    <Text style={styles.sectionTitle}>背景故事</Text>
                    <Text style={styles.descriptionText}>{currency.description_zh}</Text>
                </View>

                {/* TODO: 未來的擴充功能 - 顯示其他面額 */}
                <View style={styles.denominationsCard}>
                    <Text style={styles.sectionTitle}>其他面額</Text>
                    <Text style={styles.placeholderText}>此功能即將推出...</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f2f5' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    errorText: { color: 'red', fontSize: 16 },
    scrollContent: { paddingBottom: 40 },
    header: { alignItems: 'center', marginVertical: 20 },
    mainImage: { width: '90%', height: 150, resizeMode: 'contain', borderRadius: 10 },
    titleContainer: { paddingHorizontal: 20, marginBottom: 20, alignItems: 'center' },
    currencyName: { fontSize: 28, fontWeight: 'bold', color: '#1c1e21' },
    currencyCode: { fontSize: 16, color: '#65676b', marginTop: 4 },
    statsCard: { backgroundColor: 'white', borderRadius: 12, marginHorizontal: 20, padding: 20, marginBottom: 20 },
    statItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f0f2f5' },
    statLabel: { fontSize: 16, color: '#65676b' },
    statValue: { fontSize: 16, fontWeight: '500', color: '#1c1e21' },
    descriptionCard: { backgroundColor: 'white', borderRadius: 12, marginHorizontal: 20, padding: 20, marginBottom: 20 },
    sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10, color: '#1c1e21' },
    descriptionText: { fontSize: 16, lineHeight: 24, color: '#333' },
    denominationsCard: { backgroundColor: 'white', borderRadius: 12, marginHorizontal: 20, padding: 20 },
    placeholderText: { fontSize: 16, color: '#999', fontStyle: 'italic', textAlign: 'center' },
});