// RequestsScreen.js — หน้าคำขอจัดการกล้อง
// เจ้าหน้าที่องค์กร: ดูคำขอที่ตัวเองส่ง และสถานะ (รออนุมัติ / อนุมัติแล้ว / ไม่อนุมัติ) (UC-16)
// Admin: เห็นคำขอทั้งหมด กดอนุมัติ (ระบบทำตามคำขอทันที) หรือไม่อนุมัติ (UC-17)
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../AppContext';
import { PrimaryButton, Segment } from '../components/ui';
import { showAlert } from '../utils/dialog';
import { colors, radius } from '../theme';

// ไอคอนของคำขอแต่ละประเภท
const TYPE_ICON = { add: 'add-circle', remove: 'trash', move: 'swap-horizontal', firmware: 'cloud-download' };
// ป้ายสถานะ: ข้อความและสี
const STATUS = {
  pending: { label: 'รออนุมัติ', color: colors.warning, bg: '#FFF8EB' },
  approved: { label: 'อนุมัติแล้ว', color: colors.online, bg: '#EAF8EF' },
  rejected: { label: 'ไม่อนุมัติ', color: colors.live, bg: '#FFF1F1' },
};

export default function RequestsScreen({ route }) {
  const { isAdmin, visibleRequests, decideRequest } = useApp();
  // แท็บ: 'pending' = รออนุมัติ · 'done' = ตัดสินแล้ว (ประวัติ)
  const [tab, setTab] = useState('pending');
  const list = visibleRequests.filter((r) => (tab === 'pending' ? r.status === 'pending' : r.status !== 'pending'));
  const pendingCount = visibleRequests.filter((r) => r.status === 'pending').length;

  // Admin กดอนุมัติ / ไม่อนุมัติ แล้วแจ้งผล
  const decide = (r, approve) => {
    decideRequest(r.id, approve);
    showAlert(approve ? 'อนุมัติแล้ว' : 'ไม่อนุมัติคำขอ', approve ? `ดำเนินการแล้ว: ${r.summary}` : `แจ้งผลให้ ${r.byName} แล้ว`);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <Text style={styles.intro}>
        {isAdmin
          ? 'คำขอจัดการกล้องจากเจ้าหน้าที่องค์กร กดอนุมัติแล้วระบบจะทำตามคำขอทันที'
          : 'คำขอที่คุณส่งจะมีผลเมื่อ Admin อนุมัติแล้วเท่านั้น'}
      </Text>

      {/* หน้ารออนุมัติ: เจ้าหน้าที่เพิ่งส่งคำขอ หรือยังมีคำขอค้าง → แสดงกล่องนาฬิกาทราย */}
      {!isAdmin && pendingCount > 0 && (
        <View style={styles.waiting}>
          <View style={styles.waitIcon}><Ionicons name="hourglass" size={30} color="#fff" /></View>
          <Text style={styles.waitTitle}>{route.params?.justSent ? 'ส่งคำขอแล้ว · รออนุมัติ' : 'รออนุมัติจาก Admin'}</Text>
          <Text style={styles.waitSub}>คำขอ {pendingCount} รายการกำลังรอ Admin ตรวจสอบ เมื่ออนุมัติแล้วการเปลี่ยนแปลงจะมีผลทันที</Text>
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

            {/* ปุ่มตัดสิน: เฉพาะ Admin และคำขอที่ยังรออยู่ */}
            {isAdmin && r.status === 'pending' && (
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
