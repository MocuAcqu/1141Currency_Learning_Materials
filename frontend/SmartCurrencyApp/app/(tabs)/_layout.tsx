import React from 'react';
import { Tabs, router } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { RatesProvider } from '../../contexts/RatesContext';
import { useAuth } from '../../contexts/AuthContext';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';

function AuthButton() {
  const { isAuthenticated, logout, user } = useAuth();

  const handleLogout = () => {
    logout();
  };

  if (!isAuthenticated || !user) {
    return (
      <TouchableOpacity onPress={() => router.push('/login')} style={styles.headerButton}>
        <Text style={styles.headerButtonText}>登入</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.headerRightContainer}>
      <Text style={styles.usernameText}>@ {user.username}</Text>
      <TouchableOpacity onPress={handleLogout} style={styles.headerButton}>
        <Text style={styles.headerButtonText}>登出</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function TabLayout() {
  return (
    <RatesProvider>
      <Tabs screenOptions={{ tabBarActiveTintColor: 'blue',headerRight: () => <AuthButton />, }}>
        <Tabs.Screen
          name="index"
          options={{
            title: '首頁',
            tabBarIcon: ({ color }) => <FontAwesome5 name="home" size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="recognize"
          options={{
            title: '貨幣辨識',
            tabBarIcon: ({ color }) => <FontAwesome5 name="camera" size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="converter"
          options={{
            title: '貨幣換算',
            tabBarIcon: ({ color }) => <FontAwesome5 name="exchange-alt" size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="collection"
          options={{
            title: '集幣冊',
            tabBarIcon: ({ color }) => <FontAwesome5 name="book-open" size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="currencies/[code]" 
          options={{
            title: "貨幣詳情",
            href: null,
          }}
        />
      </Tabs>
    </RatesProvider>
    
  );
}

const styles = StyleSheet.create({
  headerRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  usernameText: {
    marginRight: 10,
    fontSize: 16,
    color: '#8d8d8dff',
  },
  headerButton: {
    padding: 5,
  },
  headerButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
});