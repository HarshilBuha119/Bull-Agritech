import React, {useState, useCallback, useEffect} from 'react';
import {
  View, Text, StyleSheet, FlatList,
  RefreshControl, TouchableOpacity, StatusBar,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
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
      isRefresh ? setRefreshing(true) : setLoading(true);
      setError(null);
      const data = await fetchAllPhotos();
      const sorted = [...data].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      setPhotos(sorted);
    } catch (err: any) {
      setError(err?.message || 'Failed to load photos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(()=>{
    loadPhotos();
  },[])

  const renderHeader = () => (
    <View style={styles.header}>
      <View>
        <Text style={styles.headerTitle}>My Vault</Text>
        <Text style={styles.headerSubtitle}>Your secure photo collection</Text>
      </View>
      {photos.length > 0 && (
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{photos.length} photos</Text>
        </View>
      )}
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      {error ? (
        <>
          <Text style={styles.emptyTitle}>Unable to Load Photos</Text>
          <Text style={styles.emptySubtitle}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => loadPhotos()}>
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.emptyTitle}>Your Vault is Empty</Text>
          <Text style={styles.emptySubtitle}>
            Head to the Camera tab to capture and securely store your first photo.
          </Text>
        </>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
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
        ListEmptyComponent={!loading ? renderEmpty : null}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadPhotos(true)}
            colors={[colors.green]}
            tintColor={colors.green}
          />
        }
        contentContainerStyle={photos.length === 0 ? styles.emptyList : styles.list}
        showsVerticalScrollIndicator={false}
      />
      <LoadingOverlay visible={loading} message="Loading your vault..." />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.background},
  list: {paddingBottom: 32},
  emptyList: {flexGrow: 1},
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 20,
    paddingTop: 20, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: colors.border,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 28, fontWeight: '800', color: colors.black, letterSpacing: -0.5,
  },
  headerSubtitle: {fontSize: 13, color: colors.grey600, marginTop: 2},
  countBadge: {
    backgroundColor: colors.greenPale, paddingHorizontal: 14,
    paddingVertical: 7, borderRadius: 20,
    borderWidth: 1, borderColor: colors.greenMint,
  },
  countText: {fontSize: 13, color: colors.green, fontWeight: '700'},
  emptyContainer: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: 36, paddingBottom: 80,
  },
  emptyEmoji: {fontSize: 60, marginBottom: 20},
  emptyTitle: {
    fontSize: 20, fontWeight: '700', color: colors.black,
    marginBottom: 10, textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14, color: colors.grey600,
    textAlign: 'center', lineHeight: 22,
  },
  retryButton: {
    marginTop: 24, backgroundColor: colors.green,
    paddingHorizontal: 32, paddingVertical: 13, borderRadius: 28,
  },
  retryText: {color: colors.white, fontWeight: '700', fontSize: 15},
});

export default GalleryScreen;