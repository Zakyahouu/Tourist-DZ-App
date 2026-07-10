import { Tabs } from 'expo-router';
import React from 'react';
import { Image, Platform, View } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTranslation } from 'react-i18next';

function LogoHeader() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'flex-start', paddingLeft: Platform.OS === 'ios' ? 0 : 4 }}>
      <Image
        source={require('../../assets/images/logo_with_words.jpeg')}
        style={{ height: 28, width: 120, resizeMode: 'contain' }}
        accessibilityLabel="ZibanGo"
      />
    </View>
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: Colors[colorScheme ?? 'light'].background,
          borderTopWidth: 1,
          borderTopColor: colorScheme === 'dark' ? '#1F5B3A' : '#e2e8f0',
        }
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: t('nav.home'),
          headerShown: true,
          headerTitle: () => <LogoHeader />,
          headerStyle: { backgroundColor: '#F8F7F4' },
          headerShadowVisible: false,
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: t('nav.explore'),
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="gallery"
        options={{
          title: t('nav.gallery'),
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="photo.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="events"
        options={{
          title: t('nav.events'),
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="calendar.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('nav.profile'),
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
