// screens/GalleryScreen.tsx
import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
// ❌ removed useFocusEffect to avoid undefined-is-not-a-function
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

      // Debug: make sure this is a real function
      console.log('typeof fetchAllPhotos =', typeof fetchAllPhotos);

      const data = await fetchAllPhotos();

      // Make sure we have an array before sort to avoid runtime errors
      const list: UploadResult[] = Array.isArray(data) ? data : [];

      const sorted = [...list].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

      setPhotos(sorted);
    } catch (err: any) {
      const message = err?.message || 'Failed to load photos';
      setError(message);
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load once when Gallery mounts
  useEffect(() => {
    loadPhotos();
  }, []);

  const onRefresh = () => loadPhotos(true);

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📷</Text>
      <Text style={styles.emptyTitle}>Your vault is empty</Text>
      <Text style={styles.emptySubtitle}>
        Capture a photo from the Camera tab to see it appear here.
      </Text>
    </View>
  );

  const renderError = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>⚠️</Text>
      <Text style={styles.emptyTitle}>Unable to load photos</Text>
      <Text style={styles.emptySubtitle}>{error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={() => loadPhotos()}>
        <Text style={styles.retryText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View>
        <Text style={styles.headerTitle}>My Vault</Text>
        <Text style={styles.headerSubtitle}>All your secure photos</Text>
      </View>
      <View style={styles.countBadge}>
        <Text style={styles.countText}>
          {photos.length === 0 ? 'No photos' : `${photos.length} photos`}
        </Text>
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
        ListEmptyComponent={() =>
          error ? renderError() : renderEmpty()
        }
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

  // Header
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
    fontSize: 24,
    fontWeight: '800',
    color: colors.black,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.grey600,
    marginTop: 2,
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

  // Empty / error
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

export default GalleryScreen