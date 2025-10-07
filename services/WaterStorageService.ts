
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WaterIntake, DailyGoal, WaterReminder, WeeklyProgress } from '../types/WaterTypes';

const KEYS = {
  WATER_INTAKE: 'water_intake',
  DAILY_GOALS: 'daily_goals',
  REMINDERS: 'water_reminders',
  WEEKLY_PROGRESS: 'weekly_progress',
};

export class WaterStorageService {
  // Water Intake Methods
  static async getWaterIntakeForDate(date: string): Promise<WaterIntake[]> {
    try {
      const data = await AsyncStorage.getItem(`${KEYS.WATER_INTAKE}_${date}`);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.log('Error getting water intake:', error);
      return [];
    }
  }

  static async addWaterIntake(intake: WaterIntake): Promise<void> {
    try {
      const existingData = await this.getWaterIntakeForDate(intake.date);
      const updatedData = [...existingData, intake];
      await AsyncStorage.setItem(`${KEYS.WATER_INTAKE}_${intake.date}`, JSON.stringify(updatedData));
      console.log('Water intake added:', intake);
    } catch (error) {
      console.log('Error adding water intake:', error);
    }
  }

  static async removeWaterIntake(intakeId: string, date: string): Promise<void> {
    try {
      const existingData = await this.getWaterIntakeForDate(date);
      const updatedData = existingData.filter(item => item.id !== intakeId);
      await AsyncStorage.setItem(`${KEYS.WATER_INTAKE}_${date}`, JSON.stringify(updatedData));
      console.log('Water intake removed:', intakeId);
    } catch (error) {
      console.log('Error removing water intake:', error);
    }
  }

  // Daily Goals Methods
  static async getDailyGoal(date: string): Promise<number> {
    try {
      const data = await AsyncStorage.getItem(`${KEYS.DAILY_GOALS}_${date}`);
      return data ? JSON.parse(data).amount : 2000; // Default 2L
    } catch (error) {
      console.log('Error getting daily goal:', error);
      return 2000;
    }
  }

  static async setDailyGoal(date: string, amount: number): Promise<void> {
    try {
      const goal: DailyGoal = { amount, date };
      await AsyncStorage.setItem(`${KEYS.DAILY_GOALS}_${date}`, JSON.stringify(goal));
      console.log('Daily goal set:', goal);
    } catch (error) {
      console.log('Error setting daily goal:', error);
    }
  }

  // Reminders Methods
  static async getReminders(): Promise<WaterReminder[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.REMINDERS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.log('Error getting reminders:', error);
      return [];
    }
  }

  static async saveReminders(reminders: WaterReminder[]): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.REMINDERS, JSON.stringify(reminders));
      console.log('Reminders saved:', reminders);
    } catch (error) {
      console.log('Error saving reminders:', error);
    }
  }

  // Weekly Progress Methods
  static async getWeeklyProgress(startDate: string, endDate: string): Promise<WeeklyProgress[]> {
    try {
      const progress: WeeklyProgress[] = [];
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
        const dateStr = date.toISOString().split('T')[0];
        const intakes = await this.getWaterIntakeForDate(dateStr);
        const goal = await this.getDailyGoal(dateStr);
        const totalIntake = intakes.reduce((sum, intake) => sum + intake.amount, 0);
        const percentage = Math.min((totalIntake / goal) * 100, 100);
        
        progress.push({
          date: dateStr,
          totalIntake,
          goalAmount: goal,
          percentage,
        });
      }
      
      return progress;
    } catch (error) {
      console.log('Error getting weekly progress:', error);
      return [];
    }
  }

  // Utility Methods
  static async clearAllData(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const waterKeys = keys.filter(key => 
        key.startsWith(KEYS.WATER_INTAKE) || 
        key.startsWith(KEYS.DAILY_GOALS) || 
        key === KEYS.REMINDERS || 
        key === KEYS.WEEKLY_PROGRESS
      );
      await AsyncStorage.multiRemove(waterKeys);
      console.log('All water data cleared');
    } catch (error) {
      console.log('Error clearing data:', error);
    }
  }
}
