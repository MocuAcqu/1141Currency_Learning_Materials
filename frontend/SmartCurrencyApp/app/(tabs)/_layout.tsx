import React from 'react';
import { Tabs } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { RatesProvider } from '../../contexts/RatesContext';

export default function TabLayout() {
  return (
    <RatesProvider>
      <Tabs screenOptions={{ tabBarActiveTintColor: 'blue' }}>
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
      </Tabs>
    </RatesProvider>
    
  );
}