
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { WaterReminder } from '../types/WaterTypes';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export class NotificationService {
  static async requestPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      console.log('Notification permission status:', finalStatus);
      return finalStatus === 'granted';
    } catch (error) {
      console.log('Error requesting notification permissions:', error);
      return false;
    }
  }

  static async scheduleWaterReminder(reminder: WaterReminder): Promise<string | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        console.log('No notification permission');
        return null;
      }

      // Parse time string (HH:MM)
      const [hours, minutes] = reminder.time.split(':').map(Number);
      
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '💧 Time to Hydrate!',
          body: reminder.message || 'Don\'t forget to drink some water!',
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: {
          hour: hours,
          minute: minutes,
          repeats: true,
        },
      });

      console.log('Water reminder scheduled:', notificationId);
      return notificationId;
    } catch (error) {
      console.log('Error scheduling water reminder:', error);
      return null;
    }
  }

  static async cancelReminder(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      console.log('Reminder cancelled:', notificationId);
    } catch (error) {
      console.log('Error cancelling reminder:', error);
    }
  }

  static async cancelAllReminders(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('All reminders cancelled');
    } catch (error) {
      console.log('Error cancelling all reminders:', error);
    }
  }

  static async scheduleGoalAchievedNotification(): Promise<void> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return;

      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🎉 Goal Achieved!',
          body: 'Congratulations! You\'ve reached your daily water intake goal!',
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: null, // Show immediately
      });

      console.log('Goal achieved notification sent');
    } catch (error) {
      console.log('Error sending goal achieved notification:', error);
    }
  }

  static async scheduleProgressReminder(percentage: number): Promise<void> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return;

      let message = '';
      if (percentage < 25) {
        message = 'You\'re just getting started! Keep drinking water throughout the day.';
      } else if (percentage < 50) {
        message = 'You\'re 25% there! Keep up the good hydration habits.';
      } else if (percentage < 75) {
        message = 'Halfway to your goal! You\'re doing great with your water intake.';
      } else if (percentage < 100) {
        message = 'Almost there! Just a little more water to reach your daily goal.';
      }

      if (message) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: '💧 Hydration Progress',
            body: message,
            sound: true,
            priority: Notifications.AndroidNotificationPriority.DEFAULT,
          },
          trigger: null, // Show immediately
        });

        console.log('Progress reminder sent:', percentage);
      }
    } catch (error) {
      console.log('Error sending progress reminder:', error);
    }
  }
}
