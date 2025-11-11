import React, { useRef, useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native'; 
import { router } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { useDailyQuests } from '../../hooks/useDailyQuests';
import { DailyQuestsModal } from '../../components/DailyQuestsModal';
import { funFacts } from '../../data/funFacts';  

export default function IndexScreen() {
  const animationRef = useRef<LottieView>(null);

  useEffect(() => {
    animationRef.current?.play();
  }, []);

  const [modalVisible, setModalVisible] = useState(false);
  const { quests, completedQuests, completeQuest, isLoading } = useDailyQuests();
  const uncompletedQuestsCount = quests.length - completedQuests.size;

  const handleStart = () => {
    router.push('/(tabs)/recognize');
  };

  const showRandomFact = () => {
    const randomIndex = Math.floor(Math.random() * funFacts.length);
    const fact = funFacts[randomIndex];
    
    Alert.alert(
      "貨幣小知識 💡", 
      fact,          
      [{ text: "知道了" }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#2c3e50', '#66ddf1ff']}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.topLeftButtons}>
        {/* 每日任務按鈕 */}
        <TouchableOpacity style={styles.iconButton} onPress={() => setModalVisible(true)}>
          <FontAwesome5 name="tasks" size={24} color="white" />
          {uncompletedQuestsCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{uncompletedQuestsCount}</Text>
            </View>
          )}
        </TouchableOpacity>

        {/*  隨機知識點按鈕 */}
        <TouchableOpacity style={styles.iconButton} onPress={showRandomFact}>
          <FontAwesome5 name="lightbulb" size={24} color="white" />
        </TouchableOpacity>
      </View>

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

      {/* 每日任務 Modal */}
      {isLoading ? (
        <ActivityIndicator />
      ) : (
        <DailyQuestsModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          quests={quests}
          completedQuests={completedQuests}
          onCompleteQuest={completeQuest}
        />
      )}
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
    badge: { position: 'absolute', top: -5, right: -5, backgroundColor: '#f44336', borderRadius: 10, width: 20, height: 20, justifyContent: 'center', alignItems: 'center' },
    badgeText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
    topLeftButtons: { position: 'absolute', top: 150, left: 20, zIndex: 10, flexDirection: 'column', gap: 15 },
    iconButton: { backgroundColor: 'rgba(0,0,0,0.3)', width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
});