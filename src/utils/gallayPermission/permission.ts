import {PermissionsAndroid, Platform} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {check, PERMISSIONS, RESULTS} from 'react-native-permissions';
import {getApiLevel} from 'react-native-device-info';

export const UPLOADED_URIS_KEY = 'uploaded_uris';


export const requestGalleryPermission = async () => {
  if (Platform.OS === 'android') {
    try {
      let permission;

      if (Platform.Version >= 33) {
        permission = PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES;
      } else {
        permission = PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;
      }

      // Check if permission is already granted before requesting
      const currentStatus = await PermissionsAndroid.check(permission);
      if (currentStatus) {
        console.log('Permission already granted');
        return true;
      }

      const granted = await PermissionsAndroid.request(permission);
      const result = granted === PermissionsAndroid.RESULTS.GRANTED;
      return result;
    } catch (err) {
      console.warn('Permission request error:', err);
      return false;
    }
  }

  // iOS doesn't need explicit permission request for photo library access
  // The permission is handled by the system when accessing photos
  return true;
};

export const getMimeTypeFromUri = (uri: string): string => {
  const extension = uri.split('.').pop()?.toLowerCase();

  console.log('extension', extension);

  switch (extension) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'gif':
      return 'image/gif';
    case 'webp':
      return 'image/webp';
    case 'heic':
      return 'image/heic';
    case 'heif':
      return 'image/heif';
    case 'bmp':
      return 'image/bmp';
    case 'tiff':
    case 'tif':
      return 'image/tiff';
    default:
      return 'image/jpeg';
  }
};

export const getFileNameFromUri = (uri: string) => {
  return uri.split('/').pop() || `photo_${Date.now()}.jpg`;
};

export const loadUploadedURIs = async (): Promise<Set<string>> => {
  try {
    const json = await AsyncStorage.getItem(UPLOADED_URIS_KEY);
    return new Set(json ? JSON.parse(json) : []);
  } catch (e) {
    console.log('Failed to load uploaded URIs:', e);
    return new Set();
  }
};

export const checkGalleryPermission = async (): Promise<boolean> => {
  if (Platform.OS === 'ios') {
    const result = await check(PERMISSIONS.IOS.PHOTO_LIBRARY);
    return result === RESULTS.GRANTED;
  }

  if (Platform.OS === 'android') {
    const androidApiLevel = await getApiLevel();


    let permission;

    if (androidApiLevel >= 33) {
      permission = PERMISSIONS.ANDROID.READ_MEDIA_IMAGES;
    } else {
      permission = PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;
    }


    const result = await check(permission);

    return result === RESULTS.GRANTED;
  }

  return false;
};
