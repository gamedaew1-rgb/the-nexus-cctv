import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp, ROLES } from '../AppContext';
import { Avatar, Card, Chip, RoleBadge, Segment } from '../components/ui';
import { colors, radius, shadow } from '../theme';

// สมาชิก (กรองตามบทบาท) และภาพรวมสาขา — Admin และเจ้าหน้าที่องค์กรเข้าได้
export default function TeamScreen({ navigation }) {
  const { members, sites, cameras, currentUser, canEditMember } = useApp();
  const [tab, setTab] = useState('members');
  const [roleFilter, setRoleFilter] = useState('all');
  const list = roleFilter === 'all' ? members : members.filter((m) => m.role === roleFilter);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 110 }}>
        <View style={styles.stats}>
          {Object.keys(ROLES).map((r) => (
            <View key={r} style={styles.stat}>
              <View style={[styles.statIcon, { backgroundColor: ROLES[r].bg }]}><Ionicons name={ROLES[r].icon} size={16} color={ROLES[r].color} /></View>
              <Text style={styles.statValue}>{members.filter((m) => m.role === r).length}</Text>
              <Text style={styles.statLabel} numberOfLines={1}>{ROLES[r].label}</Text>
            </View>
          ))}
        </View>

        <Segment options={[{ value: 'members', label: `สมาชิก (${members.length})` }, { value: 'sites', label: `สาขา (${sites.length})` }]} value={tab} onChange={setTab} />

        {tab === 'members' ? (
          <>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 14 }}>
              <Chip label="ทั้งหมด" active={roleFilter === 'all'} onPress={() => setRoleFilter('all')} />
              {Object.keys(ROLES).map((r) => <Chip key={r} label={ROLES[r].label} active={roleFilter === r} onPress={() => setRoleFilter(r)} />)}
            </ScrollView>
            <Card>
              {list.map((m, i) => (
                <Pressable key={m.id} onPress={() => navigation.navigate('MemberDetail', { memberId: m.id })}
                  style={({ pressed }) => [styles.member, i < list.length - 1 && styles.border, pressed && { backgroundColor: colors.surfaceAlt }]}>
                  <Avatar name={m.name} />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.name}>{m.name}{m.id === currentUser.id ? '  (คุณ)' : ''}</Text>
                    <Text style={styles.sub} numberOfLines={1}>
                      @{m.username} · {m.role === 'admin' ? 'ทุกสาขา' : m.siteIds.map((id) => sites.find((s) => s.id === id)?.name).join(', ') || 'ยังไม่มีสาขา'}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <RoleBadge role={m.role} />
                    {!canEditMember(m) && m.id !== currentUser.id && <Ionicons name="lock-closed" size={12} color="#A3AFC0" style={{ marginTop: 4 }} />}
                  </View>
                </Pressable>
              ))}
            </Card>
          </>
        ) : (
          <View style={{ marginTop: 14 }}>
            {sites.map((s) => {
              const cams = cameras.filter((c) => c.siteId === s.id);
              const online = cams.filter((c) => c.online).length;
              const people = members.filter((m) => m.role === 'admin' || m.siteIds.includes(s.id)).length;
              return (
                <Card key={s.id} style={styles.siteCard}>
                  <View style={styles.siteIcon}><Ionicons name={s.icon} size={22} color={colors.accent} /></View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.name}>{s.name}</Text>
                    <Text style={styles.sub}>{s.address}</Text>
                    <View style={styles.siteMeta}>
                      <Text style={styles.metaText}><Ionicons name="videocam" size={12} /> {online}/{cams.length} ออนไลน์</Text>
                      <Text style={styles.metaText}><Ionicons name="people" size={12} /> {people} คน</Text>
                    </View>
                  </View>
                </Card>
              );
            })}
          </View>
        )}
      </ScrollView>

      {tab === 'members' && (
        <Pressable style={styles.fab} onPress={() => navigation.navigate('InviteMember')}>
          <Ionicons name="person-add" size={20} color="#fff" />
          <Text style={styles.fabText}>เพิ่มสมาชิก</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  stats: { flexDirection: 'row', marginBottom: 16, marginHorizontal: -4 },
  stat: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.md, padding: 12, marginHorizontal: 4, ...shadow },
  statIcon: { width: 30, height: 30, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  statValue: { color: colors.text, fontSize: 22, fontWeight: '800', marginTop: 6 },
  statLabel: { color: colors.textDim, fontSize: 11 },
  member: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  border: { borderBottomWidth: 1, borderBottomColor: colors.border },
  name: { color: colors.text, fontSize: 15, fontWeight: '600' },
  sub: { color: colors.textDim, fontSize: 12, marginTop: 2 },
  siteCard: { flexDirection: 'row', padding: 14, marginBottom: 10 },
  siteIcon: { width: 46, height: 46, borderRadius: 14, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' },
  siteMeta: { flexDirection: 'row', marginTop: 8 },
  metaText: { color: colors.textDim, fontSize: 12, marginRight: 16 },
  fab: { position: 'absolute', right: 20, bottom: 28, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.accent, paddingHorizontal: 18, paddingVertical: 14, borderRadius: 30, ...shadow, shadowOpacity: 0.25 },
  fabText: { color: '#fff', fontWeight: '700', marginLeft: 8 },
});
