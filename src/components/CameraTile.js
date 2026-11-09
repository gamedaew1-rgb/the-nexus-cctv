import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius } from '../theme';

export function useClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return now.toLocaleTimeString('th-TH', { hour12: false });
}

// ช่องแสดงภาพกล้อง 1 ตัว (ใช้ในหน้า Live grid)
export default function CameraTile({ camera, onPress, compact }) {
  const player = useVideoPlayer(camera.online ? camera.streamUrl : null, (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });
  const clock = useClock();

  return (
    <Pressable style={styles.tile} onPress={onPress}>
      {camera.online ? (
        <VideoView style={StyleSheet.absoluteFill} player={player} contentFit="cover" nativeControls={false} />
      ) : (
        <View style={styles.offline}>
          <Ionicons name="videocam-off" size={compact ? 22 : 36} color={colors.textDim} />
          <Text style={styles.offlineText}>ออฟไลน์</Text>
        </View>
      )}

      <View style={styles.topRow}>
        {camera.online && (
          <View style={styles.liveBadge}>
            <View style={styles.dot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        )}
        {!compact && <Text style={styles.clock}>{clock}</Text>}
      </View>

      <View style={styles.bottomRow}>
        <Text style={[styles.name, compact && { fontSize: 11 }]} numberOfLines={1}>{camera.name}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: { flex: 1, aspectRatio: 16 / 9, margin: 3, borderRadius: radius.sm, overflow: 'hidden', backgroundColor: '#000' },
  offline: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceAlt },
  offlineText: { color: colors.textDim, marginTop: 4, fontSize: 12 },
  topRow: { position: 'absolute', top: 6, left: 6, right: 6, flexDirection: 'row', justifyContent: 'space-between' },
  liveBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.55)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.live, marginRight: 4 },
  liveText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  clock: { color: '#fff', fontSize: 11, backgroundColor: 'rgba(0,0,0,0.55)', paddingHorizontal: 6, borderRadius: 4, fontVariant: ['tabular-nums'] },
  bottomRow: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 6, backgroundColor: 'rgba(0,0,0,0.45)' },
  name: { color: '#fff', fontSize: 13, fontWeight: '600' },
});
