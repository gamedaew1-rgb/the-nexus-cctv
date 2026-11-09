import React from 'react';
import { View, Text, Pressable, StyleSheet, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ROLES } from '../AppContext';
import { colors, radius, shadow } from '../theme';

export function Chip({ label, icon, active, onPress }) {
  return (
    <Pressable onPress={onPress} style={[s.chip, active && s.chipActive]}>
      {icon && <Ionicons name={icon} size={14} color={active ? '#fff' : colors.textDim} style={{ marginRight: 5 }} />}
      <Text style={[s.chipText, active && { color: '#fff', fontWeight: '700' }]}>{label}</Text>
    </Pressable>
  );
}

export function Segment({ options, value, onChange }) {
  return (
    <View style={s.segment}>
      {options.map((o) => (
        <Pressable key={o.value} onPress={() => onChange(o.value)} style={[s.segBtn, value === o.value && s.segActive]}>
          <Text style={[s.segText, value === o.value && { color: colors.accent }]} numberOfLines={1}>{o.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

export function RoleBadge({ role, light }) {
  const r = ROLES[role];
  return (
    <View style={[s.badge, { backgroundColor: light ? 'rgba(255,255,255,0.22)' : r.bg }]}>
      <Ionicons name={r.icon} size={11} color={light ? '#fff' : r.color} style={{ marginRight: 4 }} />
      <Text style={[s.badgeText, { color: light ? '#fff' : r.color }]}>{r.label}</Text>
    </View>
  );
}

export const SectionTitle = ({ children, style, right }) => (
  <View style={[s.sectionRow, style]}>
    <Text style={s.section}>{children}</Text>
    {right}
  </View>
);

export const Card = ({ children, style }) => <View style={[s.card, style]}>{children}</View>;

export function ListRow({ icon, iconColor, title, subtitle, right, onPress, last }) {
  return (
    <Pressable onPress={onPress} disabled={!onPress} style={({ pressed }) => [s.row, !last && s.rowBorder, pressed && { backgroundColor: colors.surfaceAlt }]}>
      {icon && <View style={s.rowIcon}><Ionicons name={icon} size={18} color={iconColor ?? colors.accent} /></View>}
      <View style={{ flex: 1 }}>
        <Text style={s.rowTitle}>{title}</Text>
        {!!subtitle && <Text style={s.rowSub}>{subtitle}</Text>}
      </View>
      {right ?? (onPress && <Ionicons name="chevron-forward" size={18} color={colors.textDim} />)}
    </Pressable>
  );
}

export function PrimaryButton({ label, icon, onPress, danger, secondary, disabled, style }) {
  const fg = danger ? colors.live : secondary ? colors.accent : '#fff';
  return (
    <Pressable onPress={onPress} disabled={disabled}
      style={({ pressed }) => [s.btn, danger && s.btnDanger, secondary && s.btnSecondary, (pressed || disabled) && { opacity: 0.7 }, style]}>
      {icon && <Ionicons name={icon} size={18} color={fg} style={{ marginRight: 6 }} />}
      <Text style={[s.btnText, { color: fg }]}>{label}</Text>
    </Pressable>
  );
}

export function Avatar({ name, size = 42, dark }) {
  return (
    <View style={[s.avatar, { width: size, height: size, borderRadius: size * 0.32 }, dark && { backgroundColor: colors.accent }]}>
      <Text style={[s.avatarText, { fontSize: size * 0.42 }, dark && { color: '#fff' }]}>{name.trim().slice(0, 1)}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  chip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.surface, marginRight: 8, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipText: { color: colors.textDim, fontSize: 13 },
  segment: { flexDirection: 'row', backgroundColor: colors.surfaceAlt, borderRadius: radius.sm + 2, padding: 3 },
  segBtn: { flex: 1, paddingHorizontal: 10, paddingVertical: 8, borderRadius: radius.sm, alignItems: 'center' },
  segActive: { backgroundColor: colors.surface, ...shadow, shadowOpacity: 0.06 },
  segText: { color: colors.textDim, fontWeight: '600', fontSize: 13 },
  badge: { flexDirection: 'row', alignItems: 'center', borderRadius: 20, paddingHorizontal: 9, paddingVertical: 3 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 22, marginBottom: 10 },
  section: { color: colors.text, fontSize: 16, fontWeight: '800' },
  card: { backgroundColor: colors.surface, borderRadius: radius.md, ...shadow },
  row: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  rowIcon: { width: 36, height: 36, borderRadius: 11, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  rowTitle: { color: colors.text, fontSize: 15, fontWeight: '500' },
  rowSub: { color: colors.textDim, fontSize: 12, marginTop: 2 },
  btn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.accent, borderRadius: radius.md, padding: 15 },
  btnDanger: { backgroundColor: '#FFF1F1', borderWidth: 1, borderColor: '#FBD5D5' },
  btnSecondary: { backgroundColor: colors.accentSoft },
  btnText: { fontSize: 15, fontWeight: '700' },
  avatar: { backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.accent, fontWeight: '800' },
});

// หน้าต่างยืนยันที่วาดในแอปเอง — ทำงานได้ทั้งมือถือและเว็บ (Alert ของ React Native ใช้บนเว็บไม่ได้)
export function ConfirmDialog({ visible, icon = 'help-circle', title, message, confirmText = 'ยืนยัน', danger, onCancel, onConfirm }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable style={d.backdrop} onPress={onCancel}>
        <Pressable style={d.box} onPress={() => {}}>
          <View style={[d.icon, { backgroundColor: danger ? '#FFF1F1' : colors.accentSoft }]}>
            <Ionicons name={icon} size={28} color={danger ? colors.live : colors.accent} />
          </View>
          <Text style={d.title}>{title}</Text>
          {!!message && <Text style={d.message}>{message}</Text>}
          <View style={d.row}>
            <Pressable style={[d.btn, d.cancel]} onPress={onCancel}>
              <Text style={d.cancelText}>ยกเลิก</Text>
            </Pressable>
            <Pressable style={[d.btn, { backgroundColor: danger ? colors.live : colors.accent }]} onPress={onConfirm}>
              <Text style={d.okText}>{confirmText}</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const d = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(15,30,54,0.45)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  box: { width: '100%', maxWidth: 360, backgroundColor: colors.surface, borderRadius: radius.lg, padding: 22, alignItems: 'center', ...shadow },
  icon: { width: 56, height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  title: { color: colors.text, fontSize: 18, fontWeight: '800', textAlign: 'center' },
  message: { color: colors.textDim, fontSize: 14, textAlign: 'center', marginTop: 6 },
  row: { flexDirection: 'row', marginTop: 20, alignSelf: 'stretch' },
  btn: { flex: 1, paddingVertical: 13, borderRadius: radius.md, alignItems: 'center' },
  cancel: { backgroundColor: colors.surfaceAlt, marginRight: 10 },
  cancelText: { color: colors.text, fontWeight: '700' },
  okText: { color: '#fff', fontWeight: '700' },
});
