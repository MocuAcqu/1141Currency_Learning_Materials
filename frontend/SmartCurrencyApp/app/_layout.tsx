import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    // 用 SafeAreaProvider 包裹你的整個 App
    <SafeAreaProvider>
      <Stack>
        {/* 定義你的主要畫面路由 */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="quiz" options={{ title: '隨堂測驗' }} />
      </Stack>
    </SafeAreaProvider>
  );
}