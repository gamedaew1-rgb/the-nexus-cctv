import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../AppContext';
import { useClock } from '../components/CameraTile';
import { Card, ListRow, SectionTitle } from '../components/ui';
import { showAlert } from '../utils/dialog';
import { colors } from '../theme';
import { SCHEDULES, SENSITIVITY } from './AlarmSettingsScreen';

function ControlButton({ icon, label, active, onPress }) {
  return (
    <Pressable style={styles.ctrl} onPress={onPress}>
      <View style={[styles.ctrlIcon, active && { backgroundColor: colors.live }]}>
        <Ionicons name={icon} size={22} color={active ? '#fff' : colors.accent} />
      </View>
      <Text style={styles.ctrlLabel}>{label}</Text>
    </Pressable>
  );
}

export default function CameraViewScreen({ route, navigation }) {
  const { getCamera, getSite, canEditAlarm } = useApp();
  const camera = getCamera(route.params.cameraId);
  const site = getSite(camera.siteId);
  const [muted, setMuted] = useState(true);
  const [recording, setRecording] = useState(false);
  const clock = useClock();

  const player = useVideoPlayer(camera.online ? camera.streamUrl : null, (p) => { p.loop = true; p.muted = true; p.play(); });

  useEffect(() => navigation.setOptions({ title: camera.name }), [camera.name]);
  useEffect(() => { player.muted = muted; }, [muted]);

  const a = camera.alarm;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.videoBox}>
        {camera.online ? (
          <VideoView style={StyleSheet.absoluteFill} player={player} contentFit="contain" allowsFullscreen nativeControls={false} />
        ) : (
          <View style={styles.offline}>
            <Ionicons name="cloud-offline" size={44} color={colors.textDim} />
            <Text style={{ color: colors.textDim, marginTop: 8 }}>กล้องออฟไลน์</Text>
          </View>
        )}
        <Text style={styles.overlayClock}>{clock}</Text>
        {recording && <View style={styles.recBadge}><View style={styles.recDot} /><Text style={styles.recText}>REC</Text></View>}
      </View>

      <View style={styles.info}>
        <Text style={styles.siteName}>{site.name}</Text>
        <Text style={styles.name}>{camera.name}</Text>
        <Text style={styles.meta}>
          <Text style={{ color: camera.online ? colors.online : colors.live }}>● {camera.online ? 'ออนไลน์' : 'ออฟไลน์'}</Text>
          {'  ·  '}{camera.model}
        </Text>
      </View>

      <View style={styles.controls}>
        <ControlButton icon="camera" label="ถ่ายภาพ" onPress={() => showAlert('ถ่ายภาพ', 'บันทึกภาพแล้ว (จำลอง)')} />
        <ControlButton icon={recording ? 'stop' : 'radio-button-on'} label={recording ? 'หยุด' : 'อัดคลิป'} active={recording} onPress={() => setRecording((r) => !r)} />
        <ControlButton icon={muted ? 'volume-mute' : 'volume-high'} label="เสียง" onPress={() => setMuted((m) => !m)} />
        <ControlButton icon="mic" label="พูด" onPress={() => showAlert('พูดคุย', 'ต้องเชื่อมต่อกล้องจริงก่อน')} />
      </View>

      <View style={{ paddingHorizontal: 16, paddingBottom: 32 }}>
        <SectionTitle>การตั้งค่ากล้อง</SectionTitle>
        <Card>
          <ListRow icon="time" title="ดูย้อนหลัง" subtitle="ไทม์ไลน์ 24 ชั่วโมง"
            onPress={() => navigation.navigate('Main', { screen: 'Playback', params: { cameraId: camera.id } })} last={!canEditAlarm} />
          {canEditAlarm && (
            <ListRow icon="shield-checkmark" title="การแจ้งเตือน"
              subtitle={a.enabled ? `${SCHEDULES.find((x) => x.value === a.schedule).label} · ความไว${SENSITIVITY.find((x) => x.value === a.sensitivity).label}` : 'ปิดอยู่'}
              onPress={() => navigation.navigate('AlarmSettings', { cameraId: camera.id })} last />
          )}
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  videoBox: { width: '100%', aspectRatio: 16 / 9, backgroundColor: '#000' },
  offline: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  overlayClock: { position: 'absolute', top: 8, right: 8, color: '#fff', backgroundColor: 'rgba(0,0,0,0.55)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, fontVariant: ['tabular-nums'] },
  recBadge: { position: 'absolute', top: 8, left: 8, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.55)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  recDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.live, marginRight: 6 },
  recText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  info: { padding: 16, paddingBottom: 8 },
  siteName: { color: colors.accent, fontSize: 12, fontWeight: '700' },
  name: { color: colors.text, fontSize: 22, fontWeight: '800', marginTop: 2 },
  meta: { color: colors.textDim, marginTop: 4 },
  controls: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 8 },
  ctrl: { alignItems: 'center', width: 72 },
  ctrlIcon: { width: 52, height: 52, borderRadius: 16, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' },
  ctrlLabel: { color: colors.textDim, fontSize: 12, marginTop: 6 },
});
