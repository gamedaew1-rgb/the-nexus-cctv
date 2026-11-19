// RequestsScreen.js — หน้าคำขอจัดการกล้อง
// Operator: ดูคำขอที่ตัวเองส่ง และสถานะ (รออนุมัติ / อนุมัติแล้ว / ไม่อนุมัติ) (UC-16)
// Manager: เห็นคำขอทั้งหมด กดอนุมัติ (ระบบทำตามคำขอทันที) หรือไม่อนุมัติ (UC-17)
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../AppContext';
import { PrimaryButton, Segment } from '../components/ui';
import { colors, radius } from '../theme';

// ไอคอนของคำขอแต่ละประเภท
const TYPE_ICON = { add: 'add-circle', remove: 'trash', move: 'swap-horizontal', firmware: 'cloud-download' };
// ป้ายสถานะ: ข้อความและสี
const STATUS = {
  pending: { label: 'รออนุมัติ', color: colors.warning, bg: '#FFF8EB' },
  approved: { label: 'อนุมัติแล้ว', color: colors.online, bg: '#EAF8EF' },
  rejected: { label: 'ไม่อนุมัติ', color: colors.live, bg: '#FFF1F1' },
};

export default function RequestsScreen({ navigation, route }) {
  const { isManager, visibleRequests, decideRequest } = useApp();
  // แท็บ: 'pending' = รออนุมัติ · 'done' = ตัดสินแล้ว (ประวัติ)
  const [tab, setTab] = useState('pending');
  const list = visibleRequests.filter((r) => (tab === 'pending' ? r.status === 'pending' : r.status !== 'pending'));
  const pendingCount = visibleRequests.filter((r) => r.status === 'pending').length;

  // Manager กดอนุมัติ / ไม่อนุมัติ แล้วแจ้งผล
  const decide = (r, approve) => {
    decideRequest(r.id, approve);
    // ไปหน้าแสดงผล (ResultScreen): อนุมัติ = เครื่องหมายถูกสีเขียว · ไม่อนุมัติ = กากบาทสีแดง
    // คำขอเพิ่มกล้องแค่เปลี่ยนสถานะ · คำขออื่น (ลบ ย้าย อัปเดต) ระบบทำตามคำขอแล้ว
    navigation.navigate('Result', {
      type: approve ? 'approved' : 'rejected',
      title: approve ? 'อนุมัติคำขอเรียบร้อย' : 'ไม่อนุมัติคำขอ',
      message: approve
        ? (r.action.type === 'add' ? 'สถานะคำขอเปลี่ยนเป็น "อนุมัติแล้ว"' : 'ระบบดำเนินการตามคำขอแล้ว')
        : `คำขอนี้ไม่มีผลกับกล้อง ${r.byName} จะเห็นสถานะ "ไม่อนุมัติ"`,
      items: [r.summary],
      by: r.byName,
      time: r.time,
      back: 'กลับหน้าคำขอ',
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <Text style={styles.intro}>
        {isManager
          ? 'คำขอจัดการกล้องจาก Operator กดอนุมัติแล้วระบบจะทำตามคำขอทันที'
          : 'คำขอที่คุณส่งจะมีผลเมื่อ Manager อนุมัติแล้วเท่านั้น'}
      </Text>

      {/* หน้ารออนุมัติ: Operator เพิ่งส่งคำขอ หรือยังมีคำขอค้าง → แสดงกล่องนาฬิกาทราย */}
      {!isManager && pendingCount > 0 && (
        <View style={styles.waiting}>
          <View style={styles.waitIcon}><Ionicons name="hourglass" size={30} color="#fff" /></View>
          <Text style={styles.waitTitle}>{route.params?.justSent ? 'ส่งคำขอแล้ว · รออนุมัติ' : 'รออนุมัติจาก Manager'}</Text>
          <Text style={styles.waitSub}>คำขอ {pendingCount} รายการกำลังรอ Manager ตรวจสอบ เมื่อ Manager ตรวจแล้ว สถานะจะเปลี่ยนเป็น "อนุมัติแล้ว" หรือ "ไม่อนุมัติ"</Text>
        </View>
      )}

      <Segment
        options={[{ value: 'pending', label: `รออนุมัติ (${pendingCount})` }, { value: 'done', label: 'ประวัติ' }]}
        value={tab} onChange={setTab} />

      {list.length === 0 && (
        <View style={styles.empty}>
          <Ionicons name="checkmark-done-circle-outline" size={44} color={colors.textDim} />
          <Text style={styles.emptyText}>{tab === 'pending' ? 'ไม่มีคำขอที่รออนุมัติ' : 'ยังไม่มีประวัติคำขอ'}</Text>
        </View>
      )}

      {list.map((r) => {
        const st = STATUS[r.status];
        return (
          <View key={r.id} style={styles.card}>
            <View style={styles.head}>
              <View style={styles.icon}><Ionicons name={TYPE_ICON[r.action.type]} size={18} color={colors.accent} /></View>
              <Text style={styles.summary}>{r.summary}</Text>
            </View>
            <Text style={styles.meta}>ขอโดย {r.byName} · {r.time}</Text>
            <View style={styles.footer}>
              <Text style={[styles.status, { color: st.color, backgroundColor: st.bg }]}>{st.label}</Text>
              {!!r.decidedBy && <Text style={styles.meta}>โดย {r.decidedBy} · {r.decidedAt}</Text>}
            </View>

            {/* ปุ่มตัดสิน: เฉพาะ Manager และคำขอที่ยังรออยู่ */}
            {isManager && r.status === 'pending' && (
              <View style={{ flexDirection: 'row', marginTop: 12 }}>
                <PrimaryButton label="ไม่อนุมัติ" icon="close" danger onPress={() => decide(r, false)} style={{ flex: 1, marginRight: 8 }} />
                <PrimaryButton label="อนุมัติ" icon="checkmark" onPress={() => decide(r, true)} style={{ flex: 1 }} />
              </View>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  waiting: { alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.lg, padding: 20, marginBottom: 14, borderWidth: 1, borderColor: colors.border },
  waitIcon: { width: 60, height: 60, borderRadius: 30, backgroundColor: colors.warning, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  waitTitle: { color: colors.text, fontSize: 18, fontWeight: '800' },
  waitSub: { color: colors.textDim, fontSize: 13, textAlign: 'center', marginTop: 6 },
  intro: { color: colors.textDim, fontSize: 13, marginBottom: 12 },
  empty: { alignItems: 'center', marginTop: 48 },
  emptyText: { color: colors.textDim, marginTop: 8 },
  card: { backgroundColor: colors.surface, borderRadius: radius.md, padding: 14, marginTop: 12, borderWidth: 1, borderColor: colors.border },
  head: { flexDirection: 'row', alignItems: 'center' },
  icon: { width: 34, height: 34, borderRadius: 10, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  summary: { flex: 1, color: colors.text, fontWeight: '700', fontSize: 15 },
  meta: { color: colors.textDim, fontSize: 12, marginTop: 6 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, flexWrap: 'wrap' },
  status: { fontSize: 12, fontWeight: '700', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, overflow: 'hidden' },
});
