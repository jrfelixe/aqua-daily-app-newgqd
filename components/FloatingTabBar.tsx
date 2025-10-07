
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Dimensions,
} from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import { useTheme } from '@react-navigation/native';
import { IconSymbol } from '@/components/IconSymbol';
import { BlurView } from 'expo-blur';
import { colors } from '@/styles/commonStyles';

export interface TabBarItem {
  name: string;
  route: string;
  icon: string;
  label: string;
}

interface FloatingTabBarProps {
  tabs: TabBarItem[];
  containerWidth?: number;
  borderRadius?: number;
  bottomMargin?: number;
}

export default function FloatingTabBar({
  tabs,
  containerWidth = Dimensions.get('window').width - 40,
  borderRadius = 25,
  bottomMargin = 20,
}: FloatingTabBarProps) {
  const theme = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  
  const animatedValue = useSharedValue(0);

  // Find active tab index
  const activeIndex = tabs.findIndex(tab => {
    if (tab.route === '/(tabs)/(home)/') {
      return pathname.startsWith('/(tabs)/(home)') || pathname === '/';
    }
    return pathname.includes(tab.name);
  });

  React.useEffect(() => {
    animatedValue.value = withSpring(activeIndex >= 0 ? activeIndex : 0);
  }, [activeIndex, animatedValue]);

  const handleTabPress = (route: string) => {
    router.push(route as any);
  };

  const animatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      animatedValue.value,
      tabs.map((_, index) => index),
      tabs.map((_, index) => (containerWidth / tabs.length) * index)
    );

    return {
      transform: [{ translateX }],
    };
  });

  return (
    <View style={[styles.container, { bottom: bottomMargin }]}>
      <BlurView
        intensity={80}
        tint={theme.dark ? 'dark' : 'light'}
        style={[
          styles.tabBar,
          {
            width: containerWidth,
            borderRadius,
            backgroundColor: Platform.OS === 'android' ? colors.card : 'transparent',
          },
        ]}
      >
        {/* Animated background indicator */}
        <Animated.View
          style={[
            styles.activeIndicator,
            {
              width: containerWidth / tabs.length,
              borderRadius: borderRadius - 5,
              backgroundColor: colors.primary,
            },
            animatedStyle,
          ]}
        />

        {/* Tab buttons */}
        {tabs.map((tab, index) => {
          const isActive = index === activeIndex;
          
          return (
            <TouchableOpacity
              key={tab.name}
              style={[styles.tab, { width: containerWidth / tabs.length }]}
              onPress={() => handleTabPress(tab.route)}
            >
              <IconSymbol
                name={tab.icon as any}
                size={24}
                color={isActive ? colors.card : colors.text}
              />
              <Text
                style={[
                  styles.tabLabel,
                  {
                    color: isActive ? colors.card : colors.text,
                    fontWeight: isActive ? '600' : '500',
                  },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 20,
    right: 20,
    alignItems: 'center',
    zIndex: 1000,
  },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
  },
  activeIndicator: {
    position: 'absolute',
    height: '80%',
    top: '10%',
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    zIndex: 1,
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 4,
  },
});
