// screens/CameraScreen.tsx
import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
} from 'react-native-vision-camera';
import ImageResizer from '@bam.tech/react-native-image-resizer';
import {colors} from '../theme';
import LoadingOverlay from '../components/LoadingOverlay';
import {uploadToCloudinary} from '../services/cloudinary';
import {getExifData} from '../services/exif';
import RNFS from 'react-native-fs';
import {requestAllPermissions} from '../services/permissions';

const CameraScreen = () => {
  const {hasPermission, requestPermission} = useCameraPermission();
  const device = useCameraDevice('back');
  const camera = useRef<Camera>(null);

  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [flash, setFlash] = useState<'on' | 'off'>('off');

  useEffect(() => {
    const setup = async () => {
      await requestAllPermissions();
      if (!hasPermission) {
        requestPermission();
      }
    };
    setup();
  }, [hasPermission, requestPermission]);

  // ─── Test 1: Basic internet ───────────────────────────────
  const testNetwork = () => {
    try {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', 'https://httpbin.org/get');
      xhr.timeout = 10000;
      xhr.onload = () =>
        Alert.alert('✅ Internet Works', `Status: ${xhr.status}`);
      xhr.onerror = () =>
        Alert.alert('❌ No Internet', 'Basic internet request failed');
      xhr.ontimeout = () =>
        Alert.alert('❌ Timeout', 'Request timed out after 10s');
      xhr.send();
    } catch (e: any) {
      Alert.alert('❌ Exception', e.message);
    }
  };

  // ─── Test 2: Cloudinary reachable ────────────────────────
  const testCloudinary = () => {
    try {
      const xhr = new XMLHttpRequest();
      xhr.open(
        'GET',
        'https://api.cloudinary.com/v1_1/ds3x2mbi3/image/upload',
      );
      xhr.timeout = 10000;
      xhr.onload = () =>
        Alert.alert(
          '✅ Cloudinary Reachable',
          `Status: ${xhr.status}\n${xhr.responseText.substring(0, 120)}`,
        );
      xhr.onerror = () =>
        Alert.alert('❌ Cloudinary Blocked', 'Cannot reach Cloudinary API');
      xhr.ontimeout = () =>
        Alert.alert('❌ Timeout', 'Cloudinary request timed out');
      xhr.send();
    } catch (e: any) {
      Alert.alert('❌ Exception', e.message);
    }
  };

  // ─── Main capture + upload flow ──────────────────────────
  const handleCapture = async () => {
    if (!camera.current) {
      return;
    }

    try {
      setLoadingMessage('Capturing photo...');
      setLoading(true);

      // Step 1: Capture
      const photo = await camera.current.takePhoto({
        flash: flash,
      });

      const originalPath = `file://${photo.path}`;

      // Step 2: Get original file size
      const originalStat = await RNFS.stat(photo.path);
      const originalSize = originalStat.size;

      // Step 3: Read EXIF before compression
      setLoadingMessage('Reading EXIF data...');
      let exifData = null;
      try {
        exifData = await getExifData(photo.path);
      } catch (e) {
        console.warn('EXIF read failed:', e);
      }

      // Step 4: Compress image
      setLoadingMessage('Compressing image...');
      const compressed = await ImageResizer.createResizedImage(
        originalPath,
        1920,
        1080,
        'JPEG',
        75,
        0,
      );

      // Step 5: Upload to Cloudinary (uses new uploadToCloudinary)
      setLoadingMessage('Uploading to cloud...');
      await uploadToCloudinary(compressed.uri, originalSize, exifData);

      setLoading(false);
      Alert.alert('✅ Success', 'Photo uploaded successfully!', [
        {text: 'OK'},
      ]);
    } catch (error: any) {
      setLoading(false);
      Alert.alert('❌ Upload Error', error.message || 'Something went wrong');
    }
  };

  // ─── Permission screens ───────────────────────────────────
  if (!hasPermission) {
    return (
      <View style={styles.centered}>
        <Text style={styles.permissionText}>
          Camera permission is required
        </Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.centered}>
        <Text style={styles.permissionText}>No camera device found</Text>
      </View>
    );
  }

  // ─── Main UI ──────────────────────────────────────────────
  return (
    <View style={styles.container}>
      {/* Camera Preview */}
      <Camera
        ref={camera}
        style={styles.camera}
        device={device}
        isActive={true}
        photo={true}
      />

      {/* Top Controls */}
      <View style={styles.topControls}>
        <TouchableOpacity
          style={styles.flashButton}
          onPress={() =>
            setFlash(prev => (prev === 'off' ? 'on' : 'off'))
          }>
          <Text style={styles.flashText}>
            {flash === 'off' ? '⚡ Flash Off' : '⚡ Flash On'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Controls */}
      <View style={styles.bottomControls}>
        {/* Test Buttons */}
        <View style={styles.testRow}>
          <TouchableOpacity
            style={styles.testButton}
            onPress={testNetwork}>
            <Text style={styles.testButtonText}>🌐 Test Internet</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.testButton}
            onPress={testCloudinary}>
            <Text style={styles.testButtonText}>☁️ Test Cloudinary</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.hintText}>Tap to capture</Text>

        {/* Capture Button */}
        <TouchableOpacity
          style={styles.captureButton}
          onPress={handleCapture}
          activeOpacity={0.8}>
          <View style={styles.captureInner} />
        </TouchableOpacity>

        <Text style={styles.qualityText}>
          75% quality • Auto compress
        </Text>
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
  camera: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 24,
  },
  permissionText: {
    fontSize: 16,
    color: colors.black,
    textAlign: 'center',
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: colors.green,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  permissionButtonText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 15,
  },
  topControls: {
    position: 'absolute',
    top: 50,
    right: 20,
  },
  flashButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  flashText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '600',
  },
  bottomControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 40,
    paddingTop: 16,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    gap: 10,
  },
  testRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 4,
  },
  testButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  testButtonText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  hintText: {
    color: colors.white,
    fontSize: 13,
    opacity: 0.8,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.white,
  },
  captureInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.white,
  },
  qualityText: {
    color: colors.greenLight,
    fontSize: 12,
    fontWeight: '500',
  },
});

export default CameraScreen;