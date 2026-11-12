// index.js — ไฟล์แรกที่ Expo เรียก (กำหนดใน package.json ช่อง "main") ทำหน้าที่ลงทะเบียน App ให้เป็นคอมโพเนนต์หลัก ใช้ได้ทั้งมือถือและเว็บ
import { registerRootComponent } from 'expo';
import App from './App';

// จุดเริ่มต้นของแอป
registerRootComponent(App);
