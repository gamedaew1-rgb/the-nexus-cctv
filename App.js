// App.js — โครงหลักของแอป: กำหนดการนำทาง (Navigation) ว่ามีหน้าจออะไรบ้าง และหน้าไหนเปิดได้เมื่อไร
import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

// ไฟล์ภายในโปรเจกต์: ธีมสี, state กลาง (AppContext) และหน้าจอทุกหน้า
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

// Stack = เปิดหน้าซ้อนกันและมีปุ่มย้อนกลับ · Tab = แถบเมนูด้านล่าง
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// ธีมของ React Navigation ปรับสีให้เป็นโทนขาว-ฟ้าของแอป
const navTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: colors.bg, card: colors.surface, border: colors.border, primary: colors.accent, text: colors.text },
};
// รูปแบบแถบหัวหน้าจอ ใช้ร่วมกันทุกหน้า
const header = {
  headerStyle: { backgroundColor: colors.surface },
  headerTintColor: colors.text,
  headerTitleStyle: { fontWeight: '700' },
  headerShadowVisible: false,
};

// ไอคอนของแต่ละแท็บ (ชื่อจาก Ionicons) แท็บที่เลือกอยู่ใช้ไอคอนทึบ แท็บอื่นใช้แบบเส้น (-outline)
const ICONS = { Home: 'home', Live: 'videocam', Playback: 'time', Alerts: 'notifications', More: 'person-circle' };

// MainTabs = แถบเมนูด้านล่างหลังล็อกอิน 5 แท็บ: หน้าแรก / กล้อง / ย้อนหลัง / เหตุการณ์ / บัญชี
function MainTabs() {
  const { visibleAlerts } = useApp();
  // นับเหตุการณ์ที่ยังไม่อ่าน เพื่อแสดงตัวเลขสีแดงบนแท็บ "เหตุการณ์"
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

// RootNavigator = เลือกว่าจะแสดงอะไร: ยังไม่ล็อกอิน → หน้า Login · ล็อกอินแล้ว → แท็บหลักและหน้าย่อย
function RootNavigator() {
  const { currentUser } = useApp();
  return (
    <Stack.Navigator screenOptions={header}>
      {/* ยังไม่มีผู้ใช้ล็อกอิน → มีแค่หน้า Login จึงเข้าหน้าอื่นโดยไม่ล็อกอินไม่ได้ */}
      {!currentUser ? (
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      ) : (
        <>
          <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
          {/* หน้าย่อยที่เปิดซ้อนบนแท็บ: ดูกล้อง, ตั้งค่าแจ้งเตือน, สมาชิก, เพิ่มสมาชิก, อุปกรณ์ */}
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

// คอมโพเนนต์หลักของแอป: AppProvider ครอบทั้งหมด ทุกหน้าจึงใช้ข้อมูลกลางร่วมกันได้
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
