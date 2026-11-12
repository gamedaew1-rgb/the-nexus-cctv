import { Alert, Platform } from 'react-native';

// Alert ของ React Native ไม่ทำงานบนเว็บ — ใช้ฟังก์ชันเหล่านี้แทนเพื่อให้ใช้ได้ทั้งมือถือและคอม
export function showAlert(title, message = '') {
  if (Platform.OS === 'web') window.alert(message ? `${title}\n\n${message}` : title);
  else Alert.alert(title, message);
}

// หน้าต่างยืนยัน (ตกลง/ยกเลิก) · บนเว็บใช้ window.confirm ของเบราว์เซอร์ บนมือถือใช้ Alert
export function showConfirm(title, message, confirmText, onConfirm) {
  if (Platform.OS === 'web') {
    if (window.confirm(`${title}\n\n${message}`)) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: 'ยกเลิก', style: 'cancel' },
    { text: confirmText, style: 'destructive', onPress: onConfirm },
  ]);
}
