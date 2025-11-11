import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView, Alert, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { Quest } from '../hooks/useDailyQuests';
import { FontAwesome5 } from '@expo/vector-icons';

interface DailyQuestsModalProps {
  visible: boolean;
  onClose: () => void;
  quests: Quest[];
  completedQuests: Set<number>;
  onCompleteQuest: (questIndex: number) => void;
}

export const DailyQuestsModal = ({ visible, onClose, quests, completedQuests, onCompleteQuest }: DailyQuestsModalProps) => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});

  const handleAnswer = (questIndex: number, answer: string) => {
    if (completedQuests.has(questIndex)) return;

    setSelectedAnswers(prev => ({ ...prev, [questIndex]: answer }));

    if (answer === quests[questIndex].correctAnswer) {
      Alert.alert("答對了！", "恭喜您完成一項任務！");
      onCompleteQuest(questIndex);
    } else {
      Alert.alert("答錯了", `再試一次吧！`);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalView}>
          <View style={styles.header}>
            <Text style={styles.modalTitle}>每日任務</Text>
            <TouchableOpacity onPress={onClose}>
              <FontAwesome5 name="times" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={{width: '100%'}}>
              {quests.map((quest, index) => {
                const isCompleted = completedQuests.has(index);
                
                return (
                  <View key={index} style={[styles.questCard, isCompleted && styles.completedCard]}>
                      <Text style={styles.questionText}>{index + 1}. {quest.question}</Text>
                      {quest.options.map((option, optionIndex) => {
                          const isSelected = selectedAnswers[index] === option;
                          const isCorrect = quests[index].correctAnswer === option;

                          // 宣告 optionStyle 的類型為 StyleProp<ViewStyle>
                          // 這告訴 TypeScript 它可以是單一物件、陣列、或 false 等。
                          let optionStyle: StyleProp<ViewStyle> = styles.optionButton;
                          // 宣告 textStyle 的類型為 StyleProp<TextStyle>
                          let textStyle: StyleProp<TextStyle> = styles.optionText;

                          if (isCompleted && isCorrect) {
                              optionStyle = [styles.optionButton, styles.correctOption];
                              textStyle = [styles.optionText, styles.correctOptionText];
                          } else if (isSelected && !isCorrect) {
                              optionStyle = [styles.optionButton, styles.wrongOption];
                              textStyle = [styles.optionText, styles.wrongOptionText];
                          }

                          return (
                              <TouchableOpacity 
                                  key={optionIndex} 
                                  style={optionStyle}
                                  onPress={() => handleAnswer(index, option)}
                                  disabled={isCompleted}
                              >
                                  <Text style={textStyle}>{option}</Text>
                              </TouchableOpacity>
                          );
                      })}
                  </View>
                )
              })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};


const styles = StyleSheet.create({
    modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
    modalView: { width: '90%', maxHeight: '80%', backgroundColor: 'white', borderRadius: 20, padding: 20, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: 15 },
    modalTitle: { fontSize: 22, fontWeight: 'bold' },
    questCard: { width: '100%', backgroundColor: '#f9f9f9', borderRadius: 10, padding: 15, marginBottom: 15, borderWidth: 1, borderColor: '#eee' },
    completedCard: { backgroundColor: '#e8f5e9', borderColor: '#a5d6a7' },
    questionText: { fontSize: 16, fontWeight: '500', marginBottom: 10, lineHeight: 22 },
    optionButton: { backgroundColor: '#fff', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', marginBottom: 8 },
    optionText: { fontSize: 15, color: '#333' },
    correctOption: { backgroundColor: '#4caf50', borderColor: '#388e3c' },
    correctOptionText: { color: '#fff', fontWeight: 'bold' },
    wrongOption: { backgroundColor: '#f44336', borderColor: '#d32f2f' },
    wrongOptionText: { color: '#fff', fontWeight: 'bold' },
});