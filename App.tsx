import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ImageSourcePropType,
  Platform,
} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

import CameraScreen from './src/screens/CameraScreen';
import GalleryScreen from './src/screens/GalleryScreen';
import {colors} from './src/theme';

const Tab = createBottomTabNavigator();

// Icons
const cameraIcon: ImageSourcePropType = require('./assets/icons/Camera.png');
const galleryIcon: ImageSourcePropType = require('./assets/icons/Gallery.png');

type TabIconProps = {
  source: ImageSourcePropType;
  label: string;
  focused: boolean;
};

const TabIcon = ({source, label, focused}: TabIconProps) => {
  return (
    <View style={styles.tabItem}>
      <View
        style={[
          styles.iconContainer,
          focused && styles.iconContainerActive,
        ]}>
        <Image
          source={source}
          style={[
            styles.icon,
            {tintColor: focused ? '#fff' : colors.grey600},
          ]}
        />
      </View>

      <Text            // ✅ FIX
        style={[
          styles.label,
          focused && styles.labelActive,
        ]}>
        {label}
      </Text>
    </View>
  );
};

const App = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: styles.tabBar,
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

export default App;

const styles = StyleSheet.create({
  tabBar: {
    left: 20,
    right: 20,
    height: 70,
    backgroundColor: '#fff',
    elevation: 10,

    paddingBottom: Platform.OS === 'ios' ? 10 : 8,
    paddingTop: 8,
  },

  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 70,
  },

  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginTop:10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  iconContainerActive: {
    backgroundColor: colors.green,
  },

  icon: {
    width: 22,
    height: 22,
  },

  label: {
    fontSize: 11,
    marginTop: 3,
    color: colors.grey600,
    maxWidth: 60,
    textAlign: 'center',
  },

  labelActive: {
    color: colors.green,
    fontWeight: '600',
  },
});