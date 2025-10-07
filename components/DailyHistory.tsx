
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { IconSymbol } from './IconSymbol';
import { colors } from '../styles/commonStyles';
import { WaterIntake } from '../types/WaterTypes';

interface DailyHistoryProps {
  intakes: WaterIntake[];
  onRemoveIntake: (intakeId: string) => void;
}

const DailyHistory: React.FC<DailyHistoryProps> = ({ intakes, onRemoveIntake }) => {
  const formatTime = (timestamp: Date) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const totalAmount = intakes.reduce((sum, intake) => sum + intake.amount, 0);

  if (intakes.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Today's History</Text>
        <View style={styles.emptyState}>
          <IconSymbol name="drop" size={48} color={colors.textSecondary} />
          <Text style={styles.emptyText}>No water logged yet today</Text>
          <Text style={styles.emptySubtext}>Start tracking your hydration!</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Today's History</Text>
        <Text style={styles.totalText}>Total: {totalAmount}ml</Text>
      </View>
      
      <ScrollView style={styles.historyList} showsVerticalScrollIndicator={false}>
        {intakes.map((intake) => (
          <View key={intake.id} style={styles.historyItem}>
            <View style={styles.intakeInfo}>
              <IconSymbol name="drop.fill" size={20} color={colors.primary} />
              <View style={styles.intakeDetails}>
                <Text style={styles.amountText}>{intake.amount}ml</Text>
                <Text style={styles.timeText}>{formatTime(intake.timestamp)}</Text>
              </View>
            </View>
            
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => onRemoveIntake(intake.id)}
            >
              <IconSymbol name="trash" size={16} color={colors.secondary} />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  totalText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  historyList: {
    maxHeight: 200,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    elevation: 1,
    boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.1)',
  },
  intakeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  intakeDetails: {
    marginLeft: 12,
  },
  amountText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  timeText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  removeButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: colors.background,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
});

export default DailyHistory;
