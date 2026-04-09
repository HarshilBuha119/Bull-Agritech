import {Platform, Alert} from 'react-native';
import {
  check,
  request,
  PERMISSIONS,
  RESULTS,
  openSettings,
} from 'react-native-permissions';

export const requestCameraPermission = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') return false;

  const result = await request(PERMISSIONS.ANDROID.CAMERA);

  if (result === RESULTS.GRANTED) {
    return true;
  }

  if (result === RESULTS.BLOCKED) {
    Alert.alert(
      'Camera Permission Blocked',
      'Please enable camera permission from app settings.',
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Open Settings', onPress: openSettings},
      ],
    );
  }

  return false;
};

export const requestStoragePermission = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') return false;

  // Android 13+ uses READ_MEDIA_IMAGES
  const permission =
    parseInt(Platform.Version as string, 10) >= 33
      ? PERMISSIONS.ANDROID.READ_MEDIA_IMAGES
      : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;

  const result = await request(permission);

  if (result === RESULTS.GRANTED) {
    return true;
  }

  if (result === RESULTS.BLOCKED) {
    Alert.alert(
      'Storage Permission Blocked',
      'Please enable storage permission from app settings.',
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Open Settings', onPress: openSettings},
      ],
    );
  }

  return false;
};

export const requestAllPermissions = async (): Promise<boolean> => {
  const camera = await requestCameraPermission();
  const storage = await requestStoragePermission();
  return camera && storage;
};  