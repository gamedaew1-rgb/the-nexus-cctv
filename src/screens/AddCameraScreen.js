// AddCameraScreen.js — หน้าเพิ่มกล้องใหม่ (UC-14) · Manager เพิ่มได้ทันที · Operator ส่งเป็นคำขอให้ Manager อนุมัติ (UC-16)
import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../AppContext';
import { Chip, PrimaryButton, SectionTitle } from '../components/ui';
import { showAlert } from '../utils/dialog';
import { colors, radius } from '../theme';

// รุ่นกล้องที่เลือกได้ พร้อมเฟิร์มแวร์ล่าสุดของแต่ละรุ่น (กล้องใหม่จะได้เวอร์ชันล่าสุดเลย)
const MODELS = [
  { name: 'CH-Dome 2K', firmware: '2.5.0', icon: 'radio-button-on' },
  { name: 'CH-Bullet 4MP', firmware: '2.0.0', icon: 'videocam' },
  { name: 'CH-Mini', firmware: '1.2.0', icon: 'camera' },
];

// ไม่ใส่ลิงก์สตรีม → ใช้วิดีโอตัวอย่างแทนภาพกล้อง (เหมือนกล้องอื่นในข้อมูลจำลอง)
const SAMPLE_STREAM = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';

function Field({ icon, ...props }) {
  return (
    <View style={styles.inputWrap}>
      <Ionicons name={icon} size={18} color={colors.textDim} />
      <TextInput style={styles.input} placeholderTextColor="#A3AFC0" {...props} />
    </View>
  );
}

export default function AddCameraScreen({ navigation, route }) {
  const { visibleSites, manageCameras, needsApproval, cameraNameTaken, getSite } = useApp();
  const [name, setName] = useState('');
  // ถ้าเปิดมาจากสาขาใด ให้เลือกสาขานั้นไว้ก่อน
  const [siteId, setSiteId] = useState(route.params?.siteId ?? null);
  const [model, setModel] = useState(MODELS[0].name);
  const [streamUrl, setStreamUrl] = useState('');

  // ตรวจข้อมูลก่อนเพิ่ม: ต้องมีชื่อ เลือกสาขา ชื่อไม่ซ้ำในสาขาเดียวกัน และลิงก์ (ถ้ากรอก) ต้องขึ้นต้นด้วย http
  const submit = () => {
    const url = streamUrl.trim();
    if (!name.trim()) return showAlert('ข้อมูลไม่ครบ', 'กรุณาตั้งชื่อกล้อง');
    if (!siteId) return showAlert('ยังไม่ได้เลือกสาขา', 'เลือกสาขาที่ติดตั้งกล้อง');
    if (cameraNameTaken(siteId, name)) return showAlert('ชื่อกล้องซ้ำ', `สาขา${getSite(siteId).name} มีกล้องชื่อนี้แล้ว`);
    if (url && !/^https?:\/\//i.test(url)) return showAlert('ลิงก์ไม่ถูกต้อง', 'ลิงก์สตรีมต้องขึ้นต้นด้วย http:// หรือ https://');

    const m = MODELS.find((x) => x.name === model);
    const camera = {
      name: name.trim(),
      siteId,
      model,
      firmware: m.firmware,
      latestFirmware: m.firmware,
      streamUrl: url || SAMPLE_STREAM,
    };
    // Manager → เพิ่มทันที · Operator → ส่งคำขอ
    const result = manageCameras({ type: 'add', camera }, `เพิ่มกล้อง: ${camera.name} · ${getSite(siteId).name} (${model})`);
    // Operator → ปิดหน้านี้แล้วพาไปหน้า "รออนุมัติ" · Manager → แจ้งว่าเพิ่มแล้วและกลับหน้าเดิม
    navigation.goBack();
    if (result === 'requested') navigation.navigate('Requests', { justSent: true });
    else showAlert('เพิ่มกล้องแล้ว', `${camera.name} · ${getSite(siteId).name}`);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
      <SectionTitle style={{ marginTop: 4 }}>ข้อมูลกล้อง</SectionTitle>
      <Field icon="videocam-outline" placeholder="ชื่อกล้อง เช่น ประตูหลัง" value={name} onChangeText={setName} />

      <SectionTitle>สาขาที่ติดตั้ง</SectionTitle>
      <View style={styles.wrap}>
        {visibleSites.map((s) => (
          <View key={s.id} style={{ marginBottom: 8 }}>
            <Chip label={s.name} icon={s.icon} active={siteId === s.id} onPress={() => setSiteId(s.id)} />
          </View>
        ))}
      </View>

      <SectionTitle>รุ่นกล้อง</SectionTitle>
      <View style={styles.wrap}>
        {MODELS.map((m) => (
          <View key={m.name} style={{ marginBottom: 8 }}>
            <Chip label={m.name} icon={m.icon} active={model === m.name} onPress={() => setModel(m.name)} />
          </View>
        ))}
      </View>

      <SectionTitle>ลิงก์สตรีม (ไม่บังคับ)</SectionTitle>
      <Field icon="link-outline" placeholder="https://.../live.m3u8" value={streamUrl} onChangeText={setStreamUrl} autoCapitalize="none" autoCorrect={false} />
      <Text style={styles.note}>ใส่ลิงก์ HLS (.m3u8) หรือ MP4 ของกล้อง · ถ้าเว้นว่างจะใช้วิดีโอตัวอย่าง</Text>

      <PrimaryButton label={needsApproval ? 'ส่งคำขอเพิ่มกล้อง' : 'เพิ่มกล้อง'} icon={needsApproval ? 'paper-plane' : 'add-circle'} onPress={submit} style={{ marginTop: 24 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: 14, marginBottom: 10 },
  input: { flex: 1, color: colors.text, paddingVertical: 14, paddingHorizontal: 10, fontSize: 16 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap' },
  note: { color: colors.textDim, fontSize: 13 },
});
