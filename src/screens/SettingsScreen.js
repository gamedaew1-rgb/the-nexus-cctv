import React, { useState } from 'react';
import { View, Text, Switch, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp, ROLES, PERMISSIONS } from '../AppContext';
import { Avatar, Card, ConfirmDialog, ListRow, PrimaryButton, RoleBadge, SectionTitle } from '../components/ui';
import { colors } from '../theme';

// หน้าบัญชี: โปรไฟล์ สิทธิ์ของบทบาท พื้นที่คลาวด์ เมนูจัดการ
export default function SettingsScreen({ navigation }) {
  const { currentUser, org, canManageTeam, canManageDevices, isManager, needsApproval, pendingCount, visibleSites, visibleCameras, storage, logout, resetDemo } = useApp();
  // การตั้งค่าแอป (สวิตช์) ยังเป็นแบบจำลอง เก็บไว้เฉพาะในหน้านี้
  const [prefs, setPrefs] = useState({ push: true, sound: false, hd: false });
  const toggle = (k) => (v) => setPrefs((p) => ({ ...p, [k]: v }));
  // เปอร์เซ็นต์พื้นที่คลาวด์ที่ใช้ไป
  const pct = Math.round((storage.usedGB / storage.totalGB) * 100);
  const role = ROLES[currentUser.role];

  const [askLogout, setAskLogout] = useState(false);
  const [askReset, setAskReset] = useState(false);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <Card style={styles.profile}>
        <Avatar name={currentUser.name} size={56} dark />
        <View style={{ flex: 1, marginLeft: 14 }}>
          <Text style={styles.userName}>{currentUser.name}</Text>
          <Text style={styles.sub}>@{currentUser.username} · {org.name}</Text>
          <View style={{ flexDirection: 'row', marginTop: 8 }}><RoleBadge role={currentUser.role} /></View>
        </View>
      </Card>

      <SectionTitle>สิทธิ์ของคุณ</SectionTitle>
      <Card style={{ padding: 16 }}>
        <Text style={[styles.sub, { marginBottom: 10 }]}>{role.desc}</Text>
        {/* ตารางสิทธิ์ (UC-07): ✓ สีเขียว = บทบาทนี้ทำได้ · ✗ สีเทา = ทำไม่ได้ */}
        {PERMISSIONS.map((p) => {
          const ok = p.roles.includes(currentUser.role);
          return (
            <View key={p.label} style={styles.perm}>
              <Ionicons name={ok ? 'checkmark-circle' : 'close-circle'} size={18} color={ok ? colors.online : '#C5CEDB'} />
              <Text style={[styles.permText, !ok && { color: '#A3AFC0' }]}>{p.label}</Text>
            </View>
          );
        })}
        <Text style={[styles.sub, { marginTop: 8 }]}>เข้าถึงได้ {visibleSites.length} สาขา · {visibleCameras.length} กล้อง</Text>
      </Card>

      {/* เมนูการจัดการ แสดงเฉพาะ Operator และ Manager */}
      {(canManageTeam || canManageDevices) && (
        <>
          <SectionTitle>การจัดการ</SectionTitle>
          <Card>
            {canManageTeam && <ListRow icon="person-add" title="เพิ่มผู้ใช้" subtitle="สร้างบัญชีล็อกอินให้คนในองค์กร" onPress={() => navigation.navigate('InviteMember')} />}
            {canManageTeam && <ListRow icon="people" title="ผู้ใช้และสาขา" subtitle="ดูและแก้ไขสิทธิ์" onPress={() => navigation.navigate('Team')} last={!canManageDevices} />}
            {canManageDevices && <ListRow icon="hardware-chip" title="จัดการอุปกรณ์" subtitle={needsApproval ? 'เพิ่ม ลบ ย้าย อัปเดต (ต้องรอ Manager อนุมัติ)' : 'เพิ่ม ลบ ย้ายสาขา อัปเดตเฟิร์มแวร์'} onPress={() => navigation.navigate('Devices')} />}
            {canManageDevices && <ListRow icon="document-text" title={isManager ? 'อนุมัติคำขอจัดการกล้อง' : 'คำขอของฉัน'} subtitle={pendingCount ? `รออนุมัติ ${pendingCount} รายการ` : 'ไม่มีคำขอค้าง'} onPress={() => navigation.navigate('Requests')} last={!isManager} />}
            {/* Manager: รีเซ็ตข้อมูลกลับเป็นข้อมูลตัวอย่าง (เพราะตอนนี้ข้อมูลถูกบันทึกในเบราว์เซอร์ ไม่หายเมื่อรีเฟรช) */}
            {isManager && <ListRow icon="refresh" title="รีเซ็ตข้อมูลตัวอย่าง" subtitle="คืนกล้อง ผู้ใช้ เหตุการณ์ และล้างคำขอ" onPress={() => setAskReset(true)} last />}
          </Card>
        </>
      )}

      <SectionTitle>พื้นที่เก็บข้อมูลบนคลาวด์</SectionTitle>
      <Card style={{ padding: 16 }}>
        <View style={styles.storageHead}>
          <Text style={styles.storageNum}>{storage.usedGB} <Text style={styles.sub}>/ {storage.totalGB} GB</Text></Text>
          <Text style={styles.plan}>{storage.plan}</Text>
        </View>
        <View style={styles.barBg}><View style={[styles.barFill, { width: `${pct}%` }]} /></View>
        <Text style={[styles.sub, { marginTop: 6 }]}>ใช้ไปแล้ว {pct}%</Text>
      </Card>

      <SectionTitle>การตั้งค่าแอป</SectionTitle>
      <Card>
        <ListRow icon="notifications" title="แจ้งเตือนแบบพุช" right={<Switch value={prefs.push} onValueChange={toggle('push')} trackColor={{ true: colors.accent }} />} />
        <ListRow icon="volume-high" title="เสียงแจ้งเตือน" right={<Switch value={prefs.sound} onValueChange={toggle('sound')} trackColor={{ true: colors.accent }} />} />
        <ListRow icon="sparkles" title="ดูสดแบบ HD" right={<Switch value={prefs.hd} onValueChange={toggle('hd')} trackColor={{ true: colors.accent }} />} last />
      </Card>

      <PrimaryButton label="ออกจากระบบ" icon="log-out-outline" danger onPress={() => setAskLogout(true)} style={{ marginTop: 28 }} />
      <ConfirmDialog visible={askLogout} danger icon="log-out-outline" title="ออกจากระบบ"
        message={`ต้องการออกจากบัญชี ${currentUser.username} หรือไม่?`} confirmText="ออกจากระบบ"
        onCancel={() => setAskLogout(false)} onConfirm={() => { setAskLogout(false); logout(); }} />
      {/* ยืนยันก่อนรีเซ็ตข้อมูลตัวอย่าง */}
      <ConfirmDialog visible={askReset} danger icon="refresh" title="รีเซ็ตข้อมูลตัวอย่าง"
        message="กล้อง ผู้ใช้ และเหตุการณ์จะกลับเป็นค่าเริ่มต้น คำขอทั้งหมดจะถูกล้าง" confirmText="รีเซ็ต"
        onCancel={() => setAskReset(false)} onConfirm={() => { setAskReset(false); resetDemo(); }} />
      <Text style={styles.version}>The Nexus CCTV 3.0 · ข้อมูลจำลอง (บันทึกในเบราว์เซอร์)</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  profile: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  userName: { color: colors.text, fontSize: 18, fontWeight: '800' },
  sub: { color: colors.textDim, fontSize: 13 },
  perm: { flexDirection: 'row', alignItems: 'center', paddingVertical: 5 },
  permText: { color: colors.text, marginLeft: 10, fontSize: 14 },
  storageHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 },
  storageNum: { color: colors.text, fontSize: 22, fontWeight: '800' },
  plan: { color: colors.accent, fontSize: 12, fontWeight: '700' },
  barBg: { height: 8, backgroundColor: colors.surfaceAlt, borderRadius: 4, overflow: 'hidden' },
  barFill: { height: 8, backgroundColor: colors.accent, borderRadius: 4 },
  version: { color: colors.textDim, textAlign: 'center', marginTop: 16, fontSize: 12 },
});
