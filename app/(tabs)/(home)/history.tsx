
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles } from '@/styles/commonStyles';
import { WeeklyProgress } from '@/types/WaterTypes';
import { WaterStorageService } from '@/services/WaterStorageService';

export default function HistoryScreen() {
  const [weeklyData, setWeeklyData] = useState<WeeklyProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWeekOffset, setSelectedWeekOffset] = useState(0); // 0 = current week, -1 = last week, etc.

  useEffect(() => {
    loadWeeklyData();
  }, [selectedWeekOffset]);

  const loadWeeklyData = async () => {
    try {
      setLoading(true);
      
      // Calculate week start and end dates
      const today = new Date();
      const currentWeekStart = new Date(today);
      currentWeekStart.setDate(today.getDate() - today.getDay() + (selectedWeekOffset * 7));
      
      const weekEnd = new Date(currentWeekStart);
      weekEnd.setDate(currentWeekStart.getDate() + 6);
      
      const startDate = currentWeekStart.toISOString().split('T')[0];
      const endDate = weekEnd.toISOString().split('T')[0];
      
      const data = await WaterStorageService.getWeeklyProgress(startDate, endDate);
      setWeeklyData(data);
      
      console.log('Loaded weekly data:', data.length, 'days');
    } catch (error) {
      console.log('Error loading weekly data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getWeekTitle = () => {
    if (selectedWeekOffset === 0) return 'This Week';
    if (selectedWeekOffset === -1) return 'Last Week';
    return `${Math.abs(selectedWeekOffset)} weeks ago`;
  };

  const renderDayCard = (day: WeeklyProgress) => {
    const isToday = day.date === new Date().toISOString().split('T')[0];
    const progressColor = day.percentage >= 100 ? colors.success : 
                         day.percentage >= 75 ? colors.primary :
                         day.percentage >= 50 ? colors.accent : colors.secondary;

    return (
      <View key={day.date} style={[styles.dayCard, isToday && styles.todayCard]}>
        <View style={styles.dayHeader}>
          <Text style={[styles.dayTitle, isToday && styles.todayText]}>
            {formatDate(day.date)}
            {isToday && ' (Today)'}
          </Text>
          <Text style={[styles.percentageText, { color: progressColor }]}>
            {Math.round(day.percentage)}%
          </Text>
        </View>
        
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { 
                width: `${Math.min(day.percentage, 100)}%`,
                backgroundColor: progressColor,
              }
            ]} 
          />
        </View>
        
        <View style={styles.dayStats}>
          <View style={styles.statItem}>
            <IconSymbol name="drop.fill" size={16} color={colors.primary} />
            <Text style={styles.statText}>{day.totalIntake}ml</Text>
          </View>
          <View style={styles.statItem}>
            <IconSymbol name="target" size={16} color={colors.textSecondary} />
            <Text style={styles.statText}>{day.goalAmount}ml</Text>
          </View>
        </View>
        
        {day.percentage >= 100 && (
          <View style={styles.achievedBadge}>
            <IconSymbol name="checkmark.circle.fill" size={16} color={colors.success} />
            <Text style={styles.achievedText}>Goal Achieved!</Text>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={commonStyles.centerContent}>
          <Text style={commonStyles.text}>Loading history...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={commonStyles.container}>
      <Stack.Screen
        options={{
          title: 'History',
          headerShown: Platform.OS === 'ios',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <IconSymbol name="chevron.left" size={24} color={colors.primary} />
            </TouchableOpacity>
          ),
        }}
      />
      
      <View style={styles.container}>
        {/* Week Navigation */}
        <View style={styles.weekNavigation}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => setSelectedWeekOffset(selectedWeekOffset - 1)}
          >
            <IconSymbol name="chevron.left" size={20} color={colors.primary} />
          </TouchableOpacity>
          
          <Text style={styles.weekTitle}>{getWeekTitle()}</Text>
          
          <TouchableOpacity
            style={[styles.navButton, selectedWeekOffset >= 0 && styles.navButtonDisabled]}
            onPress={() => setSelectedWeekOffset(selectedWeekOffset + 1)}
            disabled={selectedWeekOffset >= 0}
          >
            <IconSymbol 
              name="chevron.right" 
              size={20} 
              color={selectedWeekOffset >= 0 ? colors.textSecondary : colors.primary} 
            />
          </TouchableOpacity>
        </View>

        {/* Weekly Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Weekly Summary</Text>
          <View style={styles.summaryStats}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>
                {weeklyData.reduce((sum, day) => sum + day.totalIntake, 0)}ml
              </Text>
              <Text style={styles.summaryLabel}>Total Intake</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>
                {weeklyData.filter(day => day.percentage >= 100).length}/7
              </Text>
              <Text style={styles.summaryLabel}>Goals Met</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>
                {Math.round(weeklyData.reduce((sum, day) => sum + day.percentage, 0) / 7)}%
              </Text>
              <Text style={styles.summaryLabel}>Avg Progress</Text>
            </View>
          </View>
        </View>

        {/* Daily History */}
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {weeklyData.map(renderDayCard)}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  weekNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  navButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.card,
    elevation: 1,
    boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.1)',
  },
  navButtonDisabled: {
    backgroundColor: colors.background,
  },
  weekTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  summaryCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
  },
  summaryLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Platform.OS !== 'ios' ? 100 : 20,
  },
  dayCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
  },
  todayCard: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dayTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  todayText: {
    color: colors.primary,
  },
  percentageText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.background,
    borderRadius: 4,
    marginBottom: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  dayStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 4,
  },
  achievedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.success,
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginTop: 8,
  },
  achievedText: {
    color: colors.card,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
});
