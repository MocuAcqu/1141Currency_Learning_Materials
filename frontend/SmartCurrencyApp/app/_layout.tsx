import { Stack, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { useEffect } from 'react';
import { RatesProvider } from '../contexts/RatesContext';
import { View, ActivityIndicator } from 'react-native';

const InitialLayout = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return; 

    //const inAuthGroup = segments[0] === '(auth)';
    const inAppGroup = segments[0] === '(tabs)';

    if (isAuthenticated && !inAppGroup) {
      // 如果已登入，但不在主 App 區域，導向到主頁
      router.replace('/(tabs)');
    } else if (!isAuthenticated && inAppGroup) {
      // 如果未登入，但嘗試訪問主 App 區域，導向到登入頁
      router.replace('/login');
    }

  }, [isAuthenticated, isLoading, segments]);
  
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="login" options={{
          headerShown: true,
          title: "登入"
      }}/>
      <Stack.Screen name="register" options={{
          headerShown: true,
          title: "建立帳號"
      }}/>
    </Stack>
  );
};

export default function RootLayout() {
  return (
    <AuthProvider>
      <RatesProvider>
        <InitialLayout />
      </RatesProvider>
    </AuthProvider>
  );
}