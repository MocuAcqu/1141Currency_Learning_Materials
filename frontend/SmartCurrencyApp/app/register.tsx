import React, { useState } from 'react';
import { Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, router } from 'expo-router';

const API_URL = 'http://172.30.70.96:5000';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    try {
      const response = await fetch(`${API_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, password }),
      });
      const data = await response.json();
      if (response.ok) {
        Alert.alert('註冊成功', '您現在可以登入了！');
        router.replace('/login'); // 註冊成功後跳轉到登入頁
      } else {
        Alert.alert('註冊失敗', data.error || '發生未知錯誤');
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
      <Text style={styles.title}>註冊</Text>
      <TextInput style={styles.input} placeholder="使用者名稱" value={username} onChangeText={setUsername} />
      <TextInput style={styles.input} placeholder="電子郵件" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
      <TextInput style={styles.input} placeholder="密碼" value={password} onChangeText={setPassword} secureTextEntry />
      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>註冊</Text>
      </TouchableOpacity>
      <Link href="/login" style={styles.link}>
        已經有帳號了？ 前往登入
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