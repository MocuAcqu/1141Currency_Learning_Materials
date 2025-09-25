import React, { useState, useMemo } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Modal, Button } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRates } from '../../contexts/RatesContext';

export default function ConverterScreen() {
  const { ratesData, loading, error } = useRates();

  const [amount, setAmount] = useState('100');
  const [fromCurrency, setFromCurrency] = useState('TWD');
  const [toCurrency, setToCurrency] = useState('USD');
  const [modalVisible, setModalVisible] = useState(false);

  const { convertedAmount, calculationRate } = useMemo(() => {
    if (!ratesData) return { convertedAmount: 0, calculationRate: 0 };
    const amountNum = parseFloat(amount) || 0;
    const rates = ratesData.rates;
    const rateFrom = rates[fromCurrency];
    const rateTo = rates[toCurrency];
    if (!rateFrom || !rateTo) return { convertedAmount: 0, calculationRate: 0 };
    const finalRate = rateTo / rateFrom;
    const result = amountNum * finalRate;
    return { convertedAmount: result, calculationRate: finalRate };
  }, [amount, fromCurrency, toCurrency, ratesData]);

  const handleSwapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  if (loading) return <View style={styles.center}><Text>載入匯率資料中...</Text></View>;
  if (error) return <View style={styles.center}><Text style={styles.errorText}>錯誤: {error}</Text></View>;

  const currencyOptions = ratesData ? Object.keys(ratesData.rates).sort() : [];

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>貨幣換算</Text> {/* 修改 #1: 標題更簡潔 */}

      {/* 來源貨幣區塊 */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>金額</Text>
        <TextInput
          style={styles.input}
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          placeholder="輸入金額"
        />
        <Picker
          selectedValue={fromCurrency}
          style={styles.picker}
          onValueChange={(itemValue) => setFromCurrency(itemValue)}
        >
          {currencyOptions.map(currency => (
            <Picker.Item key={currency} label={currency} value={currency} />
          ))}
        </Picker>
      </View>

      {/* 交換按鈕 */}
      <View style={styles.swapContainer}>
        <TouchableOpacity onPress={handleSwapCurrencies} style={styles.swapButton}>
          <FontAwesome5 name="exchange-alt" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* 目標貨幣區塊 */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>等於</Text>
        <Text style={styles.resultText}>{convertedAmount.toFixed(4)}</Text>
        <Picker
          selectedValue={toCurrency}
          style={styles.picker}
          onValueChange={(itemValue) => setToCurrency(itemValue)}
        >
          {currencyOptions.map(currency => (
            <Picker.Item key={currency} label={currency} value={currency} />
          ))}
        </Picker>
      </View>

      {/* --- 新增：顯示當前選擇的兩種貨幣之間的即時匯率 --- */}
      <View style={styles.rateDisplayBox}>
        <Text style={styles.rateDisplayText}>
          即時匯率: 1 {fromCurrency} = {calculationRate.toFixed(6)} {toCurrency}
        </Text>
      </View>

      {/* --- 修改 #2: 讓換算過程的說明更清楚 --- */}
      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>詳細計算</Text>
        <Text style={styles.infoText}>
          {amount || 0} {fromCurrency} × {calculationRate.toFixed(6)}
        </Text>
        <Text style={styles.infoResult}>
          = {convertedAmount.toFixed(4)} {toCurrency}
        </Text>
      </View>
      
      {/* 提示按鈕 */}
      <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.hintButton}>
        <Text style={styles.hintButtonText}>匯率換算方法</Text>
      </TouchableOpacity>

      {/* 提示 Modal (保持不變) */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>匯率換算辦法</Text>
            <Text style={styles.modalText}>
              本工具的匯率資料皆以基準貨幣 (TWD) 為參考。
              {'\n\n'}
              當您從 A 貨幣換算到 B 貨幣時，計算過程如下：
              {'\n'}
              1. 找出 1 A 貨幣等於多少 TWD。
              {'\n'}
              2. 找出 1 B 貨幣等於多少 TWD。
              {'\n'}
              3. 最終匯率 = (B 的 TWD 價值) / (A 的 TWD 價值)。
            </Text>
            <Button title="關閉" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

// --- 修改 #3: 調整樣式表以適應新介面 ---
const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    errorText: { color: 'red', fontSize: 16 },
    title: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, color: '#333' },
    inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderRadius: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
    label: { fontSize: 18, fontWeight: '500', width: 60, textAlign: 'center' },
    input: { flex: 1, height: 60, fontSize: 22, paddingHorizontal: 10 },
    resultText: { flex: 1, height: 60, fontSize: 22, paddingHorizontal: 10, textAlignVertical: 'center', fontWeight: 'bold', color: '#007AFF' },
    picker: { width: 120, height: 60 },
    swapContainer: { height: 40, justifyContent: 'center', alignItems: 'center' },
    swapButton: { padding: 5 },
    rateDisplayBox: { alignItems: 'center', marginVertical: 15},
    rateDisplayText: { fontSize: 13, color: '#555', fontStyle: 'italic' },
    infoBox: { marginTop: 10, padding: 15, backgroundColor: '#e9f5ff', borderRadius: 10 },
    infoTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10, color: '#005f9e' },
    infoText: { fontSize: 14, color: '#333', lineHeight: 20, textAlign: 'center' },
    infoResult: { fontSize: 16, color: '#333', lineHeight: 22, textAlign: 'center', fontWeight: 'bold' },
    hintButton: { marginTop: 'auto', backgroundColor: '#007AFF', padding: 15, borderRadius: 10, alignItems: 'center' },
    hintButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
    modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
    modalView: { margin: 20, backgroundColor: 'white', borderRadius: 20, padding: 35, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
    modalText: { marginBottom: 15, textAlign: 'center', lineHeight: 22 },
});