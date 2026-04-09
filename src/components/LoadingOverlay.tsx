import React from 'react';
import {
  View,
  ActivityIndicator,
  Text,
  StyleSheet,
  Modal,
} from 'react-native';
import {colors} from '../theme';

interface Props {
  visible: boolean;
  message?: string;
}

const LoadingOverlay: React.FC<Props> = ({
  visible,
  message = 'Please wait...',
}) => {
  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View style={styles.overlay}>
        <View style={styles.box}>
          <ActivityIndicator size="large" color={colors.green} />
          <Text style={styles.message}>{message}</Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  box: {
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingVertical: 32,
    paddingHorizontal: 40,
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    gap: 16,
  },
  message: {
    color: colors.black,
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 8,
  },
});

export default LoadingOverlay;