import {NativeModules, Platform} from 'react-native';
import Geolocation from '@react-native-community/geolocation';

const {ExifModule} = NativeModules;

export interface ExifData {
  latitude: string;
  longitude: string;
  gpsLatRef: string;
  gpsLonRef: string;
  dateTime: string;
  dateTimeOriginal: string;
  make: string;
  model: string;
  width: string;
  height: string;
  orientation: string;
  flash: string;
  focalLength: string;
  exposureTime: string;
  iso: string;
}

// For UI: what PhotoCard will consume
export interface ExifDisplayRow {
  key: string;
  label: string;
  icon: string; // MaterialCommunityIcons name
  value: string;
}

export const getCurrentLocation = (): Promise<{lat: number; lon: number} | null> => {
  return new Promise(resolve => {
    Geolocation.getCurrentPosition(
      position => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      () => resolve(null),
      {enableHighAccuracy: true, timeout: 5000, maximumAge: 10000},
    );
  });
};

export const getExifData = async (imagePath: string): Promise<ExifData> => {
  if (Platform.OS !== 'android') throw new Error('Android only');
  if (!ExifModule) throw new Error('ExifModule not found');

  const cleanPath = imagePath.replace('file://', '');

  try {
    const data = await ExifModule.getExifData(cleanPath);
    const exif = data as ExifData;

    // If GPS is missing from file, try to get current location
    if (exif.latitude === 'N/A' || exif.longitude === 'N/A') {
      const location = await getCurrentLocation();
      if (location) {
        exif.latitude = Math.abs(location.lat).toString();
        exif.longitude = Math.abs(location.lon).toString();
        exif.gpsLatRef = location.lat >= 0 ? 'N' : 'S';
        exif.gpsLonRef = location.lon >= 0 ? 'E' : 'W';
      }
    }

    return exif;
  } catch (error: any) {
    throw new Error(`Failed to read EXIF: ${error.message}`);
  }
};

export const formatGPS = (
  lat: string,
  lon: string,
  latRef: string,
  lonRef: string,
): string => {
  if (!lat || lat === 'N/A' || !lon || lon === 'N/A') return 'Not available';
  const latNum = parseFloat(lat);
  const lonNum = parseFloat(lon);
  if (isNaN(latNum) || isNaN(lonNum)) return 'Not available';
  return `${latNum.toFixed(5)}° ${latRef},  ${lonNum.toFixed(5)}° ${lonRef}`;
};

export const formatExifForDisplay = (exif: ExifData): ExifDisplayRow[] => {
  return [
    {
      key: 'date',
      label: 'Date Taken',
      icon: 'calendar-outline',
      value: exif.dateTimeOriginal !== 'N/A' ? exif.dateTimeOriginal : exif.dateTime,
    },
    {
      key: 'device',
      label: 'Device',
      icon: 'cellphone',
      value: exif.model !== 'N/A' ? `${exif.make} ${exif.model}` : 'N/A',
    },
    {
      key: 'gps',
      label: 'GPS',
      icon: 'map-marker-outline',
      value: formatGPS(exif.latitude, exif.longitude, exif.gpsLatRef, exif.gpsLonRef),
    },
    {
      key: 'resolution',
      label: 'Resolution',
      icon: 'image-size-select-large',
      value: exif.width !== 'N/A' ? `${exif.width} × ${exif.height}` : 'N/A',
    },
    {
      key: 'iso',
      label: 'ISO',
      icon: 'iso',
      value: exif.iso,
    },
    {
      key: 'exposure',
      label: 'Exposure',
      icon: 'exposure',
      value: exif.exposureTime,
    },
    {
      key: 'focalLength',
      label: 'Focal Length',
      icon: 'ray-start-end',
      value: exif.focalLength,
    },
  ];
};