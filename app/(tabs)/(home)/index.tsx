
import React from "react";
import { Stack, Link, router } from "expo-router";
import { View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { IconSymbol } from "@/components/IconSymbol";
import { colors, commonStyles } from "@/styles/commonStyles";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const menuItems = [
    {
      title: "Water Tracker",
      description: "Track your daily water intake",
      route: "/(tabs)/(home)/water-tracker",
      icon: "drop.fill",
      color: colors.primary,
    },
    {
      title: "History",
      description: "View your hydration history",
      route: "/(tabs)/(home)/history",
      icon: "chart.bar.fill",
      color: colors.accent,
    },
    {
      title: "Reminders",
      description: "Set up water intake reminders",
      route: "/(tabs)/(home)/reminders",
      icon: "bell.fill",
      color: colors.secondary,
    },
  ];

  const renderMenuItem = (item: typeof menuItems[0]) => (
    <TouchableOpacity
      key={item.route}
      style={styles.menuItem}
      onPress={() => router.push(item.route as any)}
    >
      <View style={[styles.menuIcon, { backgroundColor: item.color }]}>
        <IconSymbol name={item.icon as any} color={colors.card} size={28} />
      </View>
      <View style={styles.menuContent}>
        <Text style={styles.menuTitle}>{item.title}</Text>
        <Text style={styles.menuDescription}>{item.description}</Text>
      </View>
      <IconSymbol name="chevron.right" color={colors.textSecondary} size={20} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={commonStyles.container}>
      {Platform.OS === 'ios' && (
        <Stack.Screen
          options={{
            title: "Hydration Tracker",
          }}
        />
      )}
      
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={commonStyles.title}>💧 Stay Hydrated</Text>
          <Text style={commonStyles.textSecondary}>
            Track your daily water intake and build healthy hydration habits
          </Text>
        </View>

        {/* Quick Stats Card */}
        <View style={styles.quickStatsCard}>
          <View style={styles.quickStat}>
            <IconSymbol name="drop.fill" size={24} color={colors.primary} />
            <Text style={styles.quickStatLabel}>Today's Goal</Text>
            <Text style={styles.quickStatValue}>2000ml</Text>
          </View>
          <View style={styles.quickStat}>
            <IconSymbol name="target" size={24} color={colors.success} />
            <Text style={styles.quickStatLabel}>This Week</Text>
            <Text style={styles.quickStatValue}>5/7 days</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map(renderMenuItem)}
        </View>

        {/* Tips Section */}
        <View style={styles.tipsSection}>
          <Text style={styles.tipsTitle}>💡 Hydration Tips</Text>
          <View style={styles.tipCard}>
            <Text style={styles.tipText}>
              Start your day with a glass of water to kickstart your metabolism and hydration.
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
  quickStatsCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
    elevation: 2,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
  },
  quickStat: {
    flex: 1,
    alignItems: 'center',
  },
  quickStatLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 8,
    marginBottom: 4,
  },
  quickStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  menuContainer: {
    marginBottom: 30,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
  },
  menuIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  menuDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  tipsSection: {
    marginTop: 'auto',
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  tipCard: {
    backgroundColor: colors.highlight,
    borderRadius: 8,
    padding: 12,
  },
  tipText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
});
