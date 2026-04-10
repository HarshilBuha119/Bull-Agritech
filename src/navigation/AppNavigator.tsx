// src/navigation/AppNavigator.tsx

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ImageSourcePropType,
  Platform,
} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

import CameraScreen from '../screens/CameraScreen';
import GalleryScreen from '../screens/GalleryScreen';
import {colors} from '../theme';

const Tab = createBottomTabNavigator();

// PNG icons
const cameraIcon: ImageSourcePropType = require('../../assets/icons/Camera.png');
const galleryIcon: ImageSourcePropType = require('../../assets/icons/Gallery.png');

type TabIconProps = {
  source: ImageSourcePropType;
  label: string;
  focused: boolean;
};

const TabIcon = ({source, label, focused}: TabIconProps) => (
  <View style={styles.tabIcon}>
    <View
      style={[styles.iconWrapper, focused && styles.iconWrapperFocused]}>
      <Image
        source={source}
        style={[
          styles.iconImage,
          {tintColor: focused ? colors.green : colors.grey600},
        ]}
        resizeMode="contain"
      />
    </View>
    <Text style={[styles.tabLabel, focused && styles.tabLabelFocused]}>
      {label}
    </Text>
  </View>
);

const AppNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.green,
        tabBarInactiveTintColor: colors.grey600,
      }}>
      <Tab.Screen
        name="Camera"
        component={CameraScreen}
        options={{
          tabBarIcon: ({focused}) => (
            <TabIcon source={cameraIcon} label="Camera" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Gallery"
        component={GalleryScreen}
        options={{
          tabBarIcon: ({focused}) => (
            <TabIcon source={galleryIcon} label="Gallery" focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    height: 70,
    paddingBottom: Platform.OS === 'ios' ? 12 : 8,
    paddingTop: 6,
    elevation: 12,
    shadowColor: colors.black,
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  tabIcon: {
    justifyContent: 'center',
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapperFocused: {
    backgroundColor: colors.greenPale,
  },
  iconImage: {
    width: 22,
    height: 22,
  },
  tabLabel: {
    marginTop: 4,
    fontSize: 11,
    color: colors.grey600,
    fontWeight: '500',
  },
  tabLabelFocused: {
    color: colors.green,
    fontWeight: '700',
  },
});

export default AppNavigator;