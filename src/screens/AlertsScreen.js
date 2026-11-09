import React, { useState } from 'react';
import { View, Text, Pressable, FlatList, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../AppContext';
import { Chip } from '../components/ui';
import { colors, radius } from '../theme';

const TYPES = {
  motion: { icon: 'pulse', color: colors.warning },
  person: { icon: 'person', color: colors.accent },
  vehicle: { icon: 'car', color: '#60A5FA' },
  offline: { icon: 'cloud-offline', color: colors.live },
};

export default function AlertsScreen({ navigation }) {
  const { visibleAlerts, setAlerts, getCamera, getSite } = useApp();
  const [filter, setFilter] = useState('all');
  const list = filter === 'unread' ? visibleAlerts.filter((a) => !a.read) : visibleAlerts;

  const open = (alert) => {
    setAlerts((all) => all.map((a) => (a.id === alert.id ? { ...a, read: true } : a)));
    navigation.navigate('CameraView', { cameraId: alert.cameraId });
  };
  const markAllRead = () => setAlerts((all) => all.map((a) => ({ ...a, read: true })));

  return (
    <View style={styles.container}>
      <View style={styles.bar}>
        <Chip label="ทั้งหมด" active={filter === 'all'} onPress={() => setFilter('all')} />
        <Chip label="ยังไม่อ่าน" active={filter === 'unread'} onPress={() => setFilter('unread')} />
        <View style={{ flex: 1 }} />
        <Text style={styles.link} onPress={markAllRead}>อ่านทั้งหมด</Text>
      </View>
      <FlatList
        data={list}
        keyExtractor={(a) => a.id}
        contentContainerStyle={{ padding: 16, paddingTop: 4 }}
        ListEmptyComponent={<Text style={styles.empty}>ไม่มีเหตุการณ์</Text>}
        renderItem={({ item }) => {
          const cam = getCamera(item.cameraId);
          const t = TYPES[item.type];
          return (
            <Pressable onPress={() => open(item)} style={styles.row}>
              <View style={[styles.stripe, { backgroundColor: t.color }]} />
              <Ionicons name={t.icon} size={22} color={t.color} style={{ marginHorizontal: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.title, !item.read && { fontWeight: '800' }]}>{item.message}</Text>
                <Text style={styles.sub}>{getSite(cam.siteId).name} › {cam.name}</Text>
                <Text style={styles.time}>{item.time}</Text>
              </View>
              {!item.read && <View style={styles.unreadDot} />}
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  bar: { flexDirection: 'row', alignItems: 'center', padding: 16, paddingBottom: 10 },
  link: { color: colors.accent, fontWeight: '600' },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.md, marginBottom: 8, paddingVertical: 12, paddingRight: 14, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
  stripe: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4 },
  title: { color: colors.text, fontSize: 15 },
  sub: { color: colors.textDim, fontSize: 12, marginTop: 2 },
  time: { color: colors.textDim, fontSize: 11, marginTop: 2 },
  unreadDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: colors.accent },
  empty: { color: colors.textDim, textAlign: 'center', marginTop: 40 },
});
