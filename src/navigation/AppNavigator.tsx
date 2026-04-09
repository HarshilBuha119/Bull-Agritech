// src/navigation/AppNavigator.tsx

import React from 'react';
import {View, Text, StyleSheet, Image, ImageSourcePropType} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

import CameraScreen from '../screens/CameraScreen';
import GalleryScreen from '../screens/GalleryScreen';
import {colors} from '../theme';

const Tab = createBottomTabNavigator();

// 👇 import your images
const cameraIcon: ImageSourcePropType = require('../../assets/icons/Camera.png');
const galleryIcon: ImageSourcePropType = require('../../assets/icons/Gallery.png');

type TabIconProps = {
  source: ImageSourcePropType;
  label: string;
  focused: boolean;
};

const TabIcon = ({source, label, focused}: TabIconProps) => (
  <View style={[styles.tabIcon, focused && styles.tabIconFocused]}>
    <Image
      source={source}
      // tintColor lets you change color based on focus
      style={[
        styles.iconImage,
        {tintColor: focused ? colors.green : colors.grey600},
      ]}
      resizeMode="contain"
    />
    <Text style={[styles.tabLabel, focused && styles.tabLabelFocused]}>
      {label}
    </Text>
  </View>
);

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarShowLabel: false,
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
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    height: 70,
    paddingBottom: 8,
    paddingTop: 8,
    elevation: 12,
    shadowColor: colors.black,
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  tabIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tabIconFocused: {
    backgroundColor: colors.greenPale,
  },
  iconImage: {
    width: 22,
    height: 22,
  },
  tabLabel: {
    fontSize: 11,
    color: colors.grey600,
    fontWeight: '500',
    marginTop: 2,
  },
  tabLabelFocused: {
    color: colors.green,
    fontWeight: '700',
  },
});

export default AppNavigator;