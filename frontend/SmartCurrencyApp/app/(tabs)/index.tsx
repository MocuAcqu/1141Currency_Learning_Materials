import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRates } from '../../contexts/RatesContext';

export default function IndexScreen() {
  const { ratesData, loading, error } = useRates();

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
      <Text style={styles.title}>即時匯率 (基準: {ratesData?.base})</Text>
      <FlatList
        data={Object.entries(ratesData?.rates || {})}
        keyExtractor={item => item[0]}
        renderItem={({ item }) => (
          <View style={styles.rateItem}>
            <Text style={styles.currency}>{item[0]}</Text>
            <Text style={styles.rateValue}>{item[1]}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

// 樣式保持不變
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f0f0' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginVertical: 16 },
  rateItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#ddd', backgroundColor: '#fff' },
  currency: { fontSize: 16, fontWeight: '500' },
  rateValue: { fontSize: 16 },
  errorText: { fontSize: 18, color: 'red' },
});