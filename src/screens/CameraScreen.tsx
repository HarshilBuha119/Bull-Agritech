import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  StatusBar,
} from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
} from 'react-native-vision-camera';
import ImageResizer from '@bam.tech/react-native-image-resizer';
import RNFS from 'react-native-fs';
import { colors } from '../theme';
import LoadingOverlay from '../components/LoadingOverlay';
import { uploadToCloudinary } from '../services/cloudinary';
import { getCurrentLocation, getExifData } from '../services/exif';
import { requestAllPermissions } from '../services/permissions';

const CameraScreen = () => {
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('back');
  const cameraRef = useRef<Camera>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  const formatBytes = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  useEffect(() => {
    const setup = async () => {
      const allPermissionsGranted = await requestAllPermissions();
      if (!hasPermission) requestPermission();

      if (allPermissionsGranted) {
        const loc = await getCurrentLocation();
        console.log('Current location from getCurrentLocation:', loc);
      } else {
        console.log('Location permission not granted yet; GPS may return null.');
      }
    };
    setup();
  }, [hasPermission, requestPermission]);

  const handleCapture = async () => {
    if (!cameraRef.current) return;
    let originalPath: string | null = null;
    let compressedPath: string | null = null;

    try {
      setLoadingMessage('Capturing...');
      setLoading(true);

      const photo = await cameraRef.current.takePhoto({});
      originalPath = photo.path;
      const originalStat = await RNFS.stat(photo.path);

      setLoadingMessage('Reading EXIF...');
      let exifData = null;
      try {
        exifData = await getExifData(photo.path);
      } catch {}

      setLoadingMessage('Compressing...');
      const compressed = await ImageResizer.createResizedImage(
        `file://${photo.path}`,
        1920,
        1080,
        'JPEG',
        75,
        0,
      );
      compressedPath = compressed.uri.replace('file://', '');

      setLoadingMessage('Uploading...');
      await uploadToCloudinary(compressed.uri, originalStat.size, exifData);

      Alert.alert('Done', 'Photo saved to your vault.');
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Something went wrong.');
    } finally {
      setLoading(false);

      const filesToCleanup = [originalPath, compressedPath].filter(
        (path): path is string => Boolean(path),
      );

      let deletedCount = 0;
      let freedBytes = 0;

      for (const path of filesToCleanup) {
        try {
          const exists = await RNFS.exists(path);
          if (!exists) continue;

          const stat = await RNFS.stat(path);
          const size = Number(stat.size) || 0;
          console.log('Temp cleanup candidate:', path, 'size=', formatBytes(size));

          await RNFS.unlink(path);
          deletedCount += 1;
          freedBytes += size;
        } catch (cleanupError) {
          console.log('Temp file cleanup failed for:', path, cleanupError);
        }
      }

      console.log(
        'Temp cleanup summary:',
        `deleted=${deletedCount}`,
        `freed=${formatBytes(freedBytes)}`,
      );
    }
  };

  if (!hasPermission || !device) {
    return <View style={styles.black} />;
  }

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        photo={true}
      />

      {/* Shutter Button */}
      <View style={styles.shutterWrapper}>
        <TouchableOpacity
          style={styles.shutterOuter}
          onPress={handleCapture}
          activeOpacity={0.8}
        >
          <View style={styles.shutterInner} />
        </TouchableOpacity>
      </View>

      <LoadingOverlay visible={loading} message={loadingMessage} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  black: {
    flex: 1,
    backgroundColor: colors.black,
  },
  shutterWrapper: {
    position: 'absolute',
    bottom: 48,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  shutterOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  shutterInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.white,
  },
});

export default CameraScreen;
