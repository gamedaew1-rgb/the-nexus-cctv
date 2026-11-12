# The Nexus CCTV (React Native + Expo SDK 58) — Frontend only

แอปดูกล้อง CCTV สำหรับธุรกิจหลายสาขา ใช้ข้อมูลจำลอง (mock) และวิดีโอตัวอย่างแทนภาพจากกล้องจริง

## สิ่งที่ต้องมี
- Node.js (LTS) และ VS Code
- แอป **Expo Go** บนมือถือ (รุ่นที่รองรับ SDK 58)

## วิธีรัน (โฟลเดอร์ใหม่)
เปิดโฟลเดอร์นี้ใน VS Code แล้วรันใน Terminal ทีละบรรทัด
```bash
npm install
npm run setup
npx expo start -c
```
- `npm install` ติดตั้ง Expo SDK 58
- `npm run setup` ติดตั้งแพ็กเกจที่เหลือในเวอร์ชันที่ตรงกับ SDK 58 อัตโนมัติ
- สแกน QR ด้วย Expo Go (มือถือกับคอมต้องใช้ Wi-Fi เดียวกัน) ถ้าเชื่อมไม่ได้ใช้ `npx expo start --tunnel`

ถ้า PowerShell ขึ้น "running scripts is disabled" ให้เปลี่ยน Terminal เป็น Command Prompt

## บัญชีทดสอบ
| บทบาท | ชื่อผู้ใช้ | รหัสผ่าน | ทำอะไรได้ |
|---|---|---|---|
| Admin | `admin` | `admin123` | ทุกอย่าง: สมาชิก บทบาท อุปกรณ์ การแจ้งเตือน ทุกสาขา |
| เจ้าหน้าที่องค์กร | `staff` | `staff123` | เพิ่ม/แก้ไข/ลบ "สมาชิก" และดูกล้อง |
| สมาชิก | `member` | `member123` | ดูภาพสดและย้อนหลังเฉพาะสาขาที่ได้รับสิทธิ์ |

บัญชีอยู่ใน `src/data/mockData.js` (`members`) · บัญชีที่เพิ่มผ่านแอปล็อกอินได้ทันที แต่จะหายเมื่อรีโหลดแอป (ยังไม่มี Backend)

## โครงสร้าง
| ส่วน | ไฟล์ |
|---|---|
| Navigation (แท็บ + สแตก) | `App.js` |
| State กลาง / สิทธิ์ / บทบาท | `src/AppContext.js` |
| ข้อมูลจำลอง (สาขา กล้อง สมาชิก คลิป เหตุการณ์) | `src/data/mockData.js` |
| สี | `src/theme.js` |
| คอมโพเนนต์ร่วม | `src/components/ui.js`, `src/components/CameraTile.js` |

## หน้าจอ (`src/screens/`)
| หน้า | ไฟล์ |
|---|---|
| ล็อกอิน (บัญชีแยก 3 บทบาท) | `LoginScreen.js` |
| หน้าแรก: ภาพรวม เมนูลัด สาขา เหตุการณ์ล่าสุด | `HomeScreen.js` |
| ภาพสด กริด 1/4/9 + กรองตามสาขา | `LiveGridScreen.js` |
| ดูกล้องตัวเดียว | `CameraViewScreen.js` |
| ตั้งค่าการแจ้งเตือน (ช่วงเวลา ความไว โซนตรวจจับ) | `AlarmSettingsScreen.js` |
| ดูย้อนหลัง + ไทม์ไลน์ 24 ชม. | `PlaybackScreen.js` |
| เหตุการณ์ | `AlertsScreen.js` |
| ทีม: สมาชิก / สาขา | `TeamScreen.js` |
| แก้สิทธิ์สมาชิก | `MemberDetailScreen.js` |
| เพิ่มสมาชิก (สร้างบัญชีล็อกอิน) | `InviteMemberScreen.js` |
| จัดการอุปกรณ์ (อัปเดตเฟิร์มแวร์ / ย้ายสาขาทีละหลายตัว) | `DevicesScreen.js` |
| บัญชี: โปรไฟล์ สิทธิ์ พื้นที่คลาวด์ | `SettingsScreen.js` |

## เปลี่ยนเป็นกล้องจริงในอนาคต
- เปลี่ยน `streamUrl` ใน `src/data/mockData.js` เป็นลิงก์ **HLS (.m3u8)** ได้ทันที
- กล้องที่ส่ง **RTSP** โดยตรง `expo-video` เล่นไม่ได้ ต้องให้ Backend/NVR แปลงเป็น HLS หรือ WebRTC ก่อน
- ฟังก์ชันใน `src/AppContext.js` (login, updateCamera, addMember ฯลฯ) คือจุดที่จะเปลี่ยนเป็นเรียก API

## ไฟล์ตั้งค่า (ไฟล์ JSON เขียนคอมเมนต์ในไฟล์ไม่ได้ จึงอธิบายไว้ที่นี่)
| ไฟล์ | หน้าที่ |
|---|---|
| `package.json` | รายชื่อแพ็กเกจและคำสั่ง: `npm run setup-all` ติดตั้งแพ็กเกจที่ตรงกับ Expo SDK 58 · `npm run web` เปิดบนเว็บ · `npm run build:web` สร้างไฟล์เว็บในโฟลเดอร์ `dist` · `"main": "index.js"` บอกว่าแอปเริ่มที่ไฟล์ไหน |
| `app.json` | ข้อมูลแอปของ Expo: ชื่อแอป, ธีม, ปลั๊กอิน `expo-video` |
| `vercel.json` | วิธีที่ Vercel build เว็บ: ติดตั้งแพ็กเกจ → `npm run build:web` → เผยแพร่โฟลเดอร์ `dist` |

ไฟล์ `.js` ทุกไฟล์มีคอมเมนต์ภาษาไทยอธิบายการทำงานแต่ละจุด และระบุรหัส Use case (UC-01 ถึง UC-13) ตรงจุดที่โค้ดทำ Use case นั้น
