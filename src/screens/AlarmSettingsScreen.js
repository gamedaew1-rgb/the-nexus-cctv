import React, { useState } from 'react';
import { View, Text, Switch, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useApp } from '../AppContext';
import { Card, Chip, PrimaryButton, SectionTitle, Segment } from '../components/ui';
import { colors, radius } from '../theme';

export const SCHEDULES = [
  { value: 'always', label: 'ตลอด 24 ชม.' },
  { value: 'afterHours', label: 'นอกเวลาทำการ' },
  { value: 'night', label: 'กลางคืน 20:00–06:00' },
];
export const SENSITIVITY = [
  { value: 'low', label: 'ต่ำ' },
  { value: 'medium', label: 'กลาง' },
  { value: 'high', label: 'สูง' },
];

// ตั้งค่าการแจ้งเตือนรายกล้อง: เปิด/ปิด, ช่วงเวลา, ความไว, โซนตรวจจับ (ตาราง 4x4)
export default function AlarmSettingsScreen({ route, navigation }) {
  const { getCamera, updateCamera } = useApp();
  const camera = getCamera(route.params.cameraId);
  const [draft, setDraft] = useState(camera.alarm);
  const set = (patch) => setDraft((d) => ({ ...d, ...patch }));
  const toggleZone = (i) => set({ zones: draft.zones.map((z, idx) => (idx === i ? !z : z)) });

  const player = useVideoPlayer(camera.online ? camera.streamUrl : null, (p) => { p.muted = true; p.loop = true; p.play(); });
  const activeZones = draft.zones.filter(Boolean).length;

  const save = () => { updateCamera(camera.id, { alarm: draft }); navigation.goBack(); };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <Card style={styles.toggleCard}>
        <View style={{ flex: 1 }}>
          <Text style={styles.camName}>{camera.name}</Text>
          <Text style={styles.dim}>แจ้งเตือนเมื่อพบการเคลื่อนไหว</Text>
        </View>
        <Switch value={draft.enabled} onValueChange={(v) => set({ enabled: v })} trackColor={{ true: colors.accent }} />
      </Card>

      <View style={{ opacity: draft.enabled ? 1 : 0.4 }} pointerEvents={draft.enabled ? 'auto' : 'none'}>
        <SectionTitle>ช่วงเวลาที่แจ้งเตือน</SectionTitle>
        <View style={styles.wrap}>
          {SCHEDULES.map((s) => (
            <View key={s.value} style={{ marginBottom: 8 }}>
              <Chip label={s.label} active={draft.schedule === s.value} onPress={() => set({ schedule: s.value })} />
            </View>
          ))}
        </View>

        <SectionTitle>ความไวในการตรวจจับ</SectionTitle>
        <Segment options={SENSITIVITY} value={draft.sensitivity} onChange={(v) => set({ sensitivity: v })} />

        <SectionTitle>โซนตรวจจับ ({activeZones}/16 ช่อง)</SectionTitle>
        <Text style={[styles.dim, { marginBottom: 10 }]}>แตะช่องเพื่อเปิด/ปิดการตรวจจับในบริเวณนั้น</Text>
        <View style={styles.zoneBox}>
          {camera.online && <VideoView style={StyleSheet.absoluteFill} player={player} contentFit="cover" nativeControls={false} />}
          <View style={styles.grid}>
            {draft.zones.map((on, i) => (
              <Pressable key={i} onPress={() => toggleZone(i)} style={[styles.cell, on && styles.cellOn]} />
            ))}
          </View>
        </View>
        <View style={styles.zoneActions}>
          <Text style={styles.link} onPress={() => set({ zones: Array(16).fill(true) })}>เลือกทั้งหมด</Text>
          <Text style={styles.link} onPress={() => set({ zones: Array(16).fill(false) })}>ล้างทั้งหมด</Text>
        </View>
      </View>

      <PrimaryButton label="บันทึก" icon="checkmark" onPress={save} style={{ marginTop: 24 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  toggleCard: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  camName: { color: colors.text, fontSize: 17, fontWeight: '700' },
  dim: { color: colors.textDim, fontSize: 13, marginTop: 2 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap' },
  zoneBox: { width: '100%', aspectRatio: 16 / 9, backgroundColor: '#000', borderRadius: radius.md, overflow: 'hidden' },
  grid: { ...StyleSheet.absoluteFillObject, flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: '25%', height: '25%', borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.25)' },
  cellOn: { backgroundColor: 'rgba(30,111,255,0.35)', borderColor: colors.accent },
  zoneActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 },
  link: { color: colors.accent, marginLeft: 20, fontWeight: '600' },
});
