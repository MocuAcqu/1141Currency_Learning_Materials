import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import Collapsible from 'react-native-collapsible'; // 引入折疊元件
import { LinearGradient } from 'expo-linear-gradient';

const API_URL = 'http://172.30.70.96:5000';

// ✨ 1. 更新 TypeScript 介面以包含所有新欄位 ✨
interface CurrencyDetail {
    id: number;
    currency_code: string;
    name_zh: string;
    name_en: string;
    country_zh: string;
    country_en: string;
    symbol: string;
    image_url: string; // 這應該是檔名，例如 'twd.png'
    history_zh: string;
    design_zh: string;
    mechanism_zh: string;
    influence_zh: string;
}

// 本地圖片對應表 (需要與 collection.tsx 同步)
const currencyImages: { [key: string]: any } = {
  'twd.png': require('../../../assets/currency_images/twd.png'),
  'usd.png': require('../../../assets/currency_images/usd.png'),
  'jpy.png': require('../../../assets/currency_images/jpy.png'),
  'aud.png': require('../../../assets/currency_images/aud.png'),
  'cad.png': require('../../../assets/currency_images/cad.png'),
  'chf.png': require('../../../assets/currency_images/chf.png'),
  'cny.png': require('../../../assets/currency_images/cny.png'),
  'eur.png': require('../../../assets/currency_images/eur.png'),
  'gbp.png': require('../../../assets/currency_images/gbp.png'),
  'hkd.png': require('../../../assets/currency_images/hkd.png'),
  'inr.png': require('../../../assets/currency_images/inr.png'),
  'krw.png': require('../../../assets/currency_images/krw.png'),
  'sgd.png': require('../../../assets/currency_images/sgd.png'),
};

// 屬性面板的單項元件
const StatItem = ({ label, value }: { label: string, value: string | undefined }) => (
    <View style={styles.statItem}>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={styles.statValue}>{value || 'N/A'}</Text>
    </View>
);

// ✨ 2. 建立可折疊的卡片元件 ✨
const CollapsibleCard = ({ title, content, iconName }: { title: string, content: string, iconName: any }) => {
    const [isCollapsed, setIsCollapsed] = useState(true); // 預設折疊

    return (
        <View style={styles.collapsibleCard}>
            <TouchableOpacity onPress={() => setIsCollapsed(!isCollapsed)} style={styles.collapsibleHeader}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <FontAwesome5 name={iconName} size={18} color="#007AFF" />
                    <Text style={styles.sectionTitle}>{title}</Text>
                </View>
                <FontAwesome5 name={isCollapsed ? 'chevron-down' : 'chevron-up'} size={16} color="#666" />
            </TouchableOpacity>
            <Collapsible collapsed={isCollapsed}>
                <Text style={styles.descriptionText}>{content}</Text>
            </Collapsible>
        </View>
    );
};


export default function CurrencyDetailScreen() {
    const { code } = useLocalSearchParams<{ code: string }>();
    const [currency, setCurrency] = useState<CurrencyDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!code) return;
        const fetchCurrencyDetail = async () => {
            try {
                setLoading(true);
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
    }, [code]);

    if (loading) return <View style={styles.center}><ActivityIndicator size="large" /></View>;
    if (error || !currency) return <View style={styles.center}><Text style={styles.errorText}>{error || '無法載入資料'}</Text></View>;

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <Stack.Screen options={{ title: currency.name_zh }} />
            <LinearGradient colors={['#e0f7fa', '#f0f2f5']} style={StyleSheet.absoluteFill} />

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* 主視覺區 */}
                <View style={styles.header}>
                    <View style={styles.imageContainer}>
                        <Image source={currencyImages[currency.image_url]} style={styles.mainImage} />
                    </View>
                </View>

                {/* 標題與代碼 */}
                <View style={styles.titleContainer}>
                    <Text style={styles.currencyName}>{currency.name_zh}</Text>
                    <Text style={styles.currencyCode}>{currency.currency_code}</Text>
                </View>

                {/* 基礎屬性面板 */}
                <View style={styles.statsCard}>
                    <StatItem label="英文名稱" value={currency.name_en} />
                    <StatItem label="所屬國家/地區" value={currency.country_zh} />
                    <StatItem label="貨幣符號" value={currency.symbol} />
                </View>

                {/* ✨ 3. 使用新的可折疊卡片來顯示詳細資訊 ✨ */}
                <CollapsibleCard title="歷史背景" iconName="landmark" content={currency.history_zh} />
                <CollapsibleCard title="設計與文化" iconName="palette" content={currency.design_zh} />
                <CollapsibleCard title="發行機制" iconName="gavel" content={currency.mechanism_zh} />
                <CollapsibleCard title="國際影響力" iconName="globe-americas" content={currency.influence_zh} />
            </ScrollView>
        </SafeAreaView>
    );
}

// --- ✨ 全新、卡牌風格的樣式表 ✨ ---
const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f2f5' },
    errorText: { color: 'red', fontSize: 16 },
    scrollContent: { paddingBottom: 40 },
    header: { alignItems: 'center', paddingVertical: 20 },
    imageContainer: { 
        width: '90%', 
        aspectRatio: 2 / 1, // 維持鈔票長寬比
        backgroundColor: 'white', 
        borderRadius: 15, 
        padding: 10,
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 5 }, 
        shadowOpacity: 0.2, 
        shadowRadius: 15, 
        elevation: 10 
    },
    mainImage: { width: '100%', height: '100%', resizeMode: 'contain' },
    titleContainer: { paddingHorizontal: 20, marginBottom: 20, alignItems: 'center' },
    currencyName: { fontSize: 32, fontWeight: 'bold', color: '#1c1e21' },
    currencyCode: { fontSize: 18, color: '#65676b', marginTop: 4, letterSpacing: 1 },
    statsCard: { backgroundColor: 'white', borderRadius: 12, marginHorizontal: 20, paddingVertical: 10, paddingHorizontal: 20, marginBottom: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 3 },
    statItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f2f5' },
    statLabel: { fontSize: 16, color: '#65676b' },
    statValue: { fontSize: 16, fontWeight: '600', color: '#1c1e21', flex: 1, textAlign: 'right' },
    collapsibleCard: { backgroundColor: 'white', borderRadius: 12, marginHorizontal: 20, marginBottom: 15, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 3 },
    collapsibleHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
    sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#1c1e21', marginLeft: 10 },
    descriptionText: { fontSize: 16, lineHeight: 26, color: '#333', paddingHorizontal: 20, paddingBottom: 20 },
});