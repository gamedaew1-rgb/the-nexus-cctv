import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ScrollView, StyleSheet } from 'react-native';
import { useApp } from '../AppContext';
import CameraTile from '../components/CameraTile';
import { Chip, Segment } from '../components/ui';
import { colors } from '../theme';

const LAYOUTS = [{ value: 1, label: '1' }, { value: 2, label: '4' }, { value: 3, label: '9' }];

export default function LiveGridScreen({ navigation, route }) {
  const { visibleSites, visibleCameras } = useApp();
  const [siteId, setSiteId] = useState('all');
  // รับสาขาที่ส่งมาจากหน้าแรก
  useEffect(() => { if (route.params?.siteId) setSiteId(route.params.siteId); }, [route.params?.siteId]);
  const [cols, setCols] = useState(2);

  const list = siteId === 'all' ? visibleCameras : visibleCameras.filter((c) => c.siteId === siteId);
  const online = list.filter((c) => c.online).length;

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }} contentContainerStyle={styles.sites}>
        <Chip label="ทุกสาขา" icon="layers" active={siteId === 'all'} onPress={() => setSiteId('all')} />
        {visibleSites.map((s) => <Chip key={s.id} label={s.name} icon={s.icon} active={siteId === s.id} onPress={() => setSiteId(s.id)} />)}
      </ScrollView>

      <View style={styles.header}>
        <Text style={styles.summary}>
          <Text style={{ color: colors.online }}>● </Text>{online}/{list.length} ออนไลน์
        </Text>
        <View style={{ width: 130 }}><Segment options={LAYOUTS} value={cols} onChange={setCols} /></View>
      </View>

      <FlatList
        key={cols}
        data={list}
        numColumns={cols}
        keyExtractor={(c) => c.id}
        contentContainerStyle={{ padding: 5 }}
        ListEmptyComponent={<Text style={styles.empty}>ไม่มีกล้องในสาขานี้</Text>}
        renderItem={({ item }) => (
          <View style={{ flex: 1 / cols }}>
            <CameraTile camera={item} compact={cols === 3}
              onPress={() => navigation.navigate('CameraView', { cameraId: item.id })} />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  sites: { paddingHorizontal: 12, paddingTop: 12 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 10 },
  summary: { color: colors.textDim, fontSize: 14 },
  empty: { color: colors.textDim, textAlign: 'center', marginTop: 40 },
});
