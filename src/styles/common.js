/**
 * Copyright (c) 2022, Oracle and/or its affiliates.
 * Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl/
 */
import { StyleSheet } from 'react-native';

const TextSizes = {
  TEXT_SIZE_LARGE: 24,
  TEXT_SIZE_MEDIUM_LARGE: 20,
  TEXT_SIZE_MEDIUM: 16,
  // TEXT_SIZE_SMALL: 14,
};

const AppColors = {
  ACCENT: 'rgba(188, 8, 7, .95)',
  ACCENT_DARK: 'rgba(141, 0, 0, 1)',
  // ACCENT_LIGHT: 'rgba(188, 8, 7, .85)',
  BLACK: 'black',
  BORDER_COLOR: '#ccc',
  // DARK_GREY: 'rgb(115, 115, 115)',
  GREY: 'grey',
  // LIGHT_GREY: '#737373',
  // RED: 'red',
  TRANSPARENT: 'transparent',
  WHITE: 'white',
};

const CommonStyles = StyleSheet.create({
  error: {
    color: AppColors.GREY,
    marginTop: 50,
    textAlign: 'center',
  },

  progressSpinner: {
    paddingTop: 20,
  },
});

export {
  AppColors, CommonStyles, TextSizes,
};
