import React, { useState, useMemo } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Modal, Button, FlatList, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRates } from '../../contexts/RatesContext';
import { LinearGradient } from 'expo-linear-gradient';

const { height } = Dimensions.get('window');

export default function ConverterScreen() {
  const { ratesData, currenciesInfo, loading, error } = useRates();

  const [amount, setAmount] = useState('100');
  const [fromCurrency, setFromCurrency] = useState('TWD');
  const [toCurrency, setToCurrency] = useState('USD');
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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

  const countryMap = useMemo(() => {
    if (!currenciesInfo) return {};
    return currenciesInfo.reduce((map, currency) => {
      map[currency.currency_code] = currency.country_zh;
      return map;
    }, {} as Record<string, string>);
  }, [currenciesInfo]);

  const handleSwapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };
  
  const filteredRates = useMemo(() => {
    if (!ratesData) return [];
    const allRates = Object.entries(ratesData.rates);
    if (!searchQuery) {
      return allRates;
    }
    return allRates.filter(([currencyCode]) => {
      const currencyName = countryMap[currencyCode] || '';
      return (
        currencyCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        currencyName.includes(searchQuery)
      );
    });
  }, [ratesData, searchQuery, countryMap]);


  if (loading) return <View style={styles.center}><Text>載入匯率資料中...</Text></View>;
  if (error) return <View style={styles.center}><Text style={styles.errorText}>錯誤: {error}</Text></View>;

  const currencyOptions = ratesData ? Object.keys(ratesData.rates).sort() : [];

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <LinearGradient colors={['#15505aff', '#ecececff']} style={StyleSheet.absoluteFill} />

      <View style={styles.converterContainer}>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>您支付</Text>
          <View style={styles.cardBody}>
            <TextInput
              style={styles.input}
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
            />
            <View style={styles.pickerContainer}>
              <Picker selectedValue={fromCurrency} onValueChange={(item) => setFromCurrency(item)}>
                {currencyOptions.map(c => <Picker.Item key={c} label={c} value={c} />)}
              </Picker>
            </View>
          </View>
        </View>

        <View style={styles.swapButtonContainer}>
          <TouchableOpacity onPress={handleSwapCurrencies} style={styles.swapButton}>
            <FontAwesome5 name="exchange-alt" size={20} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>您收到</Text>
          <View style={styles.cardBody}>
            <Text style={styles.resultText}>{convertedAmount.toFixed(2)}</Text>
            <View style={styles.pickerContainer}>
              <Picker selectedValue={toCurrency} onValueChange={(item) => setToCurrency(item)}>
                {currencyOptions.map(c => <Picker.Item key={c} label={c} value={c} />)}
              </Picker>
            </View>
          </View>
        </View>
      </View>

      <Text style={styles.rateDisplayText}>
        1 {fromCurrency} = {calculationRate.toFixed(6)} {toCurrency}
      </Text>
      
      <View style={styles.converterContainer}>
        <View style={styles.card}>
          <Text style={styles.infoTitle}>詳細計算過程</Text>
          <Text style={styles.infoText}>
            {amount || 0} {fromCurrency} × {calculationRate.toFixed(6)}
          </Text>
          <Text style={styles.infoResult}>
            = {convertedAmount.toFixed(4)} {toCurrency}
          </Text>
        </View>
      </View>

      <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.hintButton}>
        <FontAwesome5 name="info-circle" size={16} color="white" />
        <Text style={styles.hintButtonText}> 查詢即時匯率</Text>
      </TouchableOpacity>

      {/* 全新的 Modal */}
      <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>即時匯率查詢 (基準: {ratesData?.base})</Text>
            <TextInput
              style={styles.searchBar}
              placeholder="搜尋貨幣代碼 (例如 USD)"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <FlatList
              data={filteredRates}
              keyExtractor={item => item[0]}
              renderItem={({ item }) => {
                const currencyCode = item[0];
                const rateValue = item[1];
                const countryName = countryMap[currencyCode] || '';

                return (
                  <View style={styles.rateItem}>
                    <View>
                      <Text style={styles.currencyName}>{currencyCode}    {countryName}</Text>
                    </View>
                    <Text style={styles.currencyRate}>{rateValue.toFixed(4)}</Text>
                  </View>
                );
              }}
              style={styles.rateList}
            />
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>關閉</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, paddingTop: 20 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    errorText: { color: 'red', fontSize: 16 },
    converterContainer: { paddingHorizontal: 20, marginTop: 24},
    card: { backgroundColor: 'white', borderRadius: 20, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 6 },
    cardLabel: { fontSize: 16, color: '#888', marginBottom: 14 },
    cardBody: { flexDirection: 'row', alignItems: 'center' },
    input: { flex: 1, fontSize: 36, fontWeight: '600', color: '#333' },
    resultText: { flex: 1, fontSize: 36, fontWeight: 'bold', color: '#20b9b2ff' },
    pickerContainer: { width: 120, height: 50, justifyContent: 'center', backgroundColor: '#f0f0f0', borderRadius: 10 },
    swapButtonContainer: { alignItems: 'flex-start', marginVertical: -15, zIndex: 1, paddingLeft: 20 },
    swapButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#149696ff', justifyContent: 'center', alignItems: 'center', transform: [{ rotate: '90deg' }], shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 4 },
    rateDisplayText: { fontSize: 14, color: '#555', textAlign: 'center', marginTop: 14, marginBottom: 5 },

    infoTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 8, color: '#808080ff', textAlign: 'center' },
    infoText: { fontSize: 10, color: '#808080ff', lineHeight: 14, marginBottom: 4, textAlign: 'center' },
    infoResult: { fontSize: 12, color: '#666666ff', lineHeight: 14, textAlign: 'center', fontWeight: 'bold' },

    hintButton: { flexDirection: 'row', margin: 20, backgroundColor: '#26a69a', padding: 15, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
    hintButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
    
    modalContainer: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
    modalView: { height: height * 0.75, backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, alignItems: 'center' },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
    searchBar: { width: '100%', height: 40, backgroundColor: '#f0f0f0', borderRadius: 10, paddingHorizontal: 15, marginBottom: 10 },
    rateList: { width: '100%' },
    rateItem: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
    currencyName: { fontSize: 16, fontWeight: '500' },
    countryName: { fontSize: 14, color: '#666', marginTop: 2 },
    currencyRate: { fontSize: 16, color: '#333' },
    closeButton: { marginTop: 15, backgroundColor: '#007AFF', paddingVertical: 10, paddingHorizontal: 30, borderRadius: 10 },
    closeButtonText: { color: 'white', fontSize: 16 },
});