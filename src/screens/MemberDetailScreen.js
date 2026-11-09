import React, { useState } from 'react';
import { View, Text, Switch, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp, ROLES } from '../AppContext';
import { Avatar, Card, ConfirmDialog, ListRow, PrimaryButton, RoleBadge, SectionTitle, Segment } from '../components/ui';
import { colors, radius } from '../theme';

// ดู/แก้บทบาทและสาขาของสมาชิก — สิทธิ์แก้ขึ้นกับบทบาทของผู้ใช้ปัจจุบัน
export default function MemberDetailScreen({ route, navigation }) {
  const { members, sites, updateMember, removeMember, currentUser, canEditMember, assignableRoles } = useApp();
  const [askRemove, setAskRemove] = useState(false);
  const member = members.find((m) => m.id === route.params.memberId);
  if (!member) return null;

  const editable = canEditMember(member);
  const isSelf = member.id === currentUser.id;
  const allSites = member.role === 'admin';

  const toggleSite = (siteId, on) =>
    updateMember(member.id, { siteIds: on ? [...member.siteIds, siteId] : member.siteIds.filter((id) => id !== siteId) });


  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <View style={styles.head}>
        <Avatar name={member.name} size={76} dark />
        <Text style={styles.name}>{member.name}</Text>
        <Text style={styles.contact}>@{member.username} · {member.contact}</Text>
        <View style={{ marginTop: 10 }}><RoleBadge role={member.role} /></View>
      </View>

      {!editable && (
        <View style={styles.notice}>
          <Ionicons name="lock-closed" size={16} color={colors.textDim} />
          <Text style={styles.noticeText}>
            {isSelf ? 'ไม่สามารถแก้ไขสิทธิ์ของตัวเองได้' : 'คุณไม่มีสิทธิ์แก้ไขบัญชีนี้ (เจ้าหน้าที่องค์กรแก้ไขได้เฉพาะสมาชิก)'}
          </Text>
        </View>
      )}

      <SectionTitle>บทบาท</SectionTitle>
      {editable && assignableRoles.length > 1 ? (
        <Segment options={assignableRoles.map((r) => ({ value: r, label: ROLES[r].label }))}
          value={member.role} onChange={(role) => updateMember(member.id, { role })} />
      ) : (
        <Card style={{ padding: 14 }}><Text style={styles.roleLabel}>{ROLES[member.role].label}</Text></Card>
      )}
      <Text style={styles.note}>{ROLES[member.role].desc}</Text>

      <SectionTitle>สาขาที่เข้าถึงได้</SectionTitle>
      <Card>
        {sites.map((s, i) => (
          <ListRow key={s.id} icon={s.icon} title={s.name} subtitle={s.address} last={i === sites.length - 1}
            right={<Switch value={allSites || member.siteIds.includes(s.id)} disabled={!editable || allSites}
              onValueChange={(v) => toggleSite(s.id, v)} trackColor={{ true: colors.accent }} />} />
        ))}
      </Card>
      {allSites && <Text style={styles.note}>Admin เข้าถึงได้ทุกสาขาโดยอัตโนมัติ</Text>}

      {editable && <PrimaryButton label="ลบบัญชีนี้" icon="trash-outline" danger onPress={() => setAskRemove(true)} style={{ marginTop: 28 }} />}
      <ConfirmDialog visible={askRemove} danger icon="trash-outline" title="ลบบัญชี"
        message={`ต้องการลบบัญชี ${member.name} (@${member.username}) หรือไม่?`} confirmText="ลบบัญชี"
        onCancel={() => setAskRemove(false)} onConfirm={() => { setAskRemove(false); removeMember(member.id); navigation.goBack(); }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  head: { alignItems: 'center', paddingVertical: 8 },
  name: { color: colors.text, fontSize: 20, fontWeight: '800', marginTop: 12 },
  contact: { color: colors.textDim, marginTop: 2 },
  notice: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceAlt, borderRadius: radius.sm, padding: 12, marginTop: 16 },
  noticeText: { color: colors.textDim, marginLeft: 8, flex: 1, fontSize: 13 },
  roleLabel: { color: colors.text, fontWeight: '700' },
  note: { color: colors.textDim, fontSize: 13, marginTop: 8 },
});
