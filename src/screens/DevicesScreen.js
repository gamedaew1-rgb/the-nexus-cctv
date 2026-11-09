import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../AppContext';
import { Chip, PrimaryButton, SectionTitle } from '../components/ui';
import { showAlert } from '../utils/dialog';
import { colors, radius } from '../theme';

// จัดการอุปกรณ์: เลือกหลายตัว → อัปเดตเฟิร์มแวร์ / ย้ายสาขา พร้อมกัน
export default function DevicesScreen() {
  const { visibleCameras, visibleSites, getSite, updateCameras } = useApp();
  const [selected, setSelected] = useState([]);
  const [moving, setMoving] = useState(false);

  const toggle = (id) => setSelected((l) => (l.includes(id) ? l.filter((x) => x !== id) : [...l, id]));
  const needsUpdate = visibleCameras.filter((c) => c.firmware !== c.latestFirmware);
  const selectedNeedUpdate = selected.filter((id) => needsUpdate.some((c) => c.id === id));

  const updateFirmware = () => {
    const ids = selectedNeedUpdate;
    if (ids.length === 0) return showAlert('ไม่มีอะไรต้องอัปเดต', 'กล้องที่เลือกใช้เฟิร์มแวร์ล่าสุดแล้ว');
    updateCameras(ids, { updating: true });
    setSelected([]);
    // จำลองเวลาอัปเดต
    setTimeout(() => updateCameras(ids, (c) => ({ updating: false, firmware: c.latestFirmware })), 2500);
  };

  const moveTo = (siteId) => {
    updateCameras(selected, { siteId });
    showAlert('ย้ายสำเร็จ', `ย้าย ${selected.length} กล้องไปที่ ${getSite(siteId).name} แล้ว`);
    setSelected([]);
    setMoving(false);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 160 }}>
        {needsUpdate.length > 0 && (
          <Pressable style={styles.banner} onPress={() => setSelected(needsUpdate.map((c) => c.id))}>
            <Ionicons name="arrow-up-circle" size={22} color={colors.warning} />
            <Text style={styles.bannerText}>มี {needsUpdate.length} กล้องที่มีเฟิร์มแวร์ใหม่ · แตะเพื่อเลือกทั้งหมด</Text>
          </Pressable>
        )}

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

      {selected.length > 0 && (
        <View style={styles.actionBar}>
          {moving ? (
            <>
              <Text style={styles.actionTitle}>ย้าย {selected.length} กล้องไปที่</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 10 }}>
                {visibleSites.map((s) => <Chip key={s.id} label={s.name} icon={s.icon} onPress={() => moveTo(s.id)} />)}
              </ScrollView>
              <Text style={styles.cancel} onPress={() => setMoving(false)}>ยกเลิก</Text>
            </>
          ) : (
            <>
              <Text style={styles.actionTitle}>เลือกแล้ว {selected.length} กล้อง</Text>
              <View style={{ flexDirection: 'row', marginTop: 10 }}>
                <PrimaryButton label="อัปเดตเฟิร์มแวร์" icon="cloud-download" onPress={updateFirmware} style={{ flex: 1, marginRight: 8 }} />
                <PrimaryButton label="ย้ายสาขา" icon="swap-horizontal" secondary onPress={() => setMoving(true)} style={{ flex: 1 }} />
              </View>
              <Text style={styles.cancel} onPress={() => setSelected([])}>ยกเลิกการเลือก</Text>
            </>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
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
});
