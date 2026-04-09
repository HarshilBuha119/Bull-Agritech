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
import RNFS from 'react-native-fs';

import {colors} from '../theme';
import LoadingOverlay from '../components/LoadingOverlay';
import {uploadToCloudinary} from '../services/cloudinary';
import {getExifData} from '../services/exif';
import {requestAllPermissions} from '../services/permissions';

const CameraScreen = () => {
  const {hasPermission, requestPermission} = useCameraPermission();
  const device = useCameraDevice('back');
  const cameraRef = useRef<Camera>(null);

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

  const handleCapture = async () => {
    if (!cameraRef.current) {
      return;
    }

    try {
      setLoadingMessage('Capturing photo...');
      setLoading(true);

      // Step 1: Capture
      const photo = await cameraRef.current.takePhoto({
        flash,
      });

      const originalPath = `file://${photo.path}`;

      // Step 2: Get original file size
      const originalStat = await RNFS.stat(photo.path);
      const originalSize = originalStat.size;

      // Step 3: Read EXIF before compression
      setLoadingMessage('Reading photo details...');
      let exifData = null;
      try {
        exifData = await getExifData(photo.path);
      } catch (e) {
        console.warn('EXIF read failed:', e);
      }

      // Step 4: Compress image
      setLoadingMessage('Optimizing photo...');
      const compressed = await ImageResizer.createResizedImage(
        originalPath,
        1920,
        1080,
        'JPEG',
        75,
        0,
      );

      // Step 5: Upload to Cloudinary
      setLoadingMessage('Uploading securely...');
      await uploadToCloudinary(compressed.uri, originalSize, exifData);

      setLoading(false);
      Alert.alert('Uploaded', 'Photo saved to your vault successfully.');
    } catch (error: any) {
      setLoading(false);
      Alert.alert('Upload Error', error.message || 'Something went wrong');
    }
  };

  // ─── Permission screens ───────────────────────────────────
  if (!hasPermission) {
    return (
      <View style={styles.centered}>
        <Text style={styles.permissionTitle}>Camera access needed</Text>
        <Text style={styles.permissionText}>
          We use your camera only to capture photos and upload them securely to
          your private vault.
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
        <Text style={styles.permissionTitle}>No camera found</Text>
        <Text style={styles.permissionText}>
          We couldn’t detect a camera on this device.
        </Text>
      </View>
    );
  }

  // ─── Main UI ──────────────────────────────────────────────
  return (
    <View style={styles.container}>
      {/* Camera Preview */}
      <Camera
        ref={cameraRef}
        style={styles.camera}
        device={device}
        isActive={true}
        photo={true}
      />

      {/* Top Bar */}
      <View style={styles.topBar}>
        <View style={styles.topLeft}>
          <Text style={styles.appTitle}>MiniPhotoVault</Text>
          <Text style={styles.appSubtitle}>Capture and auto‑secure</Text>
        </View>

        <TouchableOpacity
          style={styles.flashChip}
          onPress={() => setFlash(prev => (prev === 'off' ? 'on' : 'off'))}>
          <Text style={styles.flashIcon}>⚡</Text>
          <Text style={styles.flashLabel}>
            {flash === 'off' ? 'Flash Off' : 'Flash On'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Sheet Controls */}
      <View style={styles.bottomSheet}>
        <View style={styles.statusRow}>
          <View style={styles.statusPill}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Smart compression enabled</Text>
          </View>
          <Text style={styles.statusSecondary}>75% quality • EXIF preserved</Text>
        </View>

        <Text style={styles.captureHint}>Tap the shutter to capture</Text>

        <View style={styles.captureRow}>
          <TouchableOpacity
            style={styles.captureOuter}
            onPress={handleCapture}
            activeOpacity={0.8}>
            <View style={styles.captureInner} />
          </TouchableOpacity>
        </View>

        <Text style={styles.bottomNote}>
          Photos are uploaded securely and won’t be stored in your system gallery.
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
  permissionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.black,
    marginBottom: 12,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 14,
    color: colors.grey600,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  permissionButton: {
    backgroundColor: colors.green,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 24,
  },
  permissionButtonText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 15,
  },

  // Top bar
  topBar: {
    position: 'absolute',
    top: 40,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topLeft: {
    flexDirection: 'column',
  },
  appTitle: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
  appSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 2,
  },
  flashChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  flashIcon: {
    fontSize: 16,
    marginRight: 6,
    color: colors.white,
  },
  flashLabel: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '600',
  },

  // Bottom sheet
  bottomSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  statusRow: {
    marginBottom: 10,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.green,
    marginRight: 6,
  },
  statusText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  statusSecondary: {
    marginTop: 6,
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
  },
  captureHint: {
    marginTop: 8,
    textAlign: 'center',
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
  },
  captureRow: {
    marginTop: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureOuter: {
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 3,
    borderColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  captureInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.white,
  },
  bottomNote: {
    marginTop: 12,
    textAlign: 'center',
    color: colors.greenLight,
    fontSize: 11,
  },
});

export default CameraScreen;