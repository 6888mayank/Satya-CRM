/**
 * SATYA ENTERPRISE CRM — Device Fingerprinting & Machine Token Generator
 * Creates a persistent client machine identifier for hardware pinning and security whitelisting.
 */

export interface DeviceMetadata {
  fingerprint: string;
  deviceName: string;
  osPlatform: string;
  browserInfo: string;
  screenResolution: string;
  timeZone: string;
  language: string;
}

const STORAGE_KEY = 'SATYA_CRM_DEVICE_TOKEN_V1';

export function getOrCreateDeviceFingerprint(): DeviceMetadata {
  if (typeof window === 'undefined') {
    return {
      fingerprint: 'DEV-SATYA-SERVER-0000',
      deviceName: 'Server Environment',
      osPlatform: 'Server',
      browserInfo: 'NodeJS',
      screenResolution: '0x0',
      timeZone: 'UTC',
      language: 'en'
    };
  }

  let fingerprint = localStorage.getItem(STORAGE_KEY);

  if (!fingerprint) {
    const randomHex = () => Math.random().toString(36).substring(2, 6).toUpperCase();
    const timeHex = Date.now().toString(16).substring(4).toUpperCase();
    fingerprint = `DEV-SATYA-${timeHex}-${randomHex()}-${randomHex()}`;
    localStorage.setItem(STORAGE_KEY, fingerprint);
  }

  // Detect OS Platform
  const ua = window.navigator.userAgent;
  let os = 'Unknown OS';
  if (/Macintosh|Mac OS X/i.test(ua)) os = 'Apple macOS';
  else if (/Windows NT 10.0/i.test(ua)) os = 'Microsoft Windows 10/11';
  else if (/Windows NT/i.test(ua)) os = 'Microsoft Windows';
  else if (/Android/i.test(ua)) os = 'Google Android';
  else if (/iPhone|iPad|iPod/i.test(ua)) os = 'Apple iOS';
  else if (/Linux/i.test(ua)) os = 'Linux';

  // Detect Browser
  let browser = 'Unknown Browser';
  if (/Edg\//i.test(ua)) browser = 'Microsoft Edge';
  else if (/Chrome\//i.test(ua)) browser = 'Google Chrome';
  else if (/Safari\//i.test(ua) && !/Chrome/i.test(ua)) browser = 'Apple Safari';
  else if (/Firefox\//i.test(ua)) browser = 'Mozilla Firefox';

  const screenRes = `${window.screen?.width || 0}x${window.screen?.height || 0}`;
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata';
  const lang = window.navigator.language || 'en-IN';

  // Human-friendly default name for this computer
  const deviceName = `${os} (${browser})`;

  return {
    fingerprint,
    deviceName,
    osPlatform: os,
    browserInfo: browser,
    screenResolution: screenRes,
    timeZone: tz,
    language: lang
  };
}
