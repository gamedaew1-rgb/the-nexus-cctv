import React, { useCallback, useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { setStatusBarStyle } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../AppContext';
import { Card, ConfirmDialog, RoleBadge, SectionTitle } from '../components/ui';
import { colors, radius, shadow } from '../theme';

const ALERT_ICON = { motion: 'pulse', person: 'person', vehicle: 'car', offline: 'cloud-offline' };

// คำทักทายตามช่วงเวลาของวัน
function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'สวัสดีตอนเช้า' : h < 17 ? 'สวัสดีตอนบ่าย' : 'สวัสดีตอนเย็น';
}

// หน้าแรก: ภาพรวมองค์กร เมนูลัด สาขา และเหตุการณ์ล่าสุด
export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { currentUser, org, visibleSites, visibleCameras, visibleAlerts, canManageTeam, canManageDevices, getCamera, getSite, logout } = useApp();
  const [askLogout, setAskLogout] = useState(false);

  // แถบสถานะตัวอักษรสีขาวเฉพาะหน้านี้ (หัวสีฟ้า)
  useFocusEffect(useCallback(() => {
    setStatusBarStyle('light');
    return () => setStatusBarStyle('dark');
  }, []));

  // นับกล้องออนไลน์และเหตุการณ์ที่ยังไม่อ่าน สำหรับการ์ดสรุป
  const online = visibleCameras.filter((c) => c.online).length;
  const unread = visibleAlerts.filter((a) => !a.read).length;

  // เมนูลัดแบบไอคอน: เมนูที่มีเงื่อนไข (canManageTeam / canManageDevices) แสดงเฉพาะบทบาทที่มีสิทธิ์ · .filter(Boolean) ตัดเมนูที่เป็น false ออก
  const actions = [
    { icon: 'grid', label: 'ภาพสด', onPress: () => navigation.navigate('Live') },
    { icon: 'play-circle', label: 'ย้อนหลัง', onPress: () => navigation.navigate('Playback') },
    { icon: 'notifications', label: 'เหตุการณ์', onPress: () => navigation.navigate('Alerts') },
    canManageTeam && { icon: 'person-add', label: 'เพิ่มสมาชิก', onPress: () => navigation.navigate('InviteMember') },
    canManageTeam && { icon: 'people', label: 'สมาชิก', onPress: () => navigation.navigate('Team') },
    canManageDevices && { icon: 'hardware-chip', label: 'อุปกรณ์', onPress: () => navigation.navigate('Devices') },
    { icon: 'person-circle', label: 'บัญชี', onPress: () => navigation.navigate('More') },
  ].filter(Boolean);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>
      {/* หัวสีฟ้า */}
      <View style={[styles.hero, { paddingTop: insets.top + 14 }]}>
        <View style={styles.bubble} />
        <View style={styles.heroTop}>
          <View style={{ flex: 1 }}>
            <Text style={styles.hello}>{greeting()} 👋</Text>
            <Text style={styles.userName}>{currentUser.name}</Text>
          </View>
          <Pressable style={styles.bell} onPress={() => navigation.navigate('Alerts')}>
            <Ionicons name="notifications-outline" size={22} color="#fff" />
            {unread > 0 && <View style={styles.bellBadge}><Text style={styles.bellBadgeText}>{unread}</Text></View>}
          </Pressable>
          {/* ปุ่มออกจากระบบ (UC-02) */}
          <Pressable style={[styles.bell, { marginLeft: 8 }]} onPress={() => setAskLogout(true)}>
            <Ionicons name="log-out-outline" size={22} color="#fff" />
          </Pressable>
        </View>
        <View style={styles.orgRow}>
          <Ionicons name="business" size={14} color="rgba(255,255,255,0.85)" />
          <Text style={styles.orgName}>{org.name}</Text>
          <RoleBadge role={currentUser.role} light />
        </View>
      </View>

      {/* การ์ดสรุป */}
      <Card style={styles.summary}>
        <Stat value={visibleCameras.length} label="กล้องทั้งหมด" color={colors.accent} />
        <View style={styles.divider} />
        <Stat value={online} label="ออนไลน์" color={colors.online} />
        <View style={styles.divider} />
        <Stat value={visibleCameras.length - online} label="ออฟไลน์" color={colors.live} />
        <View style={styles.divider} />
        <Stat value={unread} label="เหตุการณ์ใหม่" color={colors.warning} />
      </Card>

      <View style={{ paddingHorizontal: 16 }}>
        {/* เมนูลัด */}
        <Card style={styles.actions}>
          {actions.map((a) => (
            <Pressable key={a.label} style={styles.action} onPress={a.onPress}>
              <View style={styles.actionIcon}><Ionicons name={a.icon} size={22} color={colors.accent} /></View>
              <Text style={styles.actionLabel}>{a.label}</Text>
            </Pressable>
          ))}
        </Card>

        {/* สาขา */}
        <SectionTitle>สาขาของฉัน</SectionTitle>
        {/* การ์ดแต่ละสาขาที่มีสิทธิ์เห็น: กดหัวการ์ด → หน้ากล้องของสาขานั้น · กดรูปย่อ → เปิดกล้องตัวนั้น */}
        {visibleSites.map((site) => {
          const cams = visibleCameras.filter((c) => c.siteId === site.id);
          const on = cams.filter((c) => c.online).length;
          return (
            <Card key={site.id} style={styles.siteCard}>
              <Pressable style={styles.siteHead} onPress={() => navigation.navigate('Live', { siteId: site.id })}>
                <View style={styles.siteIcon}><Ionicons name={site.icon} size={20} color={colors.accent} /></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.siteName}>{site.name}</Text>
                  <Text style={styles.siteSub}>
                    <Text style={{ color: colors.online }}>● </Text>{on}/{cams.length} ออนไลน์ · {site.address}
                  </Text>
                </View>
                <Text style={styles.link}>ดูทั้งหมด</Text>
              </Pressable>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 12 }}>
                {cams.map((c) => (
                  <Pressable key={c.id} style={styles.thumb} onPress={() => navigation.navigate('CameraView', { cameraId: c.id })}>
                    <View style={[styles.thumbImg, !c.online && { backgroundColor: '#CBD5E1' }]}>
                      <Ionicons name={c.online ? 'videocam' : 'videocam-off'} size={22} color="rgba(255,255,255,0.9)" />
                      {c.online && <View style={styles.liveTag}><Text style={styles.liveText}>LIVE</Text></View>}
                    </View>
                    <Text style={styles.thumbName} numberOfLines={1}>{c.name}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </Card>
          );
        })}

        {/* เหตุการณ์ล่าสุด */}
        <SectionTitle right={<Text style={styles.link} onPress={() => navigation.navigate('Alerts')}>ดูทั้งหมด</Text>}>
          เหตุการณ์ล่าสุด
        </SectionTitle>
        <Card>
          {visibleAlerts.length === 0 && <Text style={styles.empty}>ยังไม่มีเหตุการณ์</Text>}
          {/* แสดงเหตุการณ์ล่าสุด 3 รายการ */}
          {visibleAlerts.slice(0, 3).map((a, i, arr) => {
            const cam = getCamera(a.cameraId);
            return (
              <Pressable key={a.id} onPress={() => navigation.navigate('CameraView', { cameraId: a.cameraId })}
                style={[styles.event, i < arr.length - 1 && styles.eventBorder]}>
                <View style={[styles.eventIcon, a.type === 'offline' && { backgroundColor: '#FFF1F1' }]}>
                  <Ionicons name={ALERT_ICON[a.type]} size={18} color={a.type === 'offline' ? colors.live : colors.accent} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.eventTitle, !a.read && { fontWeight: '800' }]}>{a.message}</Text>
                  <Text style={styles.siteSub}>{getSite(cam.siteId).name} › {cam.name}</Text>
                </View>
                <Text style={styles.eventTime}>{a.time.slice(11)}</Text>
              </Pressable>
            );
          })}
        </Card>
      </View>

      {/* หน้าต่างยืนยันออกจากระบบ */}
      <ConfirmDialog visible={askLogout} danger icon="log-out-outline" title="ออกจากระบบ"
        message={`ต้องการออกจากบัญชี ${currentUser.username} หรือไม่?`} confirmText="ออกจากระบบ"
        onCancel={() => setAskLogout(false)} onConfirm={() => { setAskLogout(false); logout(); }} />
    </ScrollView>
  );
}

// Stat = ตัวเลข 1 ช่องในการ์ดสรุป
function Stat({ value, label, color }) {
  return (
    <View style={styles.stat}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  hero: { backgroundColor: colors.accent, paddingHorizontal: 20, paddingBottom: 56, borderBottomLeftRadius: 28, borderBottomRightRadius: 28, overflow: 'hidden' },
  bubble: { position: 'absolute', width: 240, height: 240, borderRadius: 120, backgroundColor: 'rgba(255,255,255,0.08)', top: -80, right: -70 },
  heroTop: { flexDirection: 'row', alignItems: 'center' },
  hello: { color: 'rgba(255,255,255,0.85)', fontSize: 14 },
  userName: { color: '#fff', fontSize: 22, fontWeight: '800', marginTop: 2 },
  bell: { width: 42, height: 42, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' },
  bellBadge: { position: 'absolute', top: 6, right: 6, minWidth: 16, height: 16, borderRadius: 8, backgroundColor: colors.live, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
  bellBadgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  orgRow: { flexDirection: 'row', alignItems: 'center', marginTop: 14 },
  orgName: { color: 'rgba(255,255,255,0.9)', marginLeft: 6, marginRight: 10, fontSize: 13 },
  summary: { flexDirection: 'row', marginHorizontal: 16, marginTop: -36, paddingVertical: 16 },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: '800' },
  statLabel: { color: colors.textDim, fontSize: 11, marginTop: 2 },
  divider: { width: 1, backgroundColor: colors.border, marginVertical: 4 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 14, paddingVertical: 8 },
  action: { width: '25%', alignItems: 'center', paddingVertical: 10 },
  actionIcon: { width: 48, height: 48, borderRadius: 16, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' },
  actionLabel: { color: colors.text, fontSize: 12, marginTop: 6 },
  siteCard: { marginBottom: 12, overflow: 'hidden' },
  siteHead: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  siteIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  siteName: { color: colors.text, fontSize: 15, fontWeight: '700' },
  siteSub: { color: colors.textDim, fontSize: 12, marginTop: 2 },
  link: { color: colors.accent, fontWeight: '600', fontSize: 13 },
  thumb: { width: 118, marginRight: 10 },
  thumbImg: { height: 70, borderRadius: 10, backgroundColor: '#5B8DEF', alignItems: 'center', justifyContent: 'center' },
  liveTag: { position: 'absolute', top: 6, left: 6, backgroundColor: colors.live, borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1 },
  liveText: { color: '#fff', fontSize: 9, fontWeight: '800' },
  thumbName: { color: colors.text, fontSize: 12, marginTop: 6 },
  event: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  eventBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  eventIcon: { width: 36, height: 36, borderRadius: 11, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  eventTitle: { color: colors.text, fontSize: 14 },
  eventTime: { color: colors.textDim, fontSize: 12 },
  empty: { color: colors.textDim, padding: 16, textAlign: 'center' },
});
