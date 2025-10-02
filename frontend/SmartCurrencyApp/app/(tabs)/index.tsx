import React, { useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native'; 
import { router } from 'expo-router';

export default function IndexScreen() {
  const animationRef = useRef<LottieView>(null);

  useEffect(() => {
    animationRef.current?.play();
  }, []);

  const handleStart = () => {
    router.push('/(tabs)/recognize');
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#2c3e50', '#66ddf1ff']}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.header}>
        <Text style={styles.title}>智慧貨幣收集家</Text>
        <Text style={styles.subtitle}>您的全球貨幣知識導航</Text>
      </View>

      {/* Lottie 動畫區域 */}
      <View style={styles.animationContainer}>
        <LottieView
          ref={animationRef}
          style={{ width: 280, height: 280 }}
          source={require('../../assets/lottie/money.json')}
          autoPlay
          loop
        />
      </View>
      
      <View style={styles.footer}>
        <TouchableOpacity style={styles.button} onPress={handleStart}>
          <Text style={styles.buttonText}>開始探索</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#2c3e50' },
    header: { flex: 2, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
    title: { fontSize: 36, fontWeight: 'bold', color: 'white', textAlign: 'center' },
    subtitle: { fontSize: 18, color: 'rgba(255, 255, 255, 0.8)', textAlign: 'center', marginTop: 10 },
    animationContainer: { flex: 5, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
    footer: { flex: 2, justifyContent: 'center', alignItems: 'center' },
    button: { backgroundColor: '#f1c40f', paddingVertical: 15, paddingHorizontal: 40, borderRadius: 30, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 8 },
    buttonText: { fontSize: 20, color: '#2c3e50', fontWeight: 'bold' },
});