import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {colors} from '../theme';
import PhotoCard from '../components/PhotoCard';
import LoadingOverlay from '../components/LoadingOverlay';
import {fetchAllPhotos, UploadResult} from '../services/cloudinary';

const GalleryScreen = () => {
  const [photos, setPhotos] = useState<UploadResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPhotos = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const data = await fetchAllPhotos();

      // Sort by newest first
      const sorted = data.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

      setPhotos(sorted);
    } catch (err: any) {
      setError(err.message || 'Failed to load photos');
      Alert.alert('❌ Error', err.message || 'Failed to load photos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Auto reload when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadPhotos();
    }, []),
  );

  const onRefresh = () => loadPhotos(true);

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📷</Text>
      <Text style={styles.emptyTitle}>No Photos Yet</Text>
      <Text style={styles.emptySubtitle}>
        Go to Camera tab and capture your first photo!
      </Text>
    </View>
  );

  const renderError = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>⚠️</Text>
      <Text style={styles.emptyTitle}>Something went wrong</Text>
      <Text style={styles.emptySubtitle}>{error}</Text>
      <TouchableOpacity
        style={styles.retryButton}
        onPress={() => loadPhotos()}>
        <Text style={styles.retryText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>My Vault</Text>
      <View style={styles.countBadge}>
        <Text style={styles.countText}>{photos.length} photos</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={photos}
        keyExtractor={item => item.publicId}
        renderItem={({item}) => (
          <PhotoCard
            url={item.url}
            bytes={item.bytes}
            createdAt={item.createdAt}
            exifData={item.exifData}
            originalSize={item.originalSize}
          />
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={error ? renderError() : renderEmpty()}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.green]}
            tintColor={colors.green}
          />
        }
        contentContainerStyle={
          photos.length === 0 ? styles.emptyList : styles.list
        }
        showsVerticalScrollIndicator={false}
      />

      <LoadingOverlay visible={loading} message="Loading photos..." />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    paddingBottom: 24,
  },
  emptyList: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.black,
    letterSpacing: -0.5,
  },
  countBadge: {
    backgroundColor: colors.greenPale,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.greenMint,
  },
  countText: {
    fontSize: 13,
    color: colors.green,
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingBottom: 80,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.black,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.grey600,
    textAlign: 'center',
    lineHeight: 22,
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: colors.green,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 24,
  },
  retryText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 15,
  },
});

export default GalleryScreen;