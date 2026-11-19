// ResultScreen.js — หน้าแสดงผลหลังทำรายการสำเร็จ ใช้ร่วมกันหลายกรณี
// type: 'approved' = Manager อนุมัติคำขอ (UC-17) · 'rejected' = ไม่อนุมัติคำขอ · 'deleted' = ลบกล้องแล้ว (UC-15)
// params ที่รับ: type, title, message, items (รายการชื่อ เช่น กล้องที่ลบ), by (ผู้ขอ/ผู้ทำ), time, back (ข้อความปุ่มกลับ)
import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PrimaryButton } from '../components/ui';
import { colors, radius, shadow } from '../theme';

// หน้าตาของแต่ละแบบ: ไอคอน สีหลัก และสีพื้นวงกลม
const KIND = {
  approved: { icon: 'checkmark-circle', color: colors.online, soft: '#EAF8EF', badge: 'อนุมัติแล้ว' },
  rejected: { icon: 'close-circle', color: colors.live, soft: '#FFF1F1', badge: 'ไม่อนุมัติ' },
  deleted: { icon: 'trash', color: colors.live, soft: '#FFF1F1', badge: 'ลบแล้ว' },
};

export default function ResultScreen({ navigation, route }) {
  const { type = 'approved', title, message, items = [], by, time, back = 'กลับ' } = route.params ?? {};
  const k = KIND[type] ?? KIND.approved;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* วงกลมไอคอนใหญ่ บอกผลในแวบเดียว */}
      <View style={[styles.ring, { backgroundColor: k.soft }]}>
        <View style={[styles.circle, { backgroundColor: k.color }]}>
          <Ionicons name={k.icon} size={56} color="#fff" />
        </View>
      </View>

      <Text style={[styles.badge, { color: k.color, backgroundColor: k.soft }]}>{k.badge}</Text>
      <Text style={styles.title}>{title}</Text>
      {!!message && <Text style={styles.message}>{message}</Text>}

      {/* การ์ดรายละเอียด: รายการที่เกี่ยวข้อง + ผู้ขอ + เวลา */}
      {(items.length > 0 || by || time) && (
        <View style={styles.card}>
          {items.map((it, i) => (
            <View key={i} style={[styles.row, i < items.length - 1 && styles.rowBorder]}>
              <Ionicons name="videocam" size={18} color={colors.accent} />
              <Text style={styles.rowText}>{it}</Text>
            </View>
          ))}
          {!!by && <Text style={[styles.meta, items.length > 0 && { marginTop: 12 }]}>ผู้ขอ: {by}</Text>}
          {!!time && <Text style={styles.meta}>เวลา: {time}</Text>}
        </View>
      )}

      {/* ปุ่ม: กลับหน้าก่อนหน้า หรือกลับหน้าแรก */}
      <PrimaryButton label={back} icon="arrow-back" onPress={() => navigation.goBack()} style={styles.btn} />
      <PrimaryButton label="กลับหน้าแรก" icon="home" secondary onPress={() => navigation.navigate('Main', { screen: 'Home' })} style={[styles.btn, { marginTop: 10 }]} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 24, paddingTop: 40, alignItems: 'center' },
  ring: { width: 140, height: 140, borderRadius: 70, alignItems: 'center', justifyContent: 'center' },
  circle: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center' },
  badge: { marginTop: 18, fontSize: 13, fontWeight: '800', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, overflow: 'hidden' },
  title: { color: colors.text, fontSize: 22, fontWeight: '800', textAlign: 'center', marginTop: 10 },
  message: { color: colors.textDim, fontSize: 14, textAlign: 'center', marginTop: 8, lineHeight: 21 },
  card: { alignSelf: 'stretch', backgroundColor: colors.surface, borderRadius: radius.lg, padding: 16, marginTop: 24, ...shadow },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  rowText: { color: colors.text, fontSize: 15, marginLeft: 10, flex: 1 },
  meta: { color: colors.textDim, fontSize: 13, marginTop: 4 },
  btn: { alignSelf: 'stretch', marginTop: 28 },
});
