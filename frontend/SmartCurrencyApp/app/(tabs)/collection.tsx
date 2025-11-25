import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useFocusEffect } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';

const API_URL = 'http://192.168.0.160:5000';

const currencyImages: { [key: string]: any } = {
  'twd.png': require('../../assets/currency_images/twd.png'),
  'usd.png': require('../../assets/currency_images/usd.png'),
  'jpy.png': require('../../assets/currency_images/jpy.png'),
  'aud.png': require('../../assets/currency_images/aud.png'),
  'cad.png': require('../../assets/currency_images/cad.png'),
  'chf.png': require('../../assets/currency_images/chf.png'),
  'cny.png': require('../../assets/currency_images/cny.png'),
  'eur.png': require('../../assets/currency_images/eur.png'),
  'gbp.png': require('../../assets/currency_images/gbp.png'),
  'hkd.png': require('../../assets/currency_images/hkd.png'),
  'inr.png': require('../../assets/currency_images/inr.png'),
  'krw.png': require('../../assets/currency_images/krw.png'),
  'sgd.png': require('../../assets/currency_images/sgd.png'),
  'dem.png': require('../../assets/currency_images/dem_10.png'),
  'frf.png': require('../../assets/currency_images/frf_100.png'),
  'rub.png': require('../../assets/currency_images/rub_100.png'),
  'zar.png': require('../../assets/currency_images/zar_10.png'),
};


const collectedStamp = require('../../assets/images/collected-stamp.png');

interface Currency {
  id: number;
  currency_code: string;
  name_zh: string;
  country_zh: string;
  image_url: string;
}

export default function CollectionScreen() {
  const { collections, fetchCollections } = useAuth();
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      fetchCollections();
    }, [])
  );

  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const response = await fetch(`${API_URL}/api/currencies`);
        if (!response.ok) throw new Error('無法獲取貨幣列表');
        const data = await response.json();
        if (data.error) throw new Error(data.error);
        setCurrencies(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '發生未知錯誤');
      } finally {
        setLoading(false);
      }
    };
    fetchCurrencies();
  }, []);

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" /></View>;
  }
  if (error) {
    return <View style={styles.center}><Text style={styles.errorText}>{error}</Text></View>;
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={currencies}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => {
          const isCollected = collections.has(item.currency_code);

          return (
            <Link href={`/currencies/${item.currency_code}`} asChild>
              <TouchableOpacity style={styles.card}>
              <Image source={currencyImages[item.image_url]} style={styles.image} />
              <View style={styles.info}>
                <Text style={styles.name}>{item.name_zh} ({item.currency_code})</Text>
                <Text style={styles.country}>{item.country_zh}</Text>
              </View>
              {isCollected && (
                <Image source={collectedStamp} style={styles.stamp} />
              )}
              </TouchableOpacity>
            </Link>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: 'red' },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', margin: 20 },
  card: { flexDirection: 'row', backgroundColor: 'white', borderRadius: 10, marginHorizontal: 20, marginVertical: 10, padding: 15, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  image: { width: 100, height: 50, resizeMode: 'contain', marginRight: 15 },
  info: { flex: 1 },
  name: { fontSize: 18, fontWeight: 'bold' },
  country: { fontSize: 14, color: '#666', marginTop: 4 },
  stamp: {
    width: 70,
    height: 70,
    position: 'absolute',
    right: 10,
    top: '60%',
    marginTop: -25,
    opacity: 0.7,
  },
});