import React from "react";
import { View, Text, StyleSheet } from "react-native";

const currencyChineseMap: Record<string, string> = {
  AUD: "澳幣",
  BRL: "巴西幣",
  CAD: "加幣",
  EUR: "歐元",
  GBP: "英鎊",
  INR: "印度盧比",
  JPY: "日圓",
  MXN: "墨西哥披索",
  PKR: "巴基斯坦盧比",
  SGD: "新加坡幣",
  TRY: "土耳其里拉",
  USD: "美金",
  NZD: "紐幣",
  NOK: "挪威克朗",
  MYR: "馬來西亞幣",
  IDR: "印尼盾",
  PHP: "菲律賓披索",
};

export type BanknoteResult = {
  ok?: boolean;
  error?: string;
  currency?: { top_k?: Array<{ currency: string; prob: number }> };
  denomination?: {
    distribution?: Array<{ denomination: string; prob: number }>;
    top_5?: Array<{ denomination: string; prob: number }>;
  };
};

const CARD_PADDING = 10;
const pct = (x: number) => Math.round(x * 1000) / 10; // 0.1% 刻度
const fallback = <Text style={{ color: "#888" }}>No data</Text>;

function displayCurrencyName(code: string): string {
    if (!code || typeof code !== 'string') return '';
    const parts = String(code).split("_");
    const head = parts[0];
    const maybeDenom = parts[1];
    if (currencyChineseMap[head]) {
        if (maybeDenom && /^\d+$/.test(maybeDenom)) return `${currencyChineseMap[head]} ${maybeDenom}元`;
        return currencyChineseMap[head];
    }
    if (/^\d+$/.test(head)) return `${head}元`;
    return String(code);
}

function ManualBarChart({ data, color }: { data: Array<{ label: string; value: number }>; color: string }) {
    if (!data || data.length === 0) {
        return fallback;
    }

    // 找到最大值，用來計算每個長條的相對寬度
    const maxValue = Math.max(...data.map(d => d.value), 0);
    // 如果最大值為0，避免除以0的錯誤
    const scaleFactor = maxValue > 0 ? 1 / maxValue : 0;

    return (
        <View style={styles.chartContainer}>
            {data.map((item, index) => (
                <View key={index} style={styles.barRow}>
                    {/* 左側的標籤 */}
                    <Text style={styles.barLabel} numberOfLines={1} ellipsizeMode="tail">
                        {item.label}
                    </Text>
                    {/* 右側的長條和數值 */}
                    <View style={styles.barWrapper}>
                        <View 
                            style={[
                                styles.bar,
                                { 
                                    backgroundColor: color,
                                    // ✨ 核心邏輯：根據數值計算長條寬度百分比 ✨
                                    width: `${item.value * scaleFactor * 100}%` 
                                }
                            ]} 
                        />
                        <Text style={styles.barValueText}>
                            {pct(item.value)}%
                        </Text>
                    </View>
                </View>
            ))}
        </View>
    );
}

export default function ResultsCharts({
  resJson,
  color = "#2D5975",
}: {
  resJson: BanknoteResult | null | undefined;
  color?: string;
}) {
  if (!resJson) return null;
  if (!resJson.ok)
    return (
      <View style={styles.errorContainer}>
        <Text style={{ color: "#DC2626", fontWeight: "700", fontSize: 16 }}>發生錯誤</Text>
        <Text selectable style={{ color: "#111827" }}>{String(resJson.error ?? "Unknown error")}</Text>
      </View>
    );

  const topCurrency = (resJson?.currency?.top_k ?? [])[0];
  const topDenomination = (resJson?.denomination?.top_5 ?? [])[0];

  // 準備傳給新圖表元件的資料格式
    const currencyChartData = (resJson?.currency?.top_k ?? []).map(item => ({
        label: displayCurrencyName(item.currency),
        value: item.prob,
    }));

    const denominationChartData = (resJson?.denomination?.top_5 ?? []).map(item => ({
        label: displayCurrencyName(item.denomination),
        value: item.prob,
    }));

    return (
        <View style={styles.container}>
            {/* 幣別辨識結果卡片 */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>這是什麼貨幣？</Text>
                <ManualBarChart data={currencyChartData} color={color} />
                {topCurrency && (
                    <Text style={styles.conclusionText}>
                        這張鈔票最可能是 <Text style={{fontWeight: 'bold'}}>{displayCurrencyName(topCurrency.currency)}</Text>！
                    </Text>
                )}
            </View>
            {/* 面額辨識結果卡片 */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>面額是多少？</Text>
                <ManualBarChart data={denominationChartData} color={color} />
                {topDenomination && (
                    <Text style={styles.conclusionText}>
                        這張鈔票最可能是 <Text style={{fontWeight: 'bold'}}>{displayCurrencyName(topDenomination.denomination)}</Text>！
                    </Text>
                )}
            </View>
        </View>
    );
}

// --- ✨ 全新的樣式表 ✨ ---
const styles = StyleSheet.create({
    // Chart Styles
    chartContainer: {
        paddingHorizontal: CARD_PADDING,
        marginTop: 10,
    },
    barRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    barLabel: {
        width: 100, // 固定的標籤寬度
        fontSize: 12,
        color: '#475569',
        marginRight: 5,
        textAlign: 'center',
    },
    barWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        height: 20, // 長條的高度
        backgroundColor: '#f1f5f9', // 長條的背景軌道
        borderRadius: 10,
    },
    bar: {
        height: '100%',
        borderRadius: 10,
    },
    barValueText: {
        position: 'absolute',
        right: 8,
        fontSize: 10,
        fontWeight: 'bold',
        color: 'white',
        textShadowColor: 'rgba(0, 0, 0, 0.4)', // 文字陰影，使其在淺色背景上也清晰
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 1,
    },
    fallbackText: {
        color: "#888",
        textAlign: 'center',
        padding: 20,
    },

    // Card and other styles
    container: { gap: 24 },
    card: { 
        backgroundColor: "#FFFFFF", 
        borderRadius: 16, 
        paddingVertical: 20, 
        shadowColor: "#000", 
        shadowOffset: { width: 0, height: 2 }, 
        shadowOpacity: 0.1, 
        shadowRadius: 8, 
        elevation: 5,
    },
    cardTitle: { 
        fontSize: 20, 
        fontWeight: "800", 
        color: "#2D5975", 
        textAlign: "center", 
        marginBottom: 20, 
    },
    conclusionText: { 
        fontSize: 18, 
        color: "#1E293B", 
        textAlign: "center", 
        marginTop: 20, 
        paddingHorizontal: CARD_PADDING, 
    },
    errorContainer: { gap: 8, padding: CARD_PADDING },
    errorTitle: { color: "#DC2626", fontWeight: "700", fontSize: 16 },
    errorText: { color: "#111827" },
});