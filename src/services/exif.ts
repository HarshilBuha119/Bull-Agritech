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

type LocationMode = 'balanced' | 'fast';

const isMissingExifValue = (value?: string | null): boolean => {
  if (value == null) return true;
  const normalized = String(value).trim();
  return normalized.length === 0 || normalized.toUpperCase() === 'N/A';
};

export const getCurrentLocation = (
  mode: LocationMode = 'balanced',
): Promise<{lat: number; lon: number} | null> => {
  const tryGetPosition = (
    options: {enableHighAccuracy: boolean; timeout: number; maximumAge: number},
    label: string,
  ): Promise<{lat: number; lon: number} | null> => {
    return new Promise(resolve => {
      Geolocation.getCurrentPosition(
        position => {
          resolve({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        error => {
          console.log(`getCurrentLocation ${label} error:`, error.code, error.message);
          resolve(null);
        },
        options,
      );
    });
  };

  return (async () => {
    if (mode === 'fast') {
      // Fast mode for capture pipeline: prefer quick coarse/cached fix to avoid UI delay.
      const coarse = await tryGetPosition(
        {enableHighAccuracy: false, timeout: 2500, maximumAge: 300000},
        'fast-fallback',
      );
      if (coarse) return coarse;

      return tryGetPosition(
        {enableHighAccuracy: true, timeout: 3000, maximumAge: 10000},
        'fast-high-accuracy',
      );
    }

    // Step 1: attempt precise GPS fix.
    const precise = await tryGetPosition(
      {enableHighAccuracy: true, timeout: 20000, maximumAge: 10000},
      'high-accuracy',
    );
    if (precise) return precise;

    // Step 2: fallback to coarse/cached location for faster recovery.
    return tryGetPosition(
      {enableHighAccuracy: false, timeout: 12000, maximumAge: 300000},
      'fallback',
    );
  })();
};

export const getExifData = async (imagePath: string): Promise<ExifData> => {
  if (Platform.OS !== 'android') throw new Error('Android only');
  if (!ExifModule) throw new Error('ExifModule not found');

  const cleanPath = imagePath.replace('file://', '');

  try {
    const data = await ExifModule.getExifData(cleanPath);
    const exif = data as ExifData;

    // If GPS is missing from file, do a quick location fallback so capture stays responsive.
    if (isMissingExifValue(exif.latitude) || isMissingExifValue(exif.longitude)) {
      const location = await getCurrentLocation('fast');
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