import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../AppContext';
import { Chip, SectionTitle } from '../components/ui';
import { colors, radius } from '../theme';

// วันที่ที่มีข้อมูลจำลอง · toHours แปลง "14:30" เป็น 14.5 เพื่อคำนวณตำแหน่งบนไทม์ไลน์ · formatDate แสดงวันที่แบบไทย
const DATES = ['2026-11-07', '2026-11-06', '2026-11-05'];
const toHours = (t) => { const [h, m] = t.split(':').map(Number); return h + m / 60; };
const formatDate = (d) => new Date(d).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });

// แถบไทม์ไลน์ 24 ชม. แสดงช่วงที่มีการบันทึก
function Timeline({ items, selectedId, onSelect }) {
  return (
    <View>
      <View style={styles.timeline}>
        {[6, 12, 18].map((h) => <View key={h} style={[styles.hourLine, { left: `${(h / 24) * 100}%` }]} />)}
        {items.map((r) => {
          // ตำแหน่งซ้าย = เวลาเริ่ม ÷ 24 ชม. · ความกว้าง = ความยาวคลิป ÷ 24 ชม. (คิดเป็น %)
          const start = toHours(r.start);
          const width = Math.max(toHours(r.end) - start, 0.3);
          return (
            <Pressable key={r.id} onPress={() => onSelect(r)}
              style={[styles.segment, {
                left: `${(start / 24) * 100}%`, width: `${(width / 24) * 100}%`,
                backgroundColor: r.type === 'motion' ? colors.warning : colors.accent,
                opacity: selectedId && selectedId !== r.id ? 0.45 : 1,
              }]} />
          );
        })}
      </View>
      <View style={styles.ticks}>
        {[0, 6, 12, 18, 24].map((h) => <Text key={h} style={styles.tick}>{String(h).padStart(2, '0')}:00</Text>)}
      </View>
    </View>
  );
}

// หน้าดูย้อนหลัง (UC-05)
export default function PlaybackScreen({ route }) {
  const { visibleCameras, recordings, getSite } = useApp();
  const [cameraId, setCameraId] = useState(route.params?.cameraId ?? visibleCameras[0]?.id);
  const [date, setDate] = useState(DATES[0]);
  const [selected, setSelected] = useState(null);

  // ถ้าเปิดมาจากหน้ากล้อง ให้เลือกกล้องตัวนั้นอัตโนมัติ
  useEffect(() => { if (route.params?.cameraId) setCameraId(route.params.cameraId); }, [route.params?.cameraId]);

  // คลิปของกล้องและวันที่ที่เลือก (useMemo คำนวณใหม่เฉพาะเมื่อกล้องหรือวันที่เปลี่ยน)
  const items = useMemo(() => recordings.filter((r) => r.cameraId === cameraId && r.date === date), [cameraId, date]);
  const player = useVideoPlayer(null, (p) => { p.loop = false; });

  // เปลี่ยนกล้องหรือวันที่ → หยุดคลิปเดิม
  useEffect(() => { setSelected(null); player.pause(); }, [cameraId, date]);

  // เล่นคลิป: เปลี่ยนวิดีโอในตัวเล่นเป็นคลิปที่เลือกแล้วเล่น
  const play = (rec) => { setSelected(rec); player.replace(rec.url); player.play(); };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.videoBox}>
        {selected ? (
          <VideoView style={StyleSheet.absoluteFill} player={player} contentFit="contain" nativeControls allowsFullscreen />
        ) : (
          <View style={styles.placeholder}>
            <Ionicons name="film-outline" size={44} color={colors.textDim} />
            <Text style={{ color: colors.textDim, marginTop: 8 }}>แตะช่วงบนไทม์ไลน์เพื่อเล่น</Text>
          </View>
        )}
      </View>

      <View style={{ paddingHorizontal: 16 }}>
        <SectionTitle>กล้อง</SectionTitle>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
        {visibleCameras.map((c) => (
          <Chip key={c.id} label={`${c.name} · ${getSite(c.siteId).name}`} active={c.id === cameraId} onPress={() => setCameraId(c.id)} />
        ))}
      </ScrollView>

      <View style={{ paddingHorizontal: 16 }}>
        <SectionTitle>วันที่</SectionTitle>
        <View style={{ flexDirection: 'row' }}>
          {DATES.map((d) => <Chip key={d} label={formatDate(d)} active={d === date} onPress={() => setDate(d)} />)}
        </View>

        <SectionTitle>ไทม์ไลน์</SectionTitle>
        <Timeline items={items} selectedId={selected?.id} onSelect={play} />
        <View style={styles.legend}>
          <View style={[styles.legendDot, { backgroundColor: colors.accent }]} /><Text style={styles.legendText}>บันทึกต่อเนื่อง</Text>
          <View style={[styles.legendDot, { backgroundColor: colors.warning, marginLeft: 16 }]} /><Text style={styles.legendText}>เหตุการณ์</Text>
        </View>

        <SectionTitle>คลิป ({items.length})</SectionTitle>
        {items.length === 0 && <Text style={styles.empty}>ไม่มีการบันทึกในวันนี้</Text>}
        {items.map((r) => (
          <Pressable key={r.id} onPress={() => play(r)} style={[styles.row, selected?.id === r.id && { borderColor: colors.accent }]}>
            <Ionicons name={r.type === 'motion' ? 'pulse' : 'film'} size={22} color={r.type === 'motion' ? colors.warning : colors.accent} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.rowTitle}>{r.start} – {r.end}</Text>
              <Text style={styles.rowSub}>{r.type === 'motion' ? 'บันทึกจากเหตุการณ์' : 'บันทึกต่อเนื่อง'}</Text>
            </View>
            <Ionicons name="play" size={18} color={colors.textDim} />
          </Pressable>
        ))}
      </View>
      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  videoBox: { width: '100%', aspectRatio: 16 / 9, backgroundColor: '#000' },
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  timeline: { height: 34, backgroundColor: colors.surface, borderRadius: radius.sm, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
  hourLine: { position: 'absolute', top: 0, bottom: 0, width: 1, backgroundColor: colors.border },
  segment: { position: 'absolute', top: 4, bottom: 4, minWidth: 5, borderRadius: 3 },
  ticks: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  tick: { color: colors.textDim, fontSize: 10 },
  legend: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  legendDot: { width: 10, height: 10, borderRadius: 3, marginRight: 6 },
  legendText: { color: colors.textDim, fontSize: 12 },
  empty: { color: colors.textDim },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, marginBottom: 8, padding: 14, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border },
  rowTitle: { color: colors.text, fontSize: 15, fontWeight: '600', fontVariant: ['tabular-nums'] },
  rowSub: { color: colors.textDim, fontSize: 12, marginTop: 2 },
});
