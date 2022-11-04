/**
 * Copyright (c) 2022, Oracle and/or its affiliates.
 * Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl/
 */
import * as React from 'react';
import {
  ActivityIndicator,
  Image,
  Platform,
  SafeAreaView,
  StyleSheet,
  View,
} from 'react-native';

// Originally this page was using '@react-native-community/viewpager' but
// that component does not work in the web, but the one below does
import Swiper from 'react-native-swiper';

import { NAVIGATION, ROUTE } from '../types/index';
import { AppColors, CommonStyles } from '../styles/common';
import { getImageSource } from '../scripts/content-rn';

const styles = StyleSheet.create({
  image: {
    height: '100%',
    width: '100%',
  },
  noItemsView: {
    backgroundColor: AppColors.TRANSPARENT,
    flex: 1,
  },
  pageContainer: {
    flex: 1,
  },
  topcontainer: {
    flex: 1,
  },
  viewPager: {
    backgroundColor: AppColors.BLACK,
  },
});

/**
 * This component displays the images in a slideshow.
 *
 * @param imagesArray the array of images to be displayed
 * @param index the index of the image to be displayed first
 */
/* eslint class-methods-use-this: ["error", { "exceptMethods": ["renderImage"] }] */
export default class ImagePager extends React.Component {
  constructor(props) {
    super(props);
    const { route } = this.props;
    const { imagesArray, index } = route.params;

    this.state = {
      totalItems: imagesArray.length,
      index,
    };
  }

  // When the component first mounts, set the title
  componentDidMount() {
    this.setTitle();
  }

  // when the comonent update, update the title
  componentDidUpdate() {
    this.setTitle();
  }

  // sets the title to indicate which image is being viewed,
  setTitle() {
    const { totalItems, index } = this.state;
    if (totalItems) {
      const title = `${index + 1} / ${totalItems}`;

      const { navigation } = this.props;
      navigation.setOptions({ title });
    }
  }

  // util method for rendering a single item in the pager
  renderImage(img, index) {
    return (
      <View key={index} style={styles.pageContainer}>
        <Image
          style={styles.image}
          source={getImageSource(img.renditionUrls.Native)}
          resizeMode="contain"
        />
      </View>
    );
  }

  /*
   * Renders the images in a view pager.
   */
  render() {
    const { route } = this.props;
    const { params } = route;
    const { imagesArray } = params;
    const initialIndex = params.index;

    if (imagesArray.length === 0) {
      return (
        <View style={styles.noItemsView} />
      );
    }

    // show the next/prev buttons on web only
    const showNavButtons = (Platform.OS === 'web');

    const gotAllData = imagesArray && imagesArray.length > 0;

    return (
      <SafeAreaView style={styles.topcontainer}>
        {!gotAllData && (
        <ActivityIndicator
          style={CommonStyles.progressSpinner}
          size="large"
          color={AppColors.ACCENT}
        />
        )}

        {gotAllData && (
          <Swiper
            style={styles.viewPager}
            index={initialIndex}
            showsButtons={showNavButtons}
            orientation="horizontal"
            showsPagination={false}
            onIndexChanged={(index) => {
              this.setState({ index });
            }}
            loop={false}
          >
            {imagesArray.map((img, i) => this.renderImage(img, i))}
          </Swiper>
        )}

      </SafeAreaView>
    );
  }
}

/*
 * Define the types of data passed into this component.
 */
ImagePager.propTypes = {
  navigation: NAVIGATION.isRequired,
  route: ROUTE.isRequired,
};
