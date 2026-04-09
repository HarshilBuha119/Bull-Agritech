import React from 'react';
import {StatusBar} from 'react-native';
import {colors} from './src/theme';
import AppNavigator from './src/navigation/AppNavigator';

const App = () => {
  return (
    <>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={colors.white}
        translucent={false}
      />
      <AppNavigator />
    </>
  );
};

export default App;