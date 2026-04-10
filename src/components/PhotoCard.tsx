import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';// <- add this
import { colors } from '../theme';
import { formatExifForDisplay, ExifData } from '../services/exif';

interface Props {
  url: string;
  bytes: number;
  createdAt: string;
  exifData?: ExifData | null;
  originalSize?: number;
}

const formatBytes = (b?: number): string => {
  if (!b || b <= 0) return 'N/A';
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(2)} MB`;
};

const PhotoCard: React.FC<Props> = ({
  url,
  bytes,
  createdAt,
  exifData,
  originalSize,
}) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [exifExpanded, setExifExpanded] = useState(false);

  const formattedDate = new Date(createdAt).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const saved =
    originalSize && originalSize > 0 && bytes && bytes > 0
      ? Math.round((1 - bytes / originalSize) * 100)
      : null;

  const exifRows = exifData ? formatExifForDisplay(exifData) : [];

  const showSizeRow =
    (originalSize && originalSize > 0) || (bytes && bytes > 0);

  return (
    <View style={styles.card}>
      {/* Image */}
      <View style={styles.imageWrapper}>
        {!imageError ? (
          <Image
            source={{ uri: url }}
            style={styles.image}
            resizeMode="cover"
            onLoadEnd={() => setImageLoading(false)}
            onError={() => {
              setImageError(true);
              setImageLoading(false);
            }}
          />
        ) : (
          <View style={styles.imageError}>
            <Icon
              name="image-off-outline"
              size={40}
              color={colors.grey500}
              style={styles.imageErrorIcon}
            />
            <Text style={styles.imageErrorText}>Image unavailable</Text>
          </View>
        )}

        {imageLoading && !imageError && (
          <View style={styles.imagePlaceholder}>
            <ActivityIndicator color={colors.green} size="large" />
          </View>
        )}

        {saved !== null && saved > 0 && (
          <View style={styles.savedBadge}>
            <Text style={styles.savedBadgeText}>↓ {saved}% saved</Text>
          </View>
        )}
      </View>

      {/* Info Row */}
      <View style={styles.infoRow}>
        <View style={styles.infoLeft}>
          <Text style={styles.dateText}>{formattedDate}</Text>

          {showSizeRow && (
            <View style={styles.sizeRow}>
              {originalSize && originalSize > 0 && bytes && bytes > 0 ? (
                <Text style={styles.sizeText}>
                  {formatBytes(originalSize)}
                  <Text style={styles.arrow}> → </Text>
                  <Text style={styles.compressedSize}>
                    {formatBytes(bytes)}
                  </Text>
                </Text>
              ) : originalSize && originalSize > 0 ? (
                <Text style={styles.sizeText}>
                  Original: {formatBytes(originalSize)}
                </Text>
              ) : (
                <Text style={styles.sizeText}>{formatBytes(bytes)}</Text>
              )}
            </View>
          )}
        </View>

        {exifRows.length > 0 && (
          <TouchableOpacity
            style={[
              styles.exifButton,
              exifExpanded && styles.exifButtonActive,
            ]}
            onPress={() => setExifExpanded(p => !p)}
            activeOpacity={0.8}>
            <Text
              style={[
                styles.exifButtonText,
                exifExpanded && styles.exifButtonTextActive,
              ]}>
              {exifExpanded ? 'Hide EXIF' : 'EXIF Data'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* EXIF Panel */}
      {exifExpanded && exifRows.length > 0 && (
        <View style={styles.exifPanel}>
          <View style={styles.exifHeader}>
            <View style={styles.exifHeaderContent}>
              <Icon
                name="camera-outline"
                size={16}
                color={colors.green}
                style={styles.exifHeaderIcon}
              />
              <Text style={styles.exifTitle}>EXIF Metadata</Text>
            </View>
          </View>
          {exifRows.map((row, i) => (
            <View
              key={row.key ?? i}
              style={[
                styles.exifRow,
                i === exifRows.length - 1 && styles.exifRowLast,
              ]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                {
                  row.icon === 'iso' || row.icon === 'exposure'?
                    <MaterialIcons
                      name="iso"
                      size={14}
                      color={colors.grey800}
                      style={{ marginRight: 6 }}
                    /> :
                    <Icon
                      name={row.icon}
                      size={14}
                      color={colors.grey800}
                      style={{ marginRight: 6 }}
                    />
                }

                <Text style={styles.exifLabel}>{row.label}</Text>
              </View>
              <Text style={styles.exifValue} numberOfLines={1}>
                {row.value}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 20,
    marginHorizontal: 16,
    marginVertical: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 3,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  imageWrapper: {
    width: '100%',
    height: 230,
    backgroundColor: colors.grey200,
  },
  image: { width: '100%', height: '100%' },
  imagePlaceholder: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.grey100,
  },
  imageError: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.grey100,
  },
  imageErrorIcon: {
    marginBottom: 8,
  },
  imageErrorText: { fontSize: 13, color: colors.grey600 },
  savedBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: colors.green,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  savedBadgeText: { color: colors.white, fontSize: 11, fontWeight: '700' },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  infoLeft: { flex: 1, marginRight: 12 },
  dateText: { fontSize: 14, color: colors.black, fontWeight: '600' },
  sizeRow: { marginTop: 4 },
  sizeText: { fontSize: 12, color: colors.grey600 },
  arrow: { color: colors.grey400 },
  compressedSize: { color: colors.green, fontWeight: '600' },
  exifButton: {
    borderWidth: 1.5,
    borderColor: colors.green,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  exifButtonActive: { backgroundColor: colors.green },
  exifButtonText: { color: colors.green, fontSize: 12, fontWeight: '700' },
  exifButtonTextActive: { color: colors.white },
  exifPanel: {
    backgroundColor: colors.greenPale,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.greenMint,
  },
  exifHeader: {
    backgroundColor: colors.greenMint,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  exifHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exifHeaderIcon: {
    marginRight: 6,
  },
  exifTitle: { fontSize: 13, fontWeight: '700', color: colors.green },
  exifRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: colors.greenMint,
  },
  exifRowLast: { borderBottomWidth: 0 },
  exifLabel: {
    fontSize: 12,
    color: colors.grey800,
    fontWeight: '600',
    flex: 1,
  },
  exifValue: { fontSize: 12, color: colors.black, flex: 1, textAlign: 'right' },
});

export default PhotoCard;