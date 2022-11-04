/**
 * Copyright (c) 2022, Oracle and/or its affiliates.
 * Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl/
 */

import 'react-native-gesture-handler';
import * as React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AppColors } from './styles/common';

import ImageGrid from './components/ImageGrid';
import HomePage from './components/HomePage';
import ImagePager from './components/ImagePager';

const Stack = createStackNavigator();

const MyTheme = {
  colors: {
    background: AppColors.WHITE,
  },
};

function App() {
  return (
    <>
      <StatusBar backgroundColor={AppColors.ACCENT_DARK} />

      <NavigationContainer theme={MyTheme}>

        <Stack.Navigator
          initialRouteName="HomePage"
          screenOptions={{
            headerStyle: {
              backgroundColor: AppColors.ACCENT,
            },
            headerTintColor: AppColors.WHITE,
          }}
        >
          <Stack.Screen
            name="HomePage"
            component={HomePage}
            options={{ title: 'Image Gallery' }}
          />
          <Stack.Screen
            name="ImageGrid"
            component={ImageGrid}
            options={{ title: '' }}
          />
          <Stack.Screen
            name="ImagePager"
            component={ImagePager}
            options={{ title: '' }}
          />
        </Stack.Navigator>

      </NavigationContainer>
    </>
  );
}

export default App;
