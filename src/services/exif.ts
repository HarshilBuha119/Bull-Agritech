import {NativeModules, Platform} from 'react-native';

const {ExifModule} = NativeModules;

export interface ExifData {
  // GPS
  latitude: string;
  longitude: string;
  gpsLatRef: string;
  gpsLonRef: string;

  // Timestamp
  dateTime: string;
  dateTimeOriginal: string;

  // Device
  make: string;
  model: string;

  // Image info
  width: string;
  height: string;
  orientation: string;
  flash: string;

  // Camera settings
  focalLength: string;
  exposureTime: string;
  iso: string;
}

export const getExifData = async (imagePath: string): Promise<ExifData> => {
  if (Platform.OS !== 'android') {
    throw new Error('EXIF module only supported on Android');
  }

  if (!ExifModule) {
    throw new Error('ExifModule native module not found');
  }

  // Remove file:// prefix if present
  const cleanPath = imagePath.replace('file://', '');

  try {
    const data = await ExifModule.getExifData(cleanPath);
    return data as ExifData;
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
  if (lat === 'N/A' || lon === 'N/A') {
    return 'GPS not available';
  }
  return `${lat} ${latRef}, ${lon} ${lonRef}`;
};

export const formatExifForDisplay = (exif: ExifData) => {
  return [
    {
      label: '📅 Date Taken',
      value: exif.dateTimeOriginal !== 'N/A'
        ? exif.dateTimeOriginal
        : exif.dateTime,
    },
    {
      label: '📱 Device',
      value: exif.model !== 'N/A'
        ? `${exif.make} ${exif.model}`
        : 'N/A',
    },
    {
      label: '📍 GPS',
      value: formatGPS(
        exif.latitude,
        exif.longitude,
        exif.gpsLatRef,
        exif.gpsLonRef,
      ),
    },
    {
      label: '📐 Resolution',
      value: exif.width !== 'N/A'
        ? `${exif.width} × ${exif.height}`
        : 'N/A',
    },
    {
      label: '⚡ ISO',
      value: exif.iso,
    },
    {
      label: '🔆 Exposure',
      value: exif.exposureTime,
    },
    {
      label: '🔭 Focal Length',
      value: exif.focalLength,
    },
    {
      label: '💡 Flash',
      value: exif.flash === '0' ? 'No Flash' : exif.flash,
    },
  ];
};