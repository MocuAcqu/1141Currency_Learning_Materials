import React, { useState } from 'react';
import { StyleSheet, Text, View, Button, SafeAreaView } from 'react-native';

// ！！！重要！！！
// 將 'YOUR_COMPUTER_IP' 替換成你電腦的區域網路 IP
const API_URL = 'http://172.30.64.255:5000';

export default function IndexScreen() {
  const [message, setMessage] = useState('尚未連線...');

  const testBackendConnection = async () => {
    try {
      const response = await fetch(`${API_URL}/api/test`);
      const data = await response.json();
      setMessage(data.message);
    } catch (error) {
      console.error("連線錯誤:", error);
      setMessage('連線失敗！請檢查後端伺服器是否運行，以及 IP 是否正確。');
    }
  };
  
  return (
    // SafeAreaView 可以避免內容被手機的瀏海或下巴擋住
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>前後端連線測試</Text>
      <Text style={styles.message}>{message}</Text>
      <Button title="點我測試連線" onPress={testBackendConnection} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  message: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  }
});