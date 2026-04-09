import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {colors} from '../theme';
import {formatExifForDisplay, ExifData} from '../services/exif';

interface Props {
  url: string;
  bytes: number;
  createdAt: string;
  exifData?: ExifData | null;
  originalSize?: number;
}

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const PhotoCard: React.FC<Props> = ({
  url,
  bytes,
  createdAt,
  exifData,
  originalSize,
}) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [exifExpanded, setExifExpanded] = useState(false);

  const formattedDate = new Date(createdAt).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const exifRows = exifData ? formatExifForDisplay(exifData) : [];

  return (
    <View style={styles.card}>
      {/* Photo */}
      <View style={styles.imageWrapper}>
        <Image
          source={{uri: url}}
          style={styles.image}
          onLoadEnd={() => setImageLoading(false)}
          resizeMode="cover"
        />
        {imageLoading && (
          <View style={styles.imagePlaceholder}>
            <ActivityIndicator color={colors.green} />
          </View>
        )}
      </View>

      {/* Info Row */}
      <View style={styles.infoRow}>
        <View>
          <Text style={styles.dateText}>{formattedDate}</Text>
          <Text style={styles.sizeText}>
            Uploaded: {formatBytes(bytes)}
          </Text>
          {/* Bonus: original vs compressed */}
          {originalSize != null && (
            <Text style={styles.compressionText}>
              Original: {formatBytes(originalSize)} →{' '}
              <Text style={styles.savedText}>
                Saved {Math.round((1 - bytes / originalSize) * 100)}%
              </Text>
            </Text>
          )}
        </View>

        {/* EXIF Toggle Button */}
        {exifData && (
          <TouchableOpacity
            style={styles.exifButton}
            onPress={() => setExifExpanded(prev => !prev)}
            activeOpacity={0.8}>
            <Text style={styles.exifButtonText}>
              {exifExpanded ? 'Hide EXIF' : 'Show EXIF'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* EXIF Data */}
      {exifExpanded && exifRows.length > 0 && (
        <View style={styles.exifContainer}>
          <Text style={styles.exifTitle}>📷 EXIF Metadata</Text>
          {exifRows.map((row, index) => (
            <View key={index} style={styles.exifRow}>
              <Text style={styles.exifLabel}>{row.label}</Text>
              <Text style={styles.exifValue}>{row.value}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.black,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  imageWrapper: {
    width: '100%',
    height: 220,
    backgroundColor: colors.grey200,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.grey200,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  dateText: {
    fontSize: 13,
    color: colors.black,
    fontWeight: '600',
  },
  sizeText: {
    fontSize: 12,
    color: colors.grey600,
    marginTop: 2,
  },
  compressionText: {
    fontSize: 12,
    color: colors.grey600,
    marginTop: 2,
  },
  savedText: {
    color: colors.green,
    fontWeight: '700',
  },
  exifButton: {
    backgroundColor: colors.green,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  exifButtonText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  exifContainer: {
    backgroundColor: colors.greenPale,
    marginHorizontal: 14,
    marginBottom: 14,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.greenMint,
  },
  exifTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.green,
    marginBottom: 10,
  },
  exifRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: colors.greenMint,
  },
  exifLabel: {
    fontSize: 12,
    color: colors.grey800,
    fontWeight: '600',
    flex: 1,
  },
  exifValue: {
    fontSize: 12,
    color: colors.black,
    flex: 1,
    textAlign: 'right',
  },
});

export default PhotoCard;