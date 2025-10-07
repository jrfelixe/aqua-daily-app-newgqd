
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles } from '@/styles/commonStyles';
import { WaterReminder } from '@/types/WaterTypes';
import { WaterStorageService } from '@/services/WaterStorageService';
import { NotificationService } from '@/services/NotificationService';

export default function RemindersScreen() {
  const [reminders, setReminders] = useState<WaterReminder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReminders();
    requestNotificationPermissions();
  }, []);

  const requestNotificationPermissions = async () => {
    const hasPermission = await NotificationService.requestPermissions();
    if (!hasPermission) {
      Alert.alert(
        'Notifications Disabled',
        'To receive water reminders, please enable notifications in your device settings.',
        [{ text: 'OK' }]
      );
    }
  };

  const loadReminders = async () => {
    try {
      setLoading(true);
      const savedReminders = await WaterStorageService.getReminders();
      
      // If no reminders exist, create default ones
      if (savedReminders.length === 0) {
        const defaultReminders: WaterReminder[] = [
          {
            id: '1',
            time: '08:00',
            enabled: true,
            message: 'Good morning! Start your day with a glass of water.',
          },
          {
            id: '2',
            time: '12:00',
            enabled: true,
            message: 'Lunch time hydration! Don\'t forget to drink water.',
          },
          {
            id: '3',
            time: '16:00',
            enabled: true,
            message: 'Afternoon reminder: Time for some water!',
          },
          {
            id: '4',
            time: '20:00',
            enabled: true,
            message: 'Evening hydration check! How\'s your water intake today?',
          },
        ];
        
        await WaterStorageService.saveReminders(defaultReminders);
        setReminders(defaultReminders);
        
        // Schedule notifications for enabled reminders
        for (const reminder of defaultReminders) {
          if (reminder.enabled) {
            await NotificationService.scheduleWaterReminder(reminder);
          }
        }
      } else {
        setReminders(savedReminders);
      }
      
      console.log('Loaded reminders:', savedReminders.length);
    } catch (error) {
      console.log('Error loading reminders:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleReminder = async (reminderId: string) => {
    try {
      const updatedReminders = reminders.map(reminder => {
        if (reminder.id === reminderId) {
          return { ...reminder, enabled: !reminder.enabled };
        }
        return reminder;
      });
      
      setReminders(updatedReminders);
      await WaterStorageService.saveReminders(updatedReminders);
      
      // Update notification scheduling
      const toggledReminder = updatedReminders.find(r => r.id === reminderId);
      if (toggledReminder) {
        if (toggledReminder.enabled) {
          await NotificationService.scheduleWaterReminder(toggledReminder);
        } else {
          // Cancel the specific reminder (we'll cancel all and reschedule for simplicity)
          await NotificationService.cancelAllReminders();
          
          // Reschedule all enabled reminders
          for (const reminder of updatedReminders) {
            if (reminder.enabled) {
              await NotificationService.scheduleWaterReminder(reminder);
            }
          }
        }
      }
      
      console.log('Reminder toggled:', reminderId);
    } catch (error) {
      console.log('Error toggling reminder:', error);
      Alert.alert('Error', 'Failed to update reminder. Please try again.');
    }
  };

  const addNewReminder = () => {
    Alert.alert(
      'Add Reminder',
      'This feature will be available in a future update. You can customize the existing reminders for now.',
      [{ text: 'OK' }]
    );
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const renderReminderCard = (reminder: WaterReminder) => (
    <View key={reminder.id} style={styles.reminderCard}>
      <View style={styles.reminderHeader}>
        <View style={styles.reminderInfo}>
          <Text style={styles.reminderTime}>{formatTime(reminder.time)}</Text>
          <Text style={styles.reminderMessage}>{reminder.message}</Text>
        </View>
        <Switch
          value={reminder.enabled}
          onValueChange={() => toggleReminder(reminder.id)}
          trackColor={{ false: colors.border, true: colors.highlight }}
          thumbColor={reminder.enabled ? colors.primary : colors.textSecondary}
        />
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={commonStyles.centerContent}>
          <Text style={commonStyles.text}>Loading reminders...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={commonStyles.container}>
      <Stack.Screen
        options={{
          title: 'Reminders',
          headerShown: Platform.OS === 'ios',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <IconSymbol name="chevron.left" size={24} color={colors.primary} />
            </TouchableOpacity>
          ),
        }}
      />
      
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={commonStyles.title}>Water Reminders</Text>
          <Text style={commonStyles.textSecondary}>
            Set up notifications to help you stay hydrated throughout the day
          </Text>
        </View>

        {/* Reminders List */}
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {reminders.map(renderReminderCard)}
          
          {/* Add New Reminder Button */}
          <TouchableOpacity style={styles.addButton} onPress={addNewReminder}>
            <IconSymbol name="plus.circle" size={24} color={colors.primary} />
            <Text style={styles.addButtonText}>Add New Reminder</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <IconSymbol name="info.circle" size={20} color={colors.accent} />
            <Text style={styles.infoText}>
              Make sure notifications are enabled in your device settings to receive reminders.
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Platform.OS !== 'ios' ? 100 : 20,
  },
  reminderCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
  },
  reminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reminderInfo: {
    flex: 1,
    marginRight: 16,
  },
  reminderTime: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  reminderMessage: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: 8,
  },
  infoSection: {
    marginTop: 20,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.accent,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 8,
    lineHeight: 16,
  },
});
