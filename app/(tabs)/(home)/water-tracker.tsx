
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useFocusEffect } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles } from '@/styles/commonStyles';
import WaterProgressBottle from '@/components/WaterProgressBottle';
import QuickAddButtons from '@/components/QuickAddButtons';
import DailyHistory from '@/components/DailyHistory';
import { WaterIntake, DEFAULT_DAILY_GOAL } from '@/types/WaterTypes';
import { WaterStorageService } from '@/services/WaterStorageService';
import { NotificationService } from '@/services/NotificationService';

export default function WaterTrackerScreen() {
  const [currentAmount, setCurrentAmount] = useState(0);
  const [dailyGoal, setDailyGoal] = useState(DEFAULT_DAILY_GOAL);
  const [todayIntakes, setTodayIntakes] = useState<WaterIntake[]>([]);
  const [customAmount, setCustomAmount] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split('T')[0];

  // Load data when screen focuses
  useFocusEffect(
    useCallback(() => {
      loadTodayData();
    }, [])
  );

  const loadTodayData = async () => {
    try {
      setLoading(true);
      const [intakes, goal] = await Promise.all([
        WaterStorageService.getWaterIntakeForDate(today),
        WaterStorageService.getDailyGoal(today),
      ]);

      setTodayIntakes(intakes);
      setDailyGoal(goal);
      
      const total = intakes.reduce((sum, intake) => sum + intake.amount, 0);
      setCurrentAmount(total);
      
      console.log('Loaded today data:', { intakes: intakes.length, total, goal });
    } catch (error) {
      console.log('Error loading today data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addWaterIntake = async (amount: number) => {
    try {
      const intake: WaterIntake = {
        id: Date.now().toString(),
        amount,
        timestamp: new Date(),
        date: today,
      };

      await WaterStorageService.addWaterIntake(intake);
      
      const newTotal = currentAmount + amount;
      const newIntakes = [...todayIntakes, intake];
      
      setCurrentAmount(newTotal);
      setTodayIntakes(newIntakes);
      setCustomAmount('');
      setShowCustomInput(false);

      // Check if goal is achieved
      const previousPercentage = (currentAmount / dailyGoal) * 100;
      const newPercentage = (newTotal / dailyGoal) * 100;
      
      if (previousPercentage < 100 && newPercentage >= 100) {
        await NotificationService.scheduleGoalAchievedNotification();
      }

      console.log('Water intake added:', amount, 'ml. New total:', newTotal);
    } catch (error) {
      console.log('Error adding water intake:', error);
      Alert.alert('Error', 'Failed to add water intake. Please try again.');
    }
  };

  const removeWaterIntake = async (intakeId: string) => {
    try {
      const intakeToRemove = todayIntakes.find(intake => intake.id === intakeId);
      if (!intakeToRemove) return;

      await WaterStorageService.removeWaterIntake(intakeId, today);
      
      const newTotal = currentAmount - intakeToRemove.amount;
      const newIntakes = todayIntakes.filter(intake => intake.id !== intakeId);
      
      setCurrentAmount(newTotal);
      setTodayIntakes(newIntakes);

      console.log('Water intake removed:', intakeToRemove.amount, 'ml. New total:', newTotal);
    } catch (error) {
      console.log('Error removing water intake:', error);
      Alert.alert('Error', 'Failed to remove water intake. Please try again.');
    }
  };

  const handleCustomAmountAdd = () => {
    const amount = parseInt(customAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount in ml.');
      return;
    }
    if (amount > 2000) {
      Alert.alert('Large Amount', 'That seems like a lot of water at once. Are you sure?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Add Anyway', onPress: () => addWaterIntake(amount) },
      ]);
      return;
    }
    addWaterIntake(amount);
  };

  const percentage = Math.min((currentAmount / dailyGoal) * 100, 100);

  if (loading) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={commonStyles.centerContent}>
          <Text style={commonStyles.text}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={commonStyles.container}>
      <Stack.Screen
        options={{
          title: 'Water Tracker',
          headerShown: Platform.OS === 'ios',
        }}
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={commonStyles.title}>Stay Hydrated</Text>
          <Text style={commonStyles.textSecondary}>
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Text>
        </View>

        {/* Water Progress */}
        <View style={styles.progressSection}>
          <WaterProgressBottle
            currentAmount={currentAmount}
            goalAmount={dailyGoal}
            size="large"
          />
        </View>

        {/* Quick Add Buttons */}
        <View style={styles.quickAddSection}>
          <QuickAddButtons onAddWater={addWaterIntake} />
        </View>

        {/* Custom Amount Input */}
        <View style={styles.customSection}>
          {!showCustomInput ? (
            <TouchableOpacity
              style={styles.customButton}
              onPress={() => setShowCustomInput(true)}
            >
              <IconSymbol name="plus.circle" size={20} color={colors.accent} />
              <Text style={styles.customButtonText}>Custom Amount</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.customInputContainer}>
              <TextInput
                style={styles.customInput}
                placeholder="Enter amount in ml"
                placeholderTextColor={colors.textSecondary}
                value={customAmount}
                onChangeText={setCustomAmount}
                keyboardType="numeric"
                autoFocus
              />
              <View style={styles.customInputButtons}>
                <TouchableOpacity
                  style={[styles.customInputButton, styles.cancelButton]}
                  onPress={() => {
                    setShowCustomInput(false);
                    setCustomAmount('');
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.customInputButton, styles.addButton]}
                  onPress={handleCustomAmountAdd}
                >
                  <Text style={styles.addButtonText}>Add</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Daily History */}
        <View style={styles.historySection}>
          <DailyHistory
            intakes={todayIntakes}
            onRemoveIntake={removeWaterIntake}
          />
        </View>

        {/* Goal Status */}
        <View style={styles.goalSection}>
          {percentage >= 100 ? (
            <View style={styles.goalAchieved}>
              <IconSymbol name="checkmark.circle.fill" size={24} color={colors.success} />
              <Text style={styles.goalAchievedText}>
                Congratulations! You've reached your daily goal!
              </Text>
            </View>
          ) : (
            <View style={styles.goalProgress}>
              <Text style={styles.goalProgressText}>
                {Math.round(dailyGoal - currentAmount)}ml more to reach your goal
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: Platform.OS !== 'ios' ? 100 : 20, // Extra padding for floating tab bar
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  progressSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  quickAddSection: {
    marginBottom: 20,
  },
  customSection: {
    marginBottom: 20,
  },
  customButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.accent,
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  customButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.accent,
    marginLeft: 8,
  },
  customInputContainer: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
  },
  customInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    marginBottom: 12,
  },
  customInputButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  customInputButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  addButton: {
    backgroundColor: colors.primary,
  },
  cancelButtonText: {
    color: colors.text,
    fontWeight: '600',
  },
  addButtonText: {
    color: colors.card,
    fontWeight: '600',
  },
  historySection: {
    marginBottom: 20,
  },
  goalSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  goalAchieved: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  goalAchievedText: {
    color: colors.card,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    textAlign: 'center',
  },
  goalProgress: {
    backgroundColor: colors.card,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  goalProgressText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
});
