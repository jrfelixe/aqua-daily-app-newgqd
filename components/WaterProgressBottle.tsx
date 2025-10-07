
import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { colors } from '../styles/commonStyles';

interface WaterProgressBottleProps {
  currentAmount: number;
  goalAmount: number;
  size?: 'small' | 'medium' | 'large';
}

const WaterProgressBottle: React.FC<WaterProgressBottleProps> = ({
  currentAmount,
  goalAmount,
  size = 'medium'
}) => {
  const percentage = Math.min((currentAmount / goalAmount) * 100, 100);
  const { width } = Dimensions.get('window');
  
  const bottleSize = {
    small: { width: 60, height: 120 },
    medium: { width: 100, height: 200 },
    large: { width: 120, height: 240 }
  }[size];

  const waterHeight = (percentage / 100) * (bottleSize.height - 40); // Account for bottle neck

  return (
    <View style={styles.container}>
      {/* Bottle */}
      <View style={[styles.bottle, bottleSize]}>
        {/* Bottle neck */}
        <View style={[styles.bottleNeck, { width: bottleSize.width * 0.3 }]} />
        
        {/* Bottle body */}
        <View style={[styles.bottleBody, { 
          width: bottleSize.width, 
          height: bottleSize.height - 20 
        }]}>
          {/* Water fill */}
          <View style={[styles.waterFill, {
            height: waterHeight,
            backgroundColor: percentage >= 100 ? colors.success : colors.primary,
          }]} />
          
          {/* Water surface animation */}
          {percentage > 0 && (
            <View style={[styles.waterSurface, {
              bottom: waterHeight - 2,
              backgroundColor: percentage >= 100 ? colors.success : colors.highlight,
            }]} />
          )}
        </View>
      </View>

      {/* Progress text */}
      <View style={styles.progressText}>
        <Text style={styles.percentageText}>{Math.round(percentage)}%</Text>
        <Text style={styles.amountText}>
          {Math.round(currentAmount)}ml / {goalAmount}ml
        </Text>
      </View>

      {/* Goal status */}
      {percentage >= 100 && (
        <View style={styles.goalAchieved}>
          <Text style={styles.goalAchievedText}>🎉 Goal Achieved!</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottle: {
    alignItems: 'center',
    marginBottom: 16,
  },
  bottleNeck: {
    height: 20,
    backgroundColor: colors.border,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderWidth: 2,
    borderColor: colors.textSecondary,
    borderBottomWidth: 0,
  },
  bottleBody: {
    borderWidth: 3,
    borderColor: colors.textSecondary,
    borderRadius: 20,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    backgroundColor: colors.card,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'flex-end',
  },
  waterFill: {
    width: '100%',
    borderBottomLeftRadius: 17,
    borderBottomRightRadius: 17,
    opacity: 0.8,
  },
  waterSurface: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 4,
    opacity: 0.6,
  },
  progressText: {
    alignItems: 'center',
  },
  percentageText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  amountText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  goalAchieved: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: colors.success,
    borderRadius: 12,
  },
  goalAchievedText: {
    color: colors.card,
    fontSize: 12,
    fontWeight: '600',
  },
});

export default WaterProgressBottle;
