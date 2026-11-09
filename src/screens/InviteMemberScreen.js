import React, { useState } from 'react';
import { View, Text, TextInput, Switch, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp, ROLES } from '../AppContext';
import { Card, ListRow, PrimaryButton, SectionTitle, Segment } from '../components/ui';
import { showAlert } from '../utils/dialog';
import { colors, radius } from '../theme';

function Field({ icon, ...props }) {
  return (
    <View style={styles.inputWrap}>
      <Ionicons name={icon} size={18} color={colors.textDim} />
      <TextInput style={styles.input} placeholderTextColor="#A3AFC0" {...props} />
    </View>
  );
}

// เพิ่มสมาชิก: สร้างบัญชีล็อกอินใหม่ (ล็อกอินได้ทันทีในแอป)
// Admin เลือกได้ทุกบทบาท · เจ้าหน้าที่องค์กรเพิ่มได้เฉพาะ "สมาชิก"
export default function InviteMemberScreen({ navigation }) {
  const { sites, addMember, assignableRoles, usernameTaken } = useApp();
  const [form, setForm] = useState({ name: '', contact: '', username: '', password: '' });
  const [role, setRole] = useState(assignableRoles.includes('member') ? 'member' : assignableRoles[0]);
  const [siteIds, setSiteIds] = useState([]);
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));
  const toggle = (id, on) => setSiteIds((l) => (on ? [...l, id] : l.filter((x) => x !== id)));

  const submit = () => {
    const { name, contact, username, password } = form;
    if (!name.trim() || !username.trim() || !password) return showAlert('ข้อมูลไม่ครบ', 'กรุณากรอกชื่อ ชื่อผู้ใช้ และรหัสผ่าน');
    if (/\s/.test(username.trim())) return showAlert('ชื่อผู้ใช้ไม่ถูกต้อง', 'ชื่อผู้ใช้ห้ามมีช่องว่าง');
    if (usernameTaken(username)) return showAlert('ชื่อผู้ใช้ซ้ำ', `"${username.trim()}" ถูกใช้แล้ว`);
    if (password.length < 4) return showAlert('รหัสผ่านสั้นเกินไป', 'อย่างน้อย 4 ตัวอักษร');
    if (role !== 'admin' && siteIds.length === 0) return showAlert('ยังไม่ได้เลือกสาขา', 'เลือกอย่างน้อย 1 สาขา');
    addMember({ name: name.trim(), contact: contact.trim() || '-', username: username.trim(), password, role, siteIds: role === 'admin' ? sites.map((s) => s.id) : siteIds });
    showAlert('เพิ่มสมาชิกแล้ว', `ล็อกอินด้วย\nชื่อผู้ใช้: ${username.trim()}\nรหัสผ่าน: ${password}`);
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
      <SectionTitle style={{ marginTop: 4 }}>ข้อมูลส่วนตัว</SectionTitle>
      <Field icon="person-outline" placeholder="ชื่อ-นามสกุล" value={form.name} onChangeText={set('name')} />
      <Field icon="call-outline" placeholder="อีเมล หรือ เบอร์โทร (ไม่บังคับ)" value={form.contact} onChangeText={set('contact')} autoCapitalize="none" />

      <SectionTitle>บัญชีล็อกอิน</SectionTitle>
      <Field icon="at-outline" placeholder="ชื่อผู้ใช้ (ภาษาอังกฤษ)" value={form.username} onChangeText={set('username')} autoCapitalize="none" autoCorrect={false} />
      <Field icon="lock-closed-outline" placeholder="รหัสผ่าน (อย่างน้อย 4 ตัว)" value={form.password} onChangeText={set('password')} autoCapitalize="none" />

      <SectionTitle>บทบาท</SectionTitle>
      {assignableRoles.length > 1 ? (
        <Segment options={assignableRoles.map((r) => ({ value: r, label: ROLES[r].label }))} value={role} onChange={setRole} />
      ) : (
        <Card style={{ padding: 14 }}><Text style={{ color: colors.text, fontWeight: '700' }}>{ROLES[role].label}</Text></Card>
      )}
      <Text style={styles.note}>{ROLES[role].desc}</Text>

      {role !== 'admin' && (
        <>
          <SectionTitle>สาขาที่เข้าถึงได้</SectionTitle>
          <Card>
            {sites.map((s, i) => (
              <ListRow key={s.id} icon={s.icon} title={s.name} last={i === sites.length - 1}
                right={<Switch value={siteIds.includes(s.id)} onValueChange={(v) => toggle(s.id, v)} trackColor={{ true: colors.accent }} />} />
            ))}
          </Card>
        </>
      )}

      <PrimaryButton label="สร้างบัญชี" icon="person-add" onPress={submit} style={{ marginTop: 24 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: 14, marginBottom: 10 },
  input: { flex: 1, color: colors.text, paddingVertical: 14, paddingHorizontal: 10, fontSize: 16 },
  note: { color: colors.textDim, fontSize: 13, marginTop: 8 },
});
