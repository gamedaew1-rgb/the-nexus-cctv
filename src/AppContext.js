import React, { createContext, useContext, useState } from 'react';
import * as mock from './data/mockData';

// state กลางของแอป — ภายหลังเปลี่ยนแต่ละฟังก์ชันเป็นการเรียก API ได้
export const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);

export const ROLES = {
  admin: { label: 'Admin', color: '#1E6FFF', bg: '#E8F0FF', icon: 'shield-checkmark', desc: 'จัดการได้ทุกอย่าง: สมาชิก บทบาท อุปกรณ์ และการแจ้งเตือนทุกสาขา' },
  staff: { label: 'เจ้าหน้าที่องค์กร', color: '#0E9F9A', bg: '#DFF6F5', icon: 'briefcase', desc: 'เพิ่มและจัดการสมาชิก และดูกล้องในสาขาที่รับผิดชอบ' },
  member: { label: 'สมาชิก', color: '#64748B', bg: '#EEF2F7', icon: 'person', desc: 'ดูภาพสดและย้อนหลังได้เฉพาะสาขาที่ได้รับสิทธิ์' },
};

// ตารางสิทธิ์ (ใช้แสดงในหน้าบัญชี)
export const PERMISSIONS = [
  { label: 'ดูภาพสดและย้อนหลัง', roles: ['admin', 'staff', 'member'] },
  { label: 'เพิ่มสมาชิก', roles: ['admin', 'staff'] },
  { label: 'กำหนดบทบาท Admin / เจ้าหน้าที่', roles: ['admin'] },
  { label: 'จัดการอุปกรณ์', roles: ['admin'] },
  { label: 'ตั้งค่าการแจ้งเตือนกล้อง', roles: ['admin'] },
];

export function AppProvider({ children }) {
  const [currentUserId, setCurrentUserId] = useState(null);
  const [sites] = useState(mock.sites);
  const [cameras, setCameras] = useState(mock.cameras);
  const [members, setMembers] = useState(mock.members);
  const [alerts, setAlerts] = useState(mock.alerts);

  const currentUser = members.find((m) => m.id === currentUserId) ?? null;
  const role = currentUser?.role;
  const isAdmin = role === 'admin';
  const canManageTeam = role === 'admin' || role === 'staff';

  const visibleSiteIds = !currentUser ? [] : isAdmin ? sites.map((s) => s.id) : currentUser.siteIds;
  const visibleSites = sites.filter((s) => visibleSiteIds.includes(s.id));
  const visibleCameras = cameras.filter((c) => visibleSiteIds.includes(c.siteId));
  const visibleAlerts = alerts.filter((a) => visibleCameras.some((c) => c.id === a.cameraId));

  // Admin แก้ได้ทุกคนยกเว้นตัวเอง · เจ้าหน้าที่แก้ได้เฉพาะสมาชิก
  const canEditMember = (m) => !!currentUser && m.id !== currentUser.id && (isAdmin || (role === 'staff' && m.role === 'member'));
  const assignableRoles = isAdmin ? ['admin', 'staff', 'member'] : role === 'staff' ? ['member'] : [];

  const updateCameras = (ids, patch) =>
    setCameras((list) => list.map((c) => (ids.includes(c.id) ? { ...c, ...(typeof patch === 'function' ? patch(c) : patch) } : c)));

  const login = (username, password) => {
    const u = members.find((m) => m.username.toLowerCase() === username.trim().toLowerCase() && m.password === password);
    if (u) setCurrentUserId(u.id);
    return !!u;
  };

  const value = {
    currentUser, role, isAdmin, canManageTeam, canManageDevices: isAdmin, canEditAlarm: isAdmin,
    canEditMember, assignableRoles,
    sites, visibleSites, cameras, visibleCameras, members, alerts, visibleAlerts, setAlerts,
    org: mock.org, storage: mock.storage, recordings: mock.recordings,
    getCamera: (id) => cameras.find((c) => c.id === id),
    getSite: (id) => sites.find((s) => s.id === id),
    updateCamera: (id, patch) => updateCameras([id], patch),
    updateCameras,
    updateMember: (id, patch) => setMembers((list) => list.map((m) => (m.id === id ? { ...m, ...patch } : m))),
    addMember: (m) => setMembers((list) => [...list, { ...m, id: 'm' + Date.now() }]),
    removeMember: (id) => setMembers((list) => list.filter((m) => m.id !== id)),
    usernameTaken: (u) => members.some((m) => m.username.toLowerCase() === u.trim().toLowerCase()),
    login,
    logout: () => setCurrentUserId(null),
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
