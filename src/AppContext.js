// AppContext.js — "สมอง" ของแอป เก็บข้อมูลกลาง (ผู้ใช้ที่ล็อกอิน กล้อง สมาชิก เหตุการณ์) และกฎสิทธิ์ของแต่ละบทบาท ทุกหน้าเรียกใช้ผ่าน useApp()
import React, { createContext, useContext, useState } from 'react';
import * as mock from './data/mockData';

// state กลางของแอป — ภายหลังเปลี่ยนแต่ละฟังก์ชันเป็นการเรียก API ได้
export const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);

// ข้อมูลของ 3 บทบาท: ชื่อที่แสดง สีป้าย ไอคอน และคำอธิบายสิทธิ์
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

// AppProvider = ตัวเก็บ state กลาง ถูกครอบทั้งแอปใน App.js
export function AppProvider({ children }) {
  // useState = ตัวแปรที่เปลี่ยนค่าแล้วหน้าจออัปเดตเอง · ค่าเริ่มต้นมาจาก mockData · currentUserId = null แปลว่ายังไม่ล็อกอิน
  const [currentUserId, setCurrentUserId] = useState(null);
  const [sites] = useState(mock.sites);
  const [cameras, setCameras] = useState(mock.cameras);
  const [members, setMembers] = useState(mock.members);
  const [alerts, setAlerts] = useState(mock.alerts);

  // หาผู้ใช้ที่ล็อกอินอยู่ แล้วคำนวณสิทธิ์จากบทบาท (role)
  const currentUser = members.find((m) => m.id === currentUserId) ?? null;
  const role = currentUser?.role;
  const isAdmin = role === 'admin';
  const canManageTeam = role === 'admin' || role === 'staff';

  // กรองข้อมูลตามสิทธิ์: Admin เห็นทุกสาขา · บทบาทอื่นเห็นเฉพาะสาขาใน siteIds ของตัวเอง แล้วกรองกล้องและเหตุการณ์ตามสาขาที่เห็น
  const visibleSiteIds = !currentUser ? [] : isAdmin ? sites.map((s) => s.id) : currentUser.siteIds;
  const visibleSites = sites.filter((s) => visibleSiteIds.includes(s.id));
  const visibleCameras = cameras.filter((c) => visibleSiteIds.includes(c.siteId));
  const visibleAlerts = alerts.filter((a) => visibleCameras.some((c) => c.id === a.cameraId));

  // Admin แก้ได้ทุกคนยกเว้นตัวเอง · เจ้าหน้าที่แก้ได้เฉพาะสมาชิก
  const canEditMember = (m) => !!currentUser && m.id !== currentUser.id && (isAdmin || (role === 'staff' && m.role === 'member'));
  // บทบาทที่ผู้ใช้ปัจจุบันกำหนดให้คนอื่นได้: Admin = ทุกบทบาท · เจ้าหน้าที่ = สมาชิกเท่านั้น · สมาชิก = ไม่ได้เลย
  const assignableRoles = isAdmin ? ['admin', 'staff', 'member'] : role === 'staff' ? ['member'] : [];

  // แก้ข้อมูลกล้องหลายตัวพร้อมกัน (ใช้ในหน้าจัดการอุปกรณ์) patch เป็นค่าคงที่หรือฟังก์ชันก็ได้
  const updateCameras = (ids, patch) =>
    setCameras((list) => list.map((c) => (ids.includes(c.id) ? { ...c, ...(typeof patch === 'function' ? patch(c) : patch) } : c)));

  // ล็อกอิน: หาบัญชีที่ชื่อผู้ใช้ (ไม่สนตัวพิมพ์เล็ก/ใหญ่) และรหัสผ่านตรงกัน ถ้าเจอจะจำผู้ใช้ไว้และคืนค่า true · ในอนาคตเปลี่ยนตรงนี้เป็นเรียก API ของ Backend
  const login = (username, password) => {
    const u = members.find((m) => m.username.toLowerCase() === username.trim().toLowerCase() && m.password === password);
    if (u) setCurrentUserId(u.id);
    return !!u;
  };

  // รวมทุกอย่างที่หน้าจอต้องใช้ ส่งออกผ่าน Context · canManageDevices และ canEditAlarm เป็นสิทธิ์ของ Admin เท่านั้น
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
    // เพิ่มสมาชิกใหม่ ใช้เวลาปัจจุบัน (Date.now) สร้างรหัสที่ไม่ซ้ำ
    addMember: (m) => setMembers((list) => [...list, { ...m, id: 'm' + Date.now() }]),
    removeMember: (id) => setMembers((list) => list.filter((m) => m.id !== id)),
    usernameTaken: (u) => members.some((m) => m.username.toLowerCase() === u.trim().toLowerCase()),
    login,
    // ออกจากระบบ = ล้างผู้ใช้ปัจจุบัน แล้ว RootNavigator จะพากลับหน้า Login เอง
    logout: () => setCurrentUserId(null),
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
