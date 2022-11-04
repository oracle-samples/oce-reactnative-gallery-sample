/**
 * Copyright (c) 2022, Oracle and/or its affiliates.
 * Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl/
 */
import * as React from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
} from 'react-native';

import { NAVIGATION, ROUTE } from '../types/index';
import { fetchItemsForCategory, retrieveRenditionURLs } from '../scripts/services';
import { AppColors, CommonStyles, TextSizes } from '../styles/common';
import { calculateNumColumnsForGrid } from '../scripts/utils';
import { getImageSource } from '../scripts/content-rn';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    margin: 1,
  },
  image: {
    height: 200,
    width: '100%',
  },
  infoText: {
    color: AppColors.GREY,
    fontSize: TextSizes.TEXT_SIZE_MEDIUM,
    textAlign: 'center',
  },
  topcontainer: {
    flex: 1,
  },
});

/**
 * This component displays the assets belonging to a category in a grid view.
 * Upon clicking an image, it allows display of the images in a slideshow.
 *
 * @param id the id of the category whose items are to be displayed
 * @param name the name of the category whose items are to be displayed
 */
export default class ImageGrid extends React.Component {
  constructor(props) {
    super(props);

    this.mounted = false;
    const currentScreenWidth = Math.round(Dimensions.get('window').width);
    const numColumns = calculateNumColumnsForGrid();

    this.state = {
      loading: true,
      error: false,
      imagesArray: [],
      currentScreenWidth,
      numColumns,
    };

    this.onTopViewLayout = this.onTopViewLayout.bind(this);
  }

  /**
   * Fetch the items for a category and then retrieve the rendition urls.
   * We need the smaller version of the asset for the grid and the native
   * version for the slideshow.
   */
  componentDidMount() {
    this.mounted = true;

    const { route, navigation } = this.props;
    const { id, name } = route.params;

    // set the screen title to the name of the selected topic
    navigation.setOptions({ title: name });

    // fetch the items for the category and set the total results
    fetchItemsForCategory(id, false)
      .then((topLevelItem) => {
        const images = [];

        // for each item, retrieve the rendition urls
        topLevelItem.items.forEach((item) => {
          retrieveRenditionURLs(item.id)
            .then((renditionUrls) => {
              if (renditionUrls != null) {
                images.push({ renditionUrls, alt: item.name });
                // Set the state so that it can be rendered
                if (this.mounted) {
                  this.setState({
                    imagesArray: images,
                    loading: false,
                  });
                  if (images.length > 0) {
                    navigation.setOptions({ title: `${name} (${images.length} photos)` });
                  }
                }
              }
            })
            .catch(() => {
              if (this.mounted) {
                this.setState({ error: true });
              }
            });
        });
      })
      .catch(() => {
        if (this.mounted) {
          this.setState({ error: true });
        }
      });
  }

  /*
   * Called when the component unmounts.
   * Unregister the keydown event listener
   */
  componentWillUnmount() {
    this.mounted = false;
  }

  /*
   * When the top view's layout changes, determine if there was a change in
   * the device width, if there is adjust the list column number accordingly.
   */
  onTopViewLayout() {
    const { currentScreenWidth } = this.state;
    const newScreenWidth = Math.round(Dimensions.get('window').width);

    if (newScreenWidth !== currentScreenWidth) {
      const numColumns = calculateNumColumnsForGrid();
      if (this.mounted) {
        this.setState({
          numColumns,
          currentScreenWidth: newScreenWidth,
        });
      }
    }
  }

  /*
   * Render this component.
   *
   * Renders the grid of assets belonging to the category. If current image is set, then it
   * also displays the slideshow overlay of native images over the grid.
   */
  render() {
    const { navigation } = this.props;

    const {
      loading, error, imagesArray, numColumns,
    } = this.state;

    return (
      <SafeAreaView style={styles.topcontainer}>
        {/* Render error */}
        {error && (
          <Text style={CommonStyles.error}>
            Loading images failed.
          </Text>
        )}

        {/* Render loading */}
        {loading && !error && (
          <ActivityIndicator
            style={CommonStyles.progressSpinner}
            size="large"
            color={AppColors.ACCENT}
          />
        )}

        {/* Render data */}
        {!error && !loading && (
          <View onLayout={this.onTopViewLayout}>
            {/* No Images message */}
            {imagesArray.length === 0
              && <View style={styles.infoText}>There are no images in this category.</View>}

            {/* Grid of images */}
            {imagesArray.length > 0
              && (

                <FlatList
                  data={imagesArray}
                  renderItem={({ item, index }) => (
                    <View style={styles.container}>
                      <TouchableHighlight
                        onPress={() => navigation.navigate('ImagePager', { imagesArray, index })}
                        underlayColor="white"
                      >
                        <Image
                          style={styles.image}
                          source={getImageSource(item.renditionUrls.Medium)}
                        />
                      </TouchableHighlight>
                    </View>
                  )}
                  // Setting the number of column
                  numColumns={numColumns}
                  keyExtractor={(_, index) => index.toString()}
                  key={numColumns}
                />

              )}
          </View>
        )}
      </SafeAreaView>
    );
  }
}

/*
 * Define the types of data passed into this component.
 */
ImageGrid.propTypes = {
  navigation: NAVIGATION.isRequired,
  route: ROUTE.isRequired,
};
