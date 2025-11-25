import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, ActivityIndicator, TouchableOpacity, Dimensions, Modal } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import Collapsible from 'react-native-collapsible'; // 引入折疊元件
import { LinearGradient } from 'expo-linear-gradient';
import Carousel from 'react-native-reanimated-carousel';
const { width: screenWidth } = Dimensions.get('window');

interface Denomination {
    value: string;
    type: 'coin' | 'note';
    image_filename: string;
    description: string | null;
    description_front_zh: string | null;
    description_back_zh: string | null; 
}

const API_URL = 'http://192.168.0.160:5000';

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
    denominations: Denomination[];
}

// 本地圖片對應表 (需要與 collection.tsx 同步)
const currencyImages: { [key: string]: any } = {
  'aud.png': require('../../../assets/currency_images/aud.png'),
  'aud_10.png': require('../../../assets/currency_images/aud_10.png'),
  'aud_100.png': require('../../../assets/currency_images/aud_100.png'),
  'aud_20.png': require('../../../assets/currency_images/aud_20.png'),
  'aud_5.png': require('../../../assets/currency_images/aud_5.png'),
  'aud_50.png': require('../../../assets/currency_images/aud_50.png'),
  'cad.png': require('../../../assets/currency_images/cad.png'),
  'cad_10.png': require('../../../assets/currency_images/cad_10.png'),
  'cad_100.png': require('../../../assets/currency_images/cad_100.png'),
  'cad_20.png': require('../../../assets/currency_images/cad_20.png'),
  'cad_5.png': require('../../../assets/currency_images/cad_5.png'),
  'cad_50.png': require('../../../assets/currency_images/cad_50.png'),
  'chf.png': require('../../../assets/currency_images/chf.png'),
  'chf_10.png': require('../../../assets/currency_images/chf_10.png'),
  'chf_100.png': require('../../../assets/currency_images/chf_100.png'),
  'chf_1000.png': require('../../../assets/currency_images/chf_1000.png'),
  'chf_20.png': require('../../../assets/currency_images/chf_20.png'),
  'chf_200.png': require('../../../assets/currency_images/chf_200.png'),
  'chf_50.png': require('../../../assets/currency_images/chf_50.png'),
  'cny.png': require('../../../assets/currency_images/cny.png'),
  'cny_1.png': require('../../../assets/currency_images/cny_1.png'),
  'cny_10.png': require('../../../assets/currency_images/cny_10.png'),
  'cny_100.png': require('../../../assets/currency_images/cny_100.png'),
  'cny_20.png': require('../../../assets/currency_images/cny_20.png'),
  'cny_5.png': require('../../../assets/currency_images/cny_5.png'),
  'cny_50.png': require('../../../assets/currency_images/cny_50.png'),
  'dem.png': require('../../../assets/currency_images/dem_10.png'),
  'dem_10.png': require('../../../assets/currency_images/dem_10.png'),
  'dem_100.png': require('../../../assets/currency_images/dem_100.png'),
  'dem_1000.png': require('../../../assets/currency_images/dem_1000.png'),
  'dem_20.png': require('../../../assets/currency_images/dem_20.png'),
  'dem_5.png': require('../../../assets/currency_images/dem_5.png'),
  'dem_50.png': require('../../../assets/currency_images/dem_50.png'),
  'dem_500.png': require('../../../assets/currency_images/dem_500.png'),
  'eur.png': require('../../../assets/currency_images/eur.png'),
  'eur_10.png': require('../../../assets/currency_images/eur_10.png'),
  'eur_100.png': require('../../../assets/currency_images/eur_100.png'),
  'eur_20.png': require('../../../assets/currency_images/eur_20.png'),
  'eur_200.png': require('../../../assets/currency_images/eur_200.png'),
  'eur_5.png': require('../../../assets/currency_images/eur_5.png'),
  'eur_50.png': require('../../../assets/currency_images/eur_50.png'),
  'eur_500.png': require('../../../assets/currency_images/eur_500.png'),
  'frf.png': require('../../../assets/currency_images/frf_100.png'),
  'frf_100.png': require('../../../assets/currency_images/frf_100.png'),
  'frf_20.png': require('../../../assets/currency_images/frf_20.png'),
  'frf_200.png': require('../../../assets/currency_images/frf_200.png'),
  'frf_50.png': require('../../../assets/currency_images/frf_50.png'),
  'frf_500.png': require('../../../assets/currency_images/frf_500.png'),
  'frf_50_1989.png': require('../../../assets/currency_images/frf_50_1989.png'),
  'gbp.png': require('../../../assets/currency_images/gbp.png'),
  'gbp_10.png': require('../../../assets/currency_images/gbp_10.png'),
  'gbp_20.png': require('../../../assets/currency_images/gbp_20.png'),
  'gbp_5.png': require('../../../assets/currency_images/gbp_5.png'),
  'gbp_50.png': require('../../../assets/currency_images/gbp_50.png'),
  'hkd.png': require('../../../assets/currency_images/hkd.png'),
  'hkd_10.png': require('../../../assets/currency_images/hkd_10.png'),
  'hkd_100.png': require('../../../assets/currency_images/hkd_100.png'),
  'hkd_1000.png': require('../../../assets/currency_images/hkd_1000.png'),
  'hkd_20.png': require('../../../assets/currency_images/hkd_20.png'),
  'hkd_50.png': require('../../../assets/currency_images/hkd_50.png'),
  'hkd_500.png': require('../../../assets/currency_images/hkd_500.png'),
  'inr.png': require('../../../assets/currency_images/inr.png'),
  'inr_10.png': require('../../../assets/currency_images/inr_10.png'),
  'inr_100.png': require('../../../assets/currency_images/inr_100.png'),
  'inr_20.png': require('../../../assets/currency_images/inr_20.png'),
  'inr_200.png': require('../../../assets/currency_images/inr_200.png'),
  'inr_2000.png': require('../../../assets/currency_images/inr_2000.png'),
  'inr_50.png': require('../../../assets/currency_images/inr_50.png'),
  'inr_500.png': require('../../../assets/currency_images/inr_500.png'),
  'jpy.png': require('../../../assets/currency_images/jpy.png'),
  'jpy_1000.png': require('../../../assets/currency_images/jpy_1000.png'),
  'jpy_10000.png': require('../../../assets/currency_images/jpy_10000.png'),
  'jpy_2000.png': require('../../../assets/currency_images/jpy_2000.png'),
  'jpy_5000.png': require('../../../assets/currency_images/jpy_5000.png'),
  'krw.png': require('../../../assets/currency_images/krw.png'),
  'krw_1000.png': require('../../../assets/currency_images/krw_1000.png'),
  'krw_10000.png': require('../../../assets/currency_images/krw_10000.png'),
  'krw_5000.png': require('../../../assets/currency_images/krw_5000.png'),
  'krw_50000.png': require('../../../assets/currency_images/krw_50000.png'),
  'rub.png': require('../../../assets/currency_images/rub_100.png'),
  'rub_100.png': require('../../../assets/currency_images/rub_100.png'),
  'rub_1000.png': require('../../../assets/currency_images/rub_1000.png'),
  'rub_200.png': require('../../../assets/currency_images/rub_200.png'),
  'rub_2000.png': require('../../../assets/currency_images/rub_2000.png'),
  'rub_5.png': require('../../../assets/currency_images/rub_5.png'),
  'rub_50.png': require('../../../assets/currency_images/rub_50.png'),
  'rub_5000.png': require('../../../assets/currency_images/rub_5000.png'),
  'sgd.png': require('../../../assets/currency_images/sgd.png'),
  'sgd_10.png': require('../../../assets/currency_images/sgd_10.png'),
  'sgd_100.png': require('../../../assets/currency_images/sgd_100.png'),
  'sgd_1000.png': require('../../../assets/currency_images/sgd_1000.png'),
  'sgd_2.png': require('../../../assets/currency_images/sgd_2.png'),
  'sgd_25.png': require('../../../assets/currency_images/sgd_25.png'),
  'sgd_5.png': require('../../../assets/currency_images/sgd_5.png'),
  'sgd_50.png': require('../../../assets/currency_images/sgd_50.png'),
  'twd.png': require('../../../assets/currency_images/twd.png'),
  'twd_100.png': require('../../../assets/currency_images/twd_100.png'),
  'twd_1000.png': require('../../../assets/currency_images/twd_1000.png'),
  'twd_200.png': require('../../../assets/currency_images/twd_200.png'),
  'twd_2000.png': require('../../../assets/currency_images/twd_2000.png'),
  'twd_500.png': require('../../../assets/currency_images/twd_500.png'),
  'usd.png': require('../../../assets/currency_images/usd.png'),
  'usd_1.png': require('../../../assets/currency_images/usd_1.png'),
  'usd_10.png': require('../../../assets/currency_images/usd_10.png'),
  'usd_100.png': require('../../../assets/currency_images/usd_100.png'),
  'usd_20.png': require('../../../assets/currency_images/usd_20.png'),
  'usd_5.png': require('../../../assets/currency_images/usd_5.png'),
  'usd_50.png': require('../../../assets/currency_images/usd_50.png'),
  'zar_10.png': require('../../../assets/currency_images/zar_10.png'),
  'zar_100.png': require('../../../assets/currency_images/zar_100.png'),
  'zar_20.png': require('../../../assets/currency_images/zar_20.png'),
  'zar_200.png': require('../../../assets/currency_images/zar_200.png'),
  'zar_50.png': require('../../../assets/currency_images/zar_50.png'),
  'zar.png': require('../../../assets/currency_images/zar_10.png'),
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
    const [isViewerVisible, setViewerVisible] = useState(false);
    const [selectedImage, setSelectedImage] = useState<any>(null);
    const [activeIndex, setActiveIndex] = useState(0);

    const showImage = (imageFilename: string) => {
        const imageResource = currencyImages[imageFilename];
        if (imageResource) {
            setSelectedImage(imageResource);
            setViewerVisible(true);
        }
    };

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

    const activeDenomination = currency.denominations?.[activeIndex];

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

                {currency.denominations && currency.denominations.length > 0 && (
                    <View style={styles.carouselContainer}>
                        <Text style={styles.sectionTitle}>流通面額(左右滑動)</Text>
                        <Carousel
                            loop={false}
                            width={screenWidth}
                            height={150}
                            data={currency.denominations}
                            scrollAnimationDuration={500}
                            onSnapToItem={(index) => setActiveIndex(index)}
                            // 輪播項目的渲染函式
                            renderItem={({ item }) => (
                                <TouchableOpacity onPress={() => showImage(item.image_filename)} style={styles.carouselItem}>
                                    <Image source={currencyImages[item.image_filename]} style={styles.carouselImage} />
                                    <Text style={styles.carouselLabel}>{item.value} {currency.symbol}</Text>
                                </TouchableOpacity>
                            )}
                        />

                        {activeDenomination && (
                            <View style={styles.denominationDetailCard}>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>正面：</Text>
                                    <Text style={styles.detailContent}>{activeDenomination.description_front_zh || '暫無描述'}</Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>背面：</Text>
                                    <Text style={styles.detailContent}>{activeDenomination.description_back_zh || '暫無描述'}</Text>
                                </View>
                            </View>
                        )}
                    </View>
                )}

                {/* ✨ 3. 使用新的可折疊卡片來顯示詳細資訊 ✨ */}
                <CollapsibleCard title="歷史背景" iconName="landmark" content={currency.history_zh} />
                <CollapsibleCard title="設計與文化" iconName="palette" content={currency.design_zh} />
                <CollapsibleCard title="發行機制" iconName="gavel" content={currency.mechanism_zh} />
                <CollapsibleCard title="國際影響力" iconName="globe-americas" content={currency.influence_zh} />
            </ScrollView>

            <Modal
                visible={isViewerVisible}
                transparent={true}
                onRequestClose={() => setViewerVisible(false)}
            >
                <TouchableOpacity style={styles.modalBackdrop} onPress={() => setViewerVisible(false)}>
                    <Image source={selectedImage} style={styles.fullscreenImage} />
                </TouchableOpacity>
            </Modal>

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
    descriptionText: { fontSize: 16, lineHeight: 26, color: '#333', paddingHorizontal: 20, paddingBottom: 20 },
    sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#1c1e21', paddingHorizontal: 20, marginBottom: 15 },
    
    // Carousel Styles
    carouselContainer: { marginBottom: 20, backgroundColor: 'white', paddingVertical: 20 },
    carouselItem: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 10 },
    carouselImage: { width: '100%', height: 100, resizeMode: 'contain' },
    carouselLabel: { marginTop: 8, fontSize: 16, fontWeight: '500' },
    
    // Modal Styles
    modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
    fullscreenImage: { width: '90%', height: '80%', resizeMode: 'contain' },
    carouselSection: { marginBottom: 20, backgroundColor: 'white', paddingVertical: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 3 },
    denominationDetailCard: {
        marginTop: 20,
        marginHorizontal: 20,
        padding: 15,
        backgroundColor: '#f8f9fa',
        borderRadius: 10,
    },
    detailRow: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    detailLabel: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#007AFF',
        width: 60,
    },
    detailContent: {
        fontSize: 15,
        lineHeight: 22,
        color: '#333',
        flex: 1,
    },
});