
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  Platform 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles } from '@/styles/commonStyles';
import { WaterStorageService } from '@/services/WaterStorageService';
import { NotificationService } from '@/services/NotificationService';

export default function ProfileScreen() {
  const [dailyGoal, setDailyGoal] = useState(2000);
  const [totalDaysTracked, setTotalDaysTracked] = useState(0);
  const [averageIntake, setAverageIntake] = useState(0);

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const goal = await WaterStorageService.getDailyGoal(today);
      setDailyGoal(goal);
      
      // Calculate some basic stats (simplified for demo)
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - 7);
      const weekEnd = new Date();
      
      const weeklyProgress = await WaterStorageService.getWeeklyProgress(
        weekStart.toISOString().split('T')[0],
        weekEnd.toISOString().split('T')[0]
      );
      
      const daysWithData = weeklyProgress.filter(day => day.totalIntake > 0).length;
      const totalIntake = weeklyProgress.reduce((sum, day) => sum + day.totalIntake, 0);
      const avgIntake = daysWithData > 0 ? Math.round(totalIntake / daysWithData) : 0;
      
      setTotalDaysTracked(daysWithData);
      setAverageIntake(avgIntake);
      
      console.log('Profile data loaded:', { goal, daysWithData, avgIntake });
    } catch (error) {
      console.log('Error loading profile data:', error);
    }
  };

  const handleGoalChange = () => {
    Alert.alert(
      'Change Daily Goal',
      'Select your new daily water intake goal:',
      [
        { text: '1.5L (1500ml)', onPress: () => updateDailyGoal(1500) },
        { text: '2L (2000ml)', onPress: () => updateDailyGoal(2000) },
        { text: '2.5L (2500ml)', onPress: () => updateDailyGoal(2500) },
        { text: '3L (3000ml)', onPress: () => updateDailyGoal(3000) },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const updateDailyGoal = async (newGoal: number) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      await WaterStorageService.setDailyGoal(today, newGoal);
      setDailyGoal(newGoal);
      Alert.alert('Success', `Daily goal updated to ${newGoal}ml`);
    } catch (error) {
      console.log('Error updating daily goal:', error);
      Alert.alert('Error', 'Failed to update daily goal. Please try again.');
    }
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all your water intake data, history, and reminders. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear Data', 
          style: 'destructive',
          onPress: async () => {
            try {
              await WaterStorageService.clearAllData();
              await NotificationService.cancelAllReminders();
              Alert.alert('Success', 'All data has been cleared.');
              loadProfileData(); // Reload to show empty state
            } catch (error) {
              console.log('Error clearing data:', error);
              Alert.alert('Error', 'Failed to clear data. Please try again.');
            }
          }
        },
      ]
    );
  };

  const settingsItems = [
    {
      title: 'Daily Goal',
      description: `${dailyGoal}ml per day`,
      icon: 'target',
      onPress: handleGoalChange,
      color: colors.primary,
    },
    {
      title: 'Notifications',
      description: 'Manage water reminders',
      icon: 'bell.fill',
      onPress: () => Alert.alert('Info', 'Go to the Reminders tab to manage your notifications.'),
      color: colors.accent,
    },
    {
      title: 'Clear Data',
      description: 'Reset all tracking data',
      icon: 'trash',
      onPress: handleClearData,
      color: colors.secondary,
    },
  ];

  const renderSettingItem = (item: typeof settingsItems[0]) => (
    <TouchableOpacity key={item.title} style={styles.settingItem} onPress={item.onPress}>
      <View style={[styles.settingIcon, { backgroundColor: item.color }]}>
        <IconSymbol name={item.icon as any} color={colors.card} size={20} />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{item.title}</Text>
        <Text style={styles.settingDescription}>{item.description}</Text>
      </View>
      <IconSymbol name="chevron.right" color={colors.textSecondary} size={16} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={commonStyles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.profileIcon}>
            <IconSymbol name="person.fill" size={40} color={colors.primary} />
          </View>
          <Text style={commonStyles.title}>Your Profile</Text>
          <Text style={commonStyles.textSecondary}>
            Track your hydration journey and customize your experience
          </Text>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <IconSymbol name="drop.fill" size={24} color={colors.primary} />
            <Text style={styles.statValue}>{dailyGoal}ml</Text>
            <Text style={styles.statLabel}>Daily Goal</Text>
          </View>
          
          <View style={styles.statCard}>
            <IconSymbol name="calendar" size={24} color={colors.success} />
            <Text style={styles.statValue}>{totalDaysTracked}</Text>
            <Text style={styles.statLabel}>Days Tracked</Text>
          </View>
          
          <View style={styles.statCard}>
            <IconSymbol name="chart.bar.fill" size={24} color={colors.accent} />
            <Text style={styles.statValue}>{averageIntake}ml</Text>
            <Text style={styles.statLabel}>Avg Intake</Text>
          </View>
        </View>

        {/* Settings */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Settings</Text>
          {settingsItems.map(renderSettingItem)}
        </View>

        {/* About Section */}
        <View style={styles.aboutSection}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.aboutCard}>
            <Text style={styles.aboutText}>
              💧 Hydration Tracker helps you maintain healthy water intake habits. 
              Stay hydrated, stay healthy!
            </Text>
            <Text style={styles.versionText}>Version 1.0.0</Text>
          </View>
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
    paddingBottom: Platform.OS !== 'ios' ? 100 : 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  profileIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.highlight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 1,
    boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  settingsSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    elevation: 1,
    boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  aboutSection: {
    marginBottom: 20,
  },
  aboutCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    elevation: 1,
    boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
  },
  aboutText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    marginBottom: 12,
  },
  versionText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
