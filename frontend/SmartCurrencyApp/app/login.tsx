import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, router } from 'expo-router';
const API_URL = 'http://172.30.70.96:5000';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();

  const handleLogin = async () => {
    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        await login(data.access_token, data.user); 
        router.replace('/(tabs)'); // 登入成功後，替換路由到主頁
      } else {
        Alert.alert('登入失敗', data.error || '發生未知錯誤');
      }
    } catch (error) {
      Alert.alert('網路錯誤', '無法連接到伺服器');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#4b7aa8ff', '#a4fff7ff']}
        style={StyleSheet.absoluteFill}
      />
      <Text style={styles.title}>登入</Text>
      <TextInput style={styles.input} placeholder="電子郵件" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
      <TextInput style={styles.input} placeholder="密碼" value={password} onChangeText={setPassword} secureTextEntry />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>登入</Text>
      </TouchableOpacity>
      <Link href="/register" style={styles.link}>
        還沒有帳號？ 前往註冊
      </Link>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { color: '#101d3aff', fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginBottom: 40 },
  input: { height: 50, borderWidth: 1.2, borderColor: '#ccc', borderRadius: 8, paddingHorizontal: 15, marginBottom: 20, fontSize: 16 },
  button: { backgroundColor: '#007AFF', paddingVertical: 15, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  link: { marginTop: 20, textAlign: 'center', color: '#007AFF' },
});