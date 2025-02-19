import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        tabBarInactiveTintColor: Colors[colorScheme ?? 'light'].tabIconDefault,
        headerShown: false,
        headerStyle: {
          backgroundColor: Colors[colorScheme ?? 'light'].background,
        },
        headerTintColor: Colors[colorScheme ?? 'light'].tint,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
          },
          default: {
            borderTopwidth: 1,
            borderTopColor: Colors[colorScheme ?? 'light'].tabBorder,
          },
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
          headerShown: true
        }}
      />
        <Tabs.Screen
        name="grades"
        options={{
          title: 'Grades',
          tabBarIcon: ({ color }) => <MaterialIcons size={28} name="grade" color={color} />,
          headerShown: true
        }}
      />
       <Tabs.Screen
        name="homework"
        options={{
          title: 'Homeworks',
          tabBarIcon: ({ color }) => <MaterialIcons size={28} name="home-work" color={color} />,
          headerShown: true
        }}
      />
      <Tabs.Screen
        name="payments"
        options={{
          title: 'Payments',
          tabBarIcon: ({ color }) => <MaterialIcons size={28} name="payment" color={color} />,
          headerShown: true
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Information',
          tabBarIcon: ({ color }) => <Ionicons size={28} name="information-circle" color={color} />,
          headerShown: true
        }}
      />
    </Tabs>
  );
}
