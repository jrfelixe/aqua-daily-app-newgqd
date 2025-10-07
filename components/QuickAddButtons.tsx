
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { IconSymbol } from './IconSymbol';
import { colors, buttonStyles } from '../styles/commonStyles';
import { PRESET_AMOUNTS } from '../types/WaterTypes';

interface QuickAddButtonsProps {
  onAddWater: (amount: number) => void;
  disabled?: boolean;
}

const QuickAddButtons: React.FC<QuickAddButtonsProps> = ({ onAddWater, disabled = false }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quick Add</Text>
      <View style={styles.buttonsGrid}>
        {PRESET_AMOUNTS.map((preset) => (
          <TouchableOpacity
            key={preset.value}
            style={[
              styles.quickButton,
              disabled && styles.quickButtonDisabled
            ]}
            onPress={() => onAddWater(preset.value)}
            disabled={disabled}
          >
            <IconSymbol 
              name="drop.fill" 
              size={24} 
              color={disabled ? colors.textSecondary : colors.primary} 
            />
            <Text style={[
              styles.quickButtonText,
              disabled && styles.quickButtonTextDisabled
            ]}>
              {preset.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  buttonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  quickButton: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
  },
  quickButtonDisabled: {
    borderColor: colors.textSecondary,
    backgroundColor: colors.background,
  },
  quickButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginTop: 4,
  },
  quickButtonTextDisabled: {
    color: colors.textSecondary,
  },
});

export default QuickAddButtons;
