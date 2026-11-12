import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useApp, ROLES } from '../AppContext';
import { PrimaryButton } from '../components/ui';
import { colors, radius, shadow } from '../theme';

// บัญชีทดสอบ — แตะเพื่อกรอกให้อัตโนมัติ
const DEMO = [
  { role: 'admin', username: 'admin', password: 'admin123' },
  { role: 'staff', username: 'staff', password: 'staff123' },
  { role: 'member', username: 'member', password: 'member123' },
];

// หน้าล็อกอิน (UC-01)
export default function LoginScreen() {
  const { login } = useApp();
  const insets = useSafeAreaInsets();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');

  // กดเข้าสู่ระบบ: ตรวจว่ากรอกครบ แล้วเรียก login() จาก AppContext · ไม่ผ่านจะแสดงข้อความ error
  const submit = () => {
    if (!username.trim() || !password) return setError('กรุณากรอกชื่อผู้ใช้และรหัสผ่าน');
    if (!login(username, password)) setError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
  };
  // แตะบัญชีทดสอบ → กรอกชื่อผู้ใช้และรหัสผ่านให้อัตโนมัติ
  const fill = (d) => { setUsername(d.username); setPassword(d.password); setError(''); };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        {/* ส่วนหัวสีฟ้า: โลโก้และชื่อแบรนด์ */}
        <View style={[styles.hero, { paddingTop: insets.top + 48 }]}>
          <View style={styles.bubble1} />
          <View style={styles.bubble2} />
          <View style={styles.logo}><Ionicons name="aperture" size={34} color={colors.accent} /></View>
          <Text style={styles.brand}>The Nexus CCTV</Text>
          <Text style={styles.tagline}>ระบบดูแลกล้องวงจรปิดสำหรับองค์กร</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>เข้าสู่ระบบ</Text>

          <View style={styles.inputWrap}>
            <Ionicons name="person-outline" size={18} color={colors.textDim} />
            <TextInput style={styles.input} placeholder="ชื่อผู้ใช้" placeholderTextColor="#A3AFC0"
              value={username} onChangeText={(t) => { setUsername(t); setError(''); }} autoCapitalize="none" autoCorrect={false} />
          </View>
          <View style={styles.inputWrap}>
            <Ionicons name="lock-closed-outline" size={18} color={colors.textDim} />
            <TextInput style={styles.input} placeholder="รหัสผ่าน" placeholderTextColor="#A3AFC0"
              value={password} onChangeText={(t) => { setPassword(t); setError(''); }} secureTextEntry={!show} onSubmitEditing={submit} />
            <Pressable onPress={() => setShow((v) => !v)} hitSlop={10}>
              <Ionicons name={show ? 'eye-off-outline' : 'eye-outline'} size={18} color={colors.textDim} />
            </Pressable>
          </View>

          {/* กล่องข้อความ error แสดงเมื่อกรอกไม่ครบหรือรหัสผ่านผิด */}
          {!!error && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={16} color={colors.live} />
              <Text style={styles.error}>{error}</Text>
            </View>
          )}

          <PrimaryButton label="เข้าสู่ระบบ" onPress={submit} style={{ marginTop: 6 }} />
        </View>

        {/* กล่องบัญชีทดสอบ 3 บทบาท */}
        <View style={styles.demo}>
          <Text style={styles.demoTitle}>บัญชีทดสอบ (แตะเพื่อกรอก)</Text>
          {DEMO.map((d) => {
            const r = ROLES[d.role];
            return (
              <Pressable key={d.role} onPress={() => fill(d)} style={({ pressed }) => [styles.demoRow, pressed && { backgroundColor: colors.surfaceAlt }]}>
                <View style={[styles.demoIcon, { backgroundColor: r.bg }]}><Ionicons name={r.icon} size={16} color={r.color} /></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.demoRole}>{r.label}</Text>
                  <Text style={styles.demoCred}>{d.username} / {d.password}</Text>
                </View>
                <Ionicons name="arrow-forward-circle" size={22} color={colors.accent} />
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  hero: { backgroundColor: colors.accent, alignItems: 'center', paddingBottom: 70, borderBottomLeftRadius: 32, borderBottomRightRadius: 32, overflow: 'hidden' },
  bubble1: { position: 'absolute', width: 220, height: 220, borderRadius: 110, backgroundColor: 'rgba(255,255,255,0.08)', top: -60, right: -60 },
  bubble2: { position: 'absolute', width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(255,255,255,0.06)', bottom: -40, left: -50 },
  logo: { width: 68, height: 68, borderRadius: 22, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  brand: { color: '#fff', fontSize: 26, fontWeight: '800' },
  tagline: { color: 'rgba(255,255,255,0.85)', marginTop: 4 },
  card: { backgroundColor: colors.surface, marginHorizontal: 20, marginTop: -44, borderRadius: radius.lg, padding: 20, ...shadow },
  title: { color: colors.text, fontSize: 20, fontWeight: '800', marginBottom: 16 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: 14, marginBottom: 12 },
  input: { flex: 1, color: colors.text, paddingVertical: 14, paddingHorizontal: 10, fontSize: 16 },
  errorBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF1F1', padding: 10, borderRadius: radius.sm, marginBottom: 8 },
  error: { color: colors.live, marginLeft: 6, fontSize: 13 },
  demo: { margin: 20, marginTop: 18, backgroundColor: colors.surface, borderRadius: radius.md, padding: 8, borderWidth: 1, borderColor: colors.border, borderStyle: 'dashed' },
  demoTitle: { color: colors.textDim, fontSize: 12, fontWeight: '600', margin: 8 },
  demoRow: { flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: radius.sm },
  demoIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  demoRole: { color: colors.text, fontWeight: '700', fontSize: 14 },
  demoCred: { color: colors.textDim, fontSize: 12, marginTop: 1 },
});
