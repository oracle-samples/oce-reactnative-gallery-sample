/**
 * Copyright (c) 2022, Oracle and/or its affiliates.
 * Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl/
 */
import { Dimensions } from 'react-native';

export function calculateNumColumns() {
  let numColumns = 1;
  const screenWidth = Math.round(Dimensions.get('window').width);
  if (screenWidth <= 600) {
    numColumns = 1;
  } else if (screenWidth < 1200) {
    numColumns = 2;
  } else {
    numColumns = 3;
  }
  return numColumns;
}

export function calculateNumColumnsForGrid() {
  let numColumns = 2;
  const screenWidth = Math.round(Dimensions.get('window').width);
  if (screenWidth <= 600) {
    numColumns = 2;
  } else if (screenWidth < 1200) {
    numColumns = 3;
  } else {
    numColumns = 4;
  }
  return numColumns;
}
