import React from 'react';
import { Tabs } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';

export default function TabLayout() {
  return (
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
          title: '匯率換算',
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
  );
}