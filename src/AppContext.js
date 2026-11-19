// AppContext.js — "สมอง" ของแอป เก็บข้อมูลกลาง (ผู้ใช้ที่ล็อกอิน กล้อง สมาชิก เหตุการณ์) และกฎสิทธิ์ของแต่ละบทบาท ทุกหน้าเรียกใช้ผ่าน useApp()
import React, { createContext, useContext, useState } from 'react';
import * as mock from './data/mockData';

// state กลางของแอป — ภายหลังเปลี่ยนแต่ละฟังก์ชันเป็นการเรียก API ได้
export const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);

// ข้อมูลของ 3 บทบาท: ชื่อที่แสดง สีป้าย ไอคอน และคำอธิบายสิทธิ์
export const ROLES = {
  admin: { label: 'Admin', color: '#1E6FFF', bg: '#E8F0FF', icon: 'shield-checkmark', desc: 'จัดการได้ทุกอย่าง: สมาชิก บทบาท อุปกรณ์ และการแจ้งเตือนทุกสาขา' },
  staff: { label: 'เจ้าหน้าที่องค์กร', color: '#0E9F9A', bg: '#DFF6F5', icon: 'briefcase', desc: 'เพิ่มและจัดการสมาชิก ดูกล้อง และส่งคำขอจัดการกล้องให้ Admin อนุมัติ ในสาขาที่รับผิดชอบ' },
  member: { label: 'สมาชิก', color: '#64748B', bg: '#EEF2F7', icon: 'person', desc: 'ดูภาพสดและย้อนหลังได้เฉพาะสาขาที่ได้รับสิทธิ์' },
};

// ตารางสิทธิ์ (ใช้แสดงในหน้าบัญชี)
export const PERMISSIONS = [
  { label: 'ดูภาพสดและย้อนหลัง', roles: ['admin', 'staff', 'member'] },
  { label: 'เพิ่มสมาชิก', roles: ['admin', 'staff'] },
  { label: 'กำหนดบทบาท Admin / เจ้าหน้าที่', roles: ['admin'] },
  { label: 'จัดการอุปกรณ์ (เพิ่ม ลบ ย้าย อัปเดตกล้อง) · เจ้าหน้าที่ต้องรอ Admin อนุมัติ', roles: ['admin', 'staff'] },
  { label: 'อนุมัติคำขอจัดการกล้อง', roles: ['admin'] },
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
  // คำขอจัดการกล้องจากเจ้าหน้าที่ (เริ่มต้นว่าง) · status: 'pending' รออนุมัติ / 'approved' อนุมัติแล้ว / 'rejected' ไม่อนุมัติ
  const [requests, setRequests] = useState([]);

  // หาผู้ใช้ที่ล็อกอินอยู่ แล้วคำนวณสิทธิ์จากบทบาท (role)
  const currentUser = members.find((m) => m.id === currentUserId) ?? null;
  const role = currentUser?.role;
  const isAdmin = role === 'admin';
  const canManageTeam = role === 'admin' || role === 'staff';
  // จัดการกล้องได้: Admin ทำได้ทันที · เจ้าหน้าที่ทำได้แต่ต้องส่งคำขอให้ Admin อนุมัติก่อน (needsApproval)
  const canManageDevices = isAdmin || role === 'staff';
  const needsApproval = role === 'staff';

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

  // เพิ่มกล้องใหม่: สร้างรหัสไม่ซ้ำจากเวลาปัจจุบัน และตั้งค่าการแจ้งเตือนเริ่มต้น (เปิด, ตลอด 24 ชม., ความไวกลาง, เปิดทุกโซน)
  const addCamera = (cam) =>
    setCameras((list) => [...list, {
      ...cam,
      id: 'cam' + Date.now(),
      online: true,
      alarm: { enabled: true, schedule: 'always', sensitivity: 'medium', zones: Array(16).fill(true) },
    }]);

  // ลบกล้องหลายตัวพร้อมกัน และลบเหตุการณ์แจ้งเตือนของกล้องเหล่านั้นด้วย
  const removeCameras = (ids) => {
    setCameras((list) => list.filter((c) => !ids.includes(c.id)));
    setAlerts((list) => list.filter((a) => !ids.includes(a.cameraId)));
  };

  // ----- คำขอจัดการกล้อง (UC-16, UC-17) -----
  // action = สิ่งที่จะทำกับกล้อง: { type: 'add', camera } · { type: 'remove', ids } · { type: 'move', ids, siteId } · { type: 'firmware', ids }
  const applyAction = (a) => {
    if (a.type === 'add') addCamera(a.camera);
    else if (a.type === 'remove') removeCameras(a.ids);
    else if (a.type === 'move') updateCameras(a.ids, { siteId: a.siteId });
    else if (a.type === 'firmware') {
      // จำลองการอัปเดต 2.5 วินาที แล้วเปลี่ยนเป็นเวอร์ชันล่าสุด
      updateCameras(a.ids, { updating: true });
      setTimeout(() => updateCameras(a.ids, (c) => ({ updating: false, firmware: c.latestFirmware })), 2500);
    }
  };

  // เวลาปัจจุบันในรูปแบบ "ปปปป-ดด-วว ชช:นน"
  const nowText = () => {
    const d = new Date();
    const p = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
  };

  // จุดเดียวที่ทุกหน้าใช้จัดการกล้อง: Admin → ทำทันที คืนค่า 'done' · เจ้าหน้าที่ → สร้างคำขอรออนุมัติ คืนค่า 'requested'
  // summary = ข้อความสั้น ๆ ที่ Admin จะเห็นในรายการคำขอ เช่น "ลบกล้อง: ล็อบบี้"
  const manageCameras = (action, summary) => {
    if (!needsApproval) { applyAction(action); return 'done'; }
    setRequests((list) => [{
      id: 'rq' + Date.now(), action, summary,
      byId: currentUser.id, byName: currentUser.name, time: nowText(), status: 'pending',
    }, ...list]);
    return 'requested';
  };

  // Admin ตัดสินคำขอ: อนุมัติ → ทำตามคำขอจริง · ไม่อนุมัติ → แค่เปลี่ยนสถานะ (ตรวจว่ายังรออยู่ กันกดซ้ำ)
  const decideRequest = (id, approve) => {
    const r = requests.find((x) => x.id === id);
    if (!isAdmin || !r || r.status !== 'pending') return;
    if (approve) applyAction(r.action);
    setRequests((list) => list.map((x) => (x.id === id ? { ...x, status: approve ? 'approved' : 'rejected', decidedBy: currentUser.name, decidedAt: nowText() } : x)));
  };

  // คำขอที่ผู้ใช้คนนี้เห็น: Admin เห็นทั้งหมด · เจ้าหน้าที่เห็นเฉพาะที่ตัวเองส่ง
  const visibleRequests = isAdmin ? requests : requests.filter((r) => r.byId === currentUser?.id);
  const pendingCount = visibleRequests.filter((r) => r.status === 'pending').length;

  // ล็อกอิน: หาบัญชีที่ชื่อผู้ใช้ (ไม่สนตัวพิมพ์เล็ก/ใหญ่) และรหัสผ่านตรงกัน ถ้าเจอจะจำผู้ใช้ไว้และคืนค่า true · ในอนาคตเปลี่ยนตรงนี้เป็นเรียก API ของ Backend
  const login = (username, password) => {
    const u = members.find((m) => m.username.toLowerCase() === username.trim().toLowerCase() && m.password === password);
    if (u) setCurrentUserId(u.id);
    return !!u;
  };

  // รวมทุกอย่างที่หน้าจอต้องใช้ ส่งออกผ่าน Context · canEditAlarm เป็นสิทธิ์ของ Admin เท่านั้น · canManageDevices = Admin และเจ้าหน้าที่ (เจ้าหน้าที่ต้องรออนุมัติ)
  const value = {
    currentUser, role, isAdmin, canManageTeam, canManageDevices, needsApproval, canEditAlarm: isAdmin,
    manageCameras, decideRequest, visibleRequests, pendingCount,
    canEditMember, assignableRoles,
    sites, visibleSites, cameras, visibleCameras, members, alerts, visibleAlerts, setAlerts,
    org: mock.org, storage: mock.storage, recordings: mock.recordings,
    getCamera: (id) => cameras.find((c) => c.id === id),
    getSite: (id) => sites.find((s) => s.id === id),
    updateCamera: (id, patch) => updateCameras([id], patch),
    updateCameras,
    addCamera,
    removeCameras,
    // ชื่อกล้องซ้ำในสาขาเดียวกันหรือไม่ (ไม่สนช่องว่างหัวท้าย)
    cameraNameTaken: (siteId, name) => cameras.some((c) => c.siteId === siteId && c.name.trim() === name.trim()),
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
