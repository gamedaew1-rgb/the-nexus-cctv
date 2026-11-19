import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../AppContext';
import { Chip, ConfirmDialog, PrimaryButton, SectionTitle } from '../components/ui';
import { showAlert } from '../utils/dialog';
import { colors, radius } from '../theme';

// จัดการอุปกรณ์: เพิ่มกล้อง · เลือกหลายตัว → อัปเดตเฟิร์มแวร์ / ย้ายสาขา / ลบ พร้อมกัน
// Manager ทำได้ทันที · Operator กดแล้วจะกลายเป็น "คำขอ" ส่งให้ Manager อนุมัติก่อน (UC-16)
export default function DevicesScreen({ navigation }) {
  const { visibleCameras, visibleSites, getSite, manageCameras, needsApproval, visibleRequests, pendingCount } = useApp();
  const [selected, setSelected] = useState([]);
  const [moving, setMoving] = useState(false);
  const [askDelete, setAskDelete] = useState(false);

  const toggle = (id) => setSelected((l) => (l.includes(id) ? l.filter((x) => x !== id) : [...l, id]));
  // กล้องที่เฟิร์มแวร์ยังไม่ใช่เวอร์ชันล่าสุด
  const needsUpdate = visibleCameras.filter((c) => c.firmware !== c.latestFirmware);
  const selectedNeedUpdate = selected.filter((id) => needsUpdate.some((c) => c.id === id));
  // กล้องที่มีคำขอค้างอยู่ (แสดงป้าย "รออนุมัติ")
  const pendingIds = visibleRequests.filter((r) => r.status === 'pending').flatMap((r) => r.action.ids ?? []);
  const nameOf = (ids) => visibleCameras.filter((c) => ids.includes(c.id)).map((c) => c.name).join(', ');

  // แจ้งผลหลังสั่งงาน: Manager = ทำแล้ว · Operator = ส่งคำขอแล้ว รออนุมัติ
  // Operator → พาไปหน้า "รออนุมัติ" (หน้าคำขอ) เพื่อดูสถานะ
  const notify = (result, doneTitle, doneMsg) => {
    if (result === 'requested') navigation.navigate('Requests', { justSent: true });
    else showAlert(doneTitle, doneMsg);
  };

  // อัปเดตเฟิร์มแวร์ (UC-12): ตั้งสถานะ "กำลังอัปเดต" แล้วจำลองเวลา 2.5 วินาทีก่อนเปลี่ยนเป็นเวอร์ชันล่าสุด
  const updateFirmware = () => {
    const ids = selectedNeedUpdate;
    if (ids.length === 0) return showAlert('ไม่มีอะไรต้องอัปเดต', 'กล้องที่เลือกใช้เฟิร์มแวร์ล่าสุดแล้ว');
    const result = manageCameras({ type: 'firmware', ids }, `อัปเดตเฟิร์มแวร์: ${nameOf(ids)}`);
    setSelected([]);
    if (result === 'requested') notify(result);
  };

  // ย้ายกล้องที่เลือกทั้งหมดไปสาขาใหม่
  const moveTo = (siteId) => {
    const result = manageCameras({ type: 'move', ids: selected, siteId }, `ย้ายกล้อง: ${nameOf(selected)} → ${getSite(siteId).name}`);
    notify(result, 'ย้ายสำเร็จ', `ย้าย ${selected.length} กล้องไปที่ ${getSite(siteId).name} แล้ว`);
    setSelected([]);
    setMoving(false);
  };

  // ลบกล้องที่เลือก (UC-15): ลบกล้องและเหตุการณ์ของกล้องนั้นออกจากระบบ
  const deleteSelected = () => {
    const n = selected.length;
    const result = manageCameras({ type: 'remove', ids: selected }, `ลบกล้อง: ${nameOf(selected)}`);
    setSelected([]);
    setAskDelete(false);
    notify(result, 'ลบกล้องแล้ว', `ลบ ${n} กล้องออกจากระบบแล้ว`);
  };

  const selectedNames = visibleCameras.filter((c) => selected.includes(c.id)).map((c) => c.name).join(', ');

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 220 }}>
        {/* ปุ่มเพิ่มกล้องใหม่ (UC-14) */}
        <PrimaryButton label={needsApproval ? 'ขอเพิ่มกล้องใหม่' : 'เพิ่มกล้องใหม่'} icon="add-circle" onPress={() => navigation.navigate('AddCamera')} style={{ marginBottom: 12 }} />

        {/* Operator: แจ้งว่าต้องรออนุมัติ · ทุกคน: ทางลัดไปหน้าคำขอเมื่อมีคำขอค้าง */}
        {(needsApproval || pendingCount > 0) && (
          <Pressable style={styles.info} onPress={() => navigation.navigate('Requests')}>
            <Ionicons name="shield-checkmark-outline" size={20} color={colors.accent} />
            <Text style={styles.infoText}>
              {needsApproval ? 'การเปลี่ยนแปลงทุกอย่างจะส่งเป็นคำขอให้ Manager อนุมัติก่อน' : 'มีคำขอจาก Operator รออนุมัติ'}
              {pendingCount > 0 ? ` · รออนุมัติ ${pendingCount} รายการ` : ''}
            </Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textDim} />
          </Pressable>
        )}

        {needsUpdate.length > 0 && (
          <Pressable style={styles.banner} onPress={() => setSelected(needsUpdate.map((c) => c.id))}>
            <Ionicons name="arrow-up-circle" size={22} color={colors.warning} />
            <Text style={styles.bannerText}>มี {needsUpdate.length} กล้องที่มีเฟิร์มแวร์ใหม่ · แตะเพื่อเลือกทั้งหมด</Text>
          </Pressable>
        )}

        {visibleCameras.length === 0 && <Text style={styles.empty}>ยังไม่มีกล้อง กด "เพิ่มกล้องใหม่" เพื่อเริ่มต้น</Text>}

        {visibleSites.map((site) => {
          const cams = visibleCameras.filter((c) => c.siteId === site.id);
          if (cams.length === 0) return null;
          return (
            <View key={site.id}>
              <SectionTitle>{site.name}</SectionTitle>
              {cams.map((c) => {
                const on = selected.includes(c.id);
                const outdated = c.firmware !== c.latestFirmware;
                return (
                  <Pressable key={c.id} onPress={() => !c.updating && toggle(c.id)} style={[styles.row, on && styles.rowOn]}>
                    <Ionicons name={on ? 'checkbox' : 'square-outline'} size={22} color={on ? colors.accent : colors.textDim} />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={styles.name}>{c.name}</Text>
                      <Text style={styles.sub}>{c.model} · v{c.firmware}</Text>
                    </View>
                    {pendingIds.includes(c.id) && !c.updating ? (
                      <Text style={[styles.pill, { color: colors.accent, borderColor: colors.accent, marginRight: 6 }]}>รออนุมัติ</Text>
                    ) : null}
                    {c.updating ? (
                      <View style={styles.status}><ActivityIndicator size="small" color={colors.accent} /><Text style={styles.statusText}> กำลังอัปเดต</Text></View>
                    ) : outdated ? (
                      <Text style={[styles.pill, { color: colors.warning, borderColor: colors.warning }]}>มี v{c.latestFirmware}</Text>
                    ) : (
                      <Text style={[styles.pill, { color: colors.online, borderColor: colors.online }]}>ล่าสุด</Text>
                    )}
                  </Pressable>
                );
              })}
            </View>
          );
        })}
      </ScrollView>

      {/* แถบคำสั่งด้านล่าง โผล่เมื่อเลือกกล้องอย่างน้อย 1 ตัว */}
      {selected.length > 0 && (
        <View style={styles.actionBar}>
          {moving ? (
            <>
              <Text style={styles.actionTitle}>{needsApproval ? 'ขอย้าย' : 'ย้าย'} {selected.length} กล้องไปที่</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 10 }}>
                {visibleSites.map((s) => <Chip key={s.id} label={s.name} icon={s.icon} onPress={() => moveTo(s.id)} />)}
              </ScrollView>
              <Text style={styles.cancel} onPress={() => setMoving(false)}>ยกเลิก</Text>
            </>
          ) : (
            <>
              <Text style={styles.actionTitle}>เลือกแล้ว {selected.length} กล้อง</Text>
              <View style={{ flexDirection: 'row', marginTop: 10 }}>
                <PrimaryButton label={needsApproval ? 'ขออัปเดต' : 'อัปเดตเฟิร์มแวร์'} icon="cloud-download" onPress={updateFirmware} style={{ flex: 1, marginRight: 8 }} />
                <PrimaryButton label={needsApproval ? 'ขอย้ายสาขา' : 'ย้ายสาขา'} icon="swap-horizontal" secondary onPress={() => setMoving(true)} style={{ flex: 1 }} />
              </View>
              <PrimaryButton label={`${needsApproval ? 'ขอลบ' : 'ลบ'}กล้องที่เลือก (${selected.length})`} icon="trash-outline" danger onPress={() => setAskDelete(true)} style={{ marginTop: 8 }} />
              <Text style={styles.cancel} onPress={() => setSelected([])}>ยกเลิกการเลือก</Text>
            </>
          )}
        </View>
      )}

      {/* ยืนยันก่อนลบกล้อง */}
      <ConfirmDialog visible={askDelete} danger icon="trash-outline" title={`${needsApproval ? 'ขอลบ' : 'ลบ'} ${selected.length} กล้อง`}
        message={`${selectedNames}\n${needsApproval ? 'คำขอจะส่งให้ Manager อนุมัติ เมื่ออนุมัติแล้ว' : ''}ภาพสดและเหตุการณ์ของกล้องเหล่านี้จะถูกลบด้วย`} confirmText={needsApproval ? 'ส่งคำขอ' : 'ลบกล้อง'}
        onCancel={() => setAskDelete(false)} onConfirm={deleteSelected} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  info: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.accentSoft, borderRadius: radius.md, padding: 12, marginBottom: 12 },
  infoText: { color: colors.text, marginLeft: 10, flex: 1, fontSize: 13 },
  banner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF8EB', borderRadius: radius.md, padding: 12, borderWidth: 1, borderColor: '#FCE3B0' },
  bannerText: { color: '#B26B00', marginLeft: 10, flex: 1, fontSize: 13 },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, padding: 13, borderRadius: radius.md, marginBottom: 8, borderWidth: 1, borderColor: colors.border },
  rowOn: { borderColor: colors.accent },
  name: { color: colors.text, fontSize: 15, fontWeight: '600' },
  sub: { color: colors.textDim, fontSize: 12, marginTop: 2 },
  pill: { fontSize: 11, fontWeight: '700', borderWidth: 1, borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
  status: { flexDirection: 'row', alignItems: 'center' },
  statusText: { color: colors.accent, fontSize: 12 },
  actionBar: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border, padding: 16, paddingBottom: 28 },
  actionTitle: { color: colors.text, fontWeight: '700', fontSize: 15 },
  cancel: { color: colors.textDim, textAlign: 'center', marginTop: 12 },
  empty: { color: colors.textDim, textAlign: 'center', marginTop: 24 },
});
