// ข้อมูลจำลองทั้งหมดของแอป — ภายหลังเปลี่ยนเป็นดึงจาก API ได้
// streamUrl: เมื่อมีกล้องจริงให้เปลี่ยนเป็นลิงก์ HLS (.m3u8)
const BASE = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/';
// fullZones = โซนตรวจจับ 16 ช่อง (ตาราง 4×4) เปิดทุกช่อง · alarm = ค่าเริ่มต้นการแจ้งเตือนของกล้อง ส่ง o เข้าไปเพื่อเปลี่ยนบางค่า
const fullZones = () => Array(16).fill(true);
const alarm = (o = {}) => ({ enabled: true, schedule: 'always', sensitivity: 'medium', zones: fullZones(), ...o });

// สาขา 3 แห่ง · icon = ชื่อไอคอนที่แสดงในแอป
export const sites = [
  { id: 's1', name: 'สำนักงานใหญ่', address: 'สาทร, กรุงเทพฯ', icon: 'business' },
  { id: 's2', name: 'สาขาบางนา', address: 'บางนา, กรุงเทพฯ', icon: 'storefront' },
  { id: 's3', name: 'โกดังลาดกระบัง', address: 'ลาดกระบัง, กรุงเทพฯ', icon: 'cube' },
];

// กล้อง 8 ตัว: siteId = อยู่สาขาไหน · online: false = กล้องออฟไลน์ · firmware ไม่เท่ากับ latestFirmware = มีอัปเดต
export const cameras = [
  { id: 'cam1', siteId: 's1', name: 'ล็อบบี้', model: 'CH-Dome 2K', firmware: '2.4.1', latestFirmware: '2.5.0', online: true, streamUrl: BASE + 'ForBiggerBlazes.mp4', alarm: alarm() },
  { id: 'cam2', siteId: 's1', name: 'ห้องประชุม', model: 'CH-Dome 2K', firmware: '2.5.0', latestFirmware: '2.5.0', online: true, streamUrl: BASE + 'ForBiggerEscapes.mp4', alarm: alarm({ schedule: 'afterHours' }) },
  { id: 'cam3', siteId: 's1', name: 'ลานจอดรถ', model: 'CH-Bullet 4MP', firmware: '1.9.3', latestFirmware: '2.0.0', online: true, streamUrl: BASE + 'SubaruOutbackOnStreetAndDirt.mp4', alarm: alarm({ sensitivity: 'high' }) },
  { id: 'cam4', siteId: 's2', name: 'หน้าร้าน', model: 'CH-Bullet 4MP', firmware: '2.0.0', latestFirmware: '2.0.0', online: true, streamUrl: BASE + 'ForBiggerFun.mp4', alarm: alarm() },
  { id: 'cam5', siteId: 's2', name: 'แคชเชียร์', model: 'CH-Dome 2K', firmware: '2.4.1', latestFirmware: '2.5.0', online: true, streamUrl: BASE + 'ForBiggerJoyrides.mp4', alarm: alarm({ sensitivity: 'low' }) },
  { id: 'cam6', siteId: 's2', name: 'สต็อกหลังร้าน', model: 'CH-Mini', firmware: '1.2.0', latestFirmware: '1.2.0', online: false, streamUrl: BASE + 'ForBiggerMeltdowns.mp4', alarm: alarm({ enabled: false }) },
  { id: 'cam7', siteId: 's3', name: 'ประตูโกดัง', model: 'CH-Bullet 4MP', firmware: '1.9.3', latestFirmware: '2.0.0', online: true, streamUrl: BASE + 'TearsOfSteel.mp4', alarm: alarm({ schedule: 'night' }) },
  { id: 'cam8', siteId: 's3', name: 'ชั้นวางสินค้า A', model: 'CH-Mini', firmware: '1.2.0', latestFirmware: '1.2.0', online: true, streamUrl: BASE + 'ElephantsDream.mp4', alarm: alarm({ schedule: 'night' }) },
];

// บัญชีล็อกอิน (ทดสอบ) — admin/admin123 · staff/staff123 · member/member123
export const members = [
  { id: 'm1', username: 'admin', password: 'admin123', name: 'สมชาย ผู้ดูแล', contact: 'admin@nexuscctv.test', role: 'admin', siteIds: ['s1', 's2', 's3'] },
  { id: 'm2', username: 'staff', password: 'staff123', name: 'วิภา ใจดี', contact: 'wipa@nexuscctv.test', role: 'staff', siteIds: ['s1', 's2', 's3'] },
  { id: 'm3', username: 'member', password: 'member123', name: 'ธนา มั่นคง', contact: 'thana@nexuscctv.test', role: 'member', siteIds: ['s2'] },
  { id: 'm4', username: 'anucha', password: '1234', name: 'อนุชา ศรีสุข', contact: '081-234-5678', role: 'member', siteIds: ['s1', 's2'] },
  { id: 'm5', username: 'malee', password: '1234', name: 'มาลี รักงาน', contact: '089-876-5432', role: 'member', siteIds: ['s3'] },
];

// คลิปย้อนหลัง: start/end ใช้วางแถบบนไทม์ไลน์ · type 'motion' = บันทึกจากเหตุการณ์ (สีส้ม) · 'continuous' = บันทึกต่อเนื่อง (สีฟ้า)
export const recordings = [
  { id: 'r1', cameraId: 'cam1', date: '2026-11-07', start: '08:00', end: '09:00', type: 'continuous', url: BASE + 'BigBuckBunny.mp4' },
  { id: 'r2', cameraId: 'cam1', date: '2026-11-07', start: '14:12', end: '14:15', type: 'motion', url: BASE + 'ForBiggerBlazes.mp4' },
  { id: 'r3', cameraId: 'cam3', date: '2026-11-07', start: '19:40', end: '19:43', type: 'motion', url: BASE + 'SubaruOutbackOnStreetAndDirt.mp4' },
  { id: 'r4', cameraId: 'cam4', date: '2026-11-07', start: '10:00', end: '12:00', type: 'continuous', url: BASE + 'ForBiggerFun.mp4' },
  { id: 'r5', cameraId: 'cam5', date: '2026-11-06', start: '16:20', end: '16:24', type: 'motion', url: BASE + 'ForBiggerJoyrides.mp4' },
  { id: 'r6', cameraId: 'cam7', date: '2026-11-06', start: '02:05', end: '02:09', type: 'motion', url: BASE + 'TearsOfSteel.mp4' },
  { id: 'r7', cameraId: 'cam8', date: '2026-11-05', start: '22:30', end: '23:30', type: 'continuous', url: BASE + 'ElephantsDream.mp4' },
];

// เหตุการณ์แจ้งเตือน: type กำหนดไอคอนและสี · read: false = ยังไม่อ่าน
export const alerts = [
  { id: 'a1', cameraId: 'cam3', time: '2026-11-07 19:40', type: 'motion', message: 'ตรวจพบการเคลื่อนไหว', read: false },
  { id: 'a2', cameraId: 'cam1', time: '2026-11-07 14:12', type: 'person', message: 'ตรวจพบบุคคล', read: false },
  { id: 'a3', cameraId: 'cam6', time: '2026-11-07 09:01', type: 'offline', message: 'กล้องออฟไลน์', read: false },
  { id: 'a4', cameraId: 'cam5', time: '2026-11-06 16:20', type: 'person', message: 'ตรวจพบบุคคล', read: true },
  { id: 'a5', cameraId: 'cam7', time: '2026-11-06 02:05', type: 'vehicle', message: 'ตรวจพบยานพาหนะ', read: true },
];

// ชื่อองค์กร (แสดงในหน้าแรก) และพื้นที่คลาวด์ (แสดงในหน้าบัญชี)
export const org = { name: 'The Nexus Co., Ltd.' };

export const storage = { usedGB: 37.4, totalGB: 100, plan: 'Business 30 วัน' };
