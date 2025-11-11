import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { cultureQuestions, CultureQuestion } from '../data/questions';
import { useRates } from '../contexts/RatesContext';

export type Quest = (CultureQuestion & { type: 'culture' }) | {
  type: 'conversion';
  question: string;
  options: string[];
  correctAnswer: string;
};

const QUESTS_KEY = '@daily_quests';
const NUM_CULTURE_QUESTS = 2;
const NUM_CONVERSION_QUESTS = 3;

// Helper: 隨機打亂陣列
const shuffleArray = <T,>(array: T[]): T[] => {
  return [...array].sort(() => Math.random() - 0.5);
};

export const useDailyQuests = () => {
  const { ratesData } = useRates();
  const [quests, setQuests] = useState<Quest[]>([]);
  const [completedQuests, setCompletedQuests] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  const generateQuests = () => {
    if (!ratesData) return [];
    let newQuests: Quest[] = [];

    // 生成文化題
    const shuffledCultureQuestions = shuffleArray(cultureQuestions);
    for (let i = 0; i < NUM_CULTURE_QUESTS; i++) {
      newQuests.push({ ...shuffledCultureQuestions[i], type: 'culture' });
    }
    
    // 生成換算題
    const currencyCodes = Object.keys(ratesData.rates);
    for (let i = 0; i < NUM_CONVERSION_QUESTS; i++) {
      const shuffledCodes = shuffleArray(currencyCodes);
      const fromCurrency = shuffledCodes[0];
      const toCurrency = shuffledCodes[1];
      const amount = Math.floor(Math.random() * 9 + 1) * 100; // 100, 200, ..., 900
      
      const rateFrom = ratesData.rates[fromCurrency];
      const rateTo = ratesData.rates[toCurrency];
      const finalRate = rateTo / rateFrom;
      const correctAnswerValue = (amount * finalRate);

      // 產生三個錯誤答案
      let wrongAnswers: string[] = [];
      while (wrongAnswers.length < 3) {
        const offset = (Math.random() - 0.5) * 0.5; // -25% to +25%
        const wrongValue = correctAnswerValue * (1 + offset);
        if (Math.abs(wrongValue - correctAnswerValue) > 0.01) { // 避免錯誤答案太接近
          wrongAnswers.push(wrongValue.toFixed(2));
        }
      }

      const options = shuffleArray([...wrongAnswers, correctAnswerValue.toFixed(2)]);

      newQuests.push({
        type: 'conversion',
        question: `請問 ${amount} ${fromCurrency} 大約等於多少 ${toCurrency}？`,
        options,
        correctAnswer: correctAnswerValue.toFixed(2),
      });
    }
    return shuffleArray(newQuests);
  };
  
  useEffect(() => {
    const loadQuests = async () => {
      setIsLoading(true);
      const today = new Date().toISOString().split('T')[0];
      const storedData = await AsyncStorage.getItem(QUESTS_KEY);

      if (storedData) {
        const { date, quests: storedQuests, completed } = JSON.parse(storedData);
        if (date === today) {
          setQuests(storedQuests);
          setCompletedQuests(new Set(completed));
          setIsLoading(false);
          return;
        }
      }
      
      // 如果沒有今天或沒有匯率資料，則等待
      if (!ratesData) {
          setIsLoading(false); // 稍後匯率載入後會重新觸發
          return;
      }
      
      const newQuests = generateQuests();
      setQuests(newQuests);
      setCompletedQuests(new Set());
      await AsyncStorage.setItem(QUESTS_KEY, JSON.stringify({ date: today, quests: newQuests, completed: [] }));
      setIsLoading(false);
    };

    loadQuests();
  }, [ratesData]); // 當匯率資料載入後，重新執行

  const completeQuest = async (questIndex: number) => {
    const newCompleted = new Set(completedQuests);
    newCompleted.add(questIndex);
    setCompletedQuests(newCompleted);

    const today = new Date().toISOString().split('T')[0];
    await AsyncStorage.setItem(QUESTS_KEY, JSON.stringify({ date: today, quests, completed: Array.from(newCompleted) }));
  };

  return { quests, completedQuests, completeQuest, isLoading };
};