import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ScrollView, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../AppContext';
import CameraTile from '../components/CameraTile';
import { Chip } from '../components/ui';
import { colors, radius } from '../theme';

// รูปแบบกริด: value = จำนวนคอลัมน์ (กล้องต่อแถว) 1, 2, 3 · ตัวเลขบนปุ่มตรงกับ value · icon = ไอคอนรูปกริดที่แสดงคู่กับตัวเลข
const LAYOUTS = [
  { value: 1, icon: 'square' },
  { value: 2, icon: 'grid' },
  { value: 3, icon: 'apps' },
];

// ปุ่มเลือกมุมมองกริด: ไอคอน + ตัวเลข 1 / 2 / 3 (จำนวนกล้องต่อแถว) · ปุ่มที่เลือกอยู่เป็นพื้นฟ้าตัวอักษรขาว ส่วนปุ่มอื่นเป็นพื้นขาวมีขอบ
function LayoutPicker({ value, onChange }) {
  return (
    <View style={styles.picker}>
      {LAYOUTS.map((o) => {
        const active = value === o.value;
        return (
          <Pressable key={o.value} onPress={() => onChange(o.value)}
            accessibilityRole="button" accessibilityLabel={`แสดง ${o.value} กล้องต่อแถว`} accessibilityState={{ selected: active }}
            style={({ pressed }) => [styles.pickBtn, active && styles.pickActive, pressed && !active && { backgroundColor: colors.surfaceAlt }]}>
            <Ionicons name={active ? o.icon : `${o.icon}-outline`} size={14} color={active ? '#fff' : colors.textDim} />
            <Text style={[styles.pickText, active && { color: '#fff' }]}>{o.value}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// หน้าภาพสด (UC-04): กรองตามสาขาและสลับขนาดกริด
export default function LiveGridScreen({ navigation, route }) {
  const { visibleSites, visibleCameras } = useApp();
  const [siteId, setSiteId] = useState('all');
  // รับสาขาที่ส่งมาจากหน้าแรก
  useEffect(() => { if (route.params?.siteId) setSiteId(route.params.siteId); }, [route.params?.siteId]);
  const [cols, setCols] = useState(2);

  // กล้องที่จะแสดง: ทุกสาขา หรือเฉพาะสาขาที่เลือก (มาจาก visibleCameras จึงเห็นเฉพาะสาขาที่มีสิทธิ์)
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
        <LayoutPicker value={cols} onChange={setCols} />
      </View>

      {/* FlatList แสดงกล้องเป็นกริด · key={cols} บังคับให้สร้างใหม่เมื่อเปลี่ยนจำนวนคอลัมน์ (FlatList เปลี่ยน numColumns ระหว่างทางไม่ได้) */}
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
  picker: { flexDirection: 'row', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm + 4, padding: 3 },
  pickBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 7, borderRadius: radius.sm, marginLeft: 2 },
  pickActive: { backgroundColor: colors.accent },
  pickText: { color: colors.textDim, fontWeight: '700', fontSize: 13, marginLeft: 5 },
  empty: { color: colors.textDim, textAlign: 'center', marginTop: 40 },
});
