import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import { colors } from './src/theme';
import { AppProvider, useApp } from './src/AppContext';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import LiveGridScreen from './src/screens/LiveGridScreen';
import CameraViewScreen from './src/screens/CameraViewScreen';
import AlarmSettingsScreen from './src/screens/AlarmSettingsScreen';
import PlaybackScreen from './src/screens/PlaybackScreen';
import AlertsScreen from './src/screens/AlertsScreen';
import TeamScreen from './src/screens/TeamScreen';
import MemberDetailScreen from './src/screens/MemberDetailScreen';
import InviteMemberScreen from './src/screens/InviteMemberScreen';
import DevicesScreen from './src/screens/DevicesScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const navTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: colors.bg, card: colors.surface, border: colors.border, primary: colors.accent, text: colors.text },
};
const header = {
  headerStyle: { backgroundColor: colors.surface },
  headerTintColor: colors.text,
  headerTitleStyle: { fontWeight: '700' },
  headerShadowVisible: false,
};

const ICONS = { Home: 'home', Live: 'videocam', Playback: 'time', Alerts: 'notifications', More: 'person-circle' };

function MainTabs() {
  const { visibleAlerts } = useApp();
  const unread = visibleAlerts.filter((a) => !a.read).length;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        ...header,
        tabBarIcon: ({ color, size, focused }) => (
          <Ionicons name={focused ? ICONS[route.name] : `${ICONS[route.name]}-outline`} size={size} color={color} />
        ),
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: '#9AA7BA',
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'หน้าแรก', headerShown: false }} />
      <Tab.Screen name="Live" component={LiveGridScreen} options={{ title: 'กล้อง' }} />
      <Tab.Screen name="Playback" component={PlaybackScreen} options={{ title: 'ย้อนหลัง' }} />
      <Tab.Screen name="Alerts" component={AlertsScreen} options={{ title: 'เหตุการณ์', tabBarBadge: unread || undefined }} />
      <Tab.Screen name="More" component={SettingsScreen} options={{ title: 'บัญชี' }} />
    </Tab.Navigator>
  );
}

function RootNavigator() {
  const { currentUser } = useApp();
  return (
    <Stack.Navigator screenOptions={header}>
      {!currentUser ? (
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      ) : (
        <>
          <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
          <Stack.Screen name="CameraView" component={CameraViewScreen} options={{ title: 'กล้อง' }} />
          <Stack.Screen name="AlarmSettings" component={AlarmSettingsScreen} options={{ title: 'ตั้งค่าการแจ้งเตือน' }} />
          <Stack.Screen name="Team" component={TeamScreen} options={{ title: 'สมาชิกและสาขา' }} />
          <Stack.Screen name="MemberDetail" component={MemberDetailScreen} options={{ title: 'ข้อมูลสมาชิก' }} />
          <Stack.Screen name="InviteMember" component={InviteMemberScreen} options={{ title: 'เพิ่มสมาชิก', presentation: 'modal' }} />
          <Stack.Screen name="Devices" component={DevicesScreen} options={{ title: 'จัดการอุปกรณ์' }} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AppProvider>
      <NavigationContainer theme={navTheme}>
        <StatusBar style="dark" />
        <RootNavigator />
      </NavigationContainer>
    </AppProvider>
  );
}
