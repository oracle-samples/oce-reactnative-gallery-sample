/**
 * Copyright (c) 2022, Oracle and/or its affiliates.
 * Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl/
 */
import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
} from 'react-native';
import PropTypes from 'prop-types';
import { NAVIGATION } from '../types/index';

import { fetchItemsForCategory, getMediumRenditionUrl } from '../scripts/services';
import { AppColors, TextSizes } from '../styles/common';
import { getImageSource } from '../scripts/content-rn';

const styles = StyleSheet.create({
  captionContainer: {
    marginBottom: 15,
  },

  captionCount: {
    color: AppColors.GREY,
    fontSize: TextSizes.TEXT_SIZE_MEDIUM,
    textAlign: 'center',
  },

  captionText: {
    color: AppColors.BLACK,
    fontSize: TextSizes.TEXT_SIZE_LARGE,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  firstImage: {
    height: 200,
    marginBottom: 2,
    width: '100%',
  },
  gallery: {
    borderColor: AppColors.BORDER_COLOR,
    borderRadius: 10,
    borderWidth: 1,
    elevation: 5,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  image: {
    height: 100,
    marginBottom: 0,
    width: '33%',
  },
});

/**
 * This component renders the gallery for each category and also displays the
 * name of the category and the number of items belonging to the category.
 * This component is called from the HomePage component. It fetches at max 4
 * items for each category and then for each item, it retrieves the thumbnail.
 * Once all the thumbnails are retrieved, it calls the GalleryItem component
 * for each thumbnail to render it.
 *
 * @param category the category of the items to display
 */
export default class Gallery extends React.Component {
  constructor(props) {
    super(props);

    this.mounted = false;

    this.state = {
      imagesArray: [],
      totalResults: 0,
    };
  }

  /**
   * Fetches four items for each category and then retrieves their thumbnails
   */
  componentDidMount() {
    this.mounted = true;
    const { category } = this.props;

    // fetch the items for the category
    const self = this;
    // Set the third param to true to indicate limit for the number of results
    fetchItemsForCategory(category.id, true)
      .then((topLevelItem) => {
        const images = [];
        // Use subset of the array for the gallery. Max of 4 items only
        const itemsLength = topLevelItem.items.length;
        const max = itemsLength > 4 ? 4 : itemsLength;
        const truncatedArr = topLevelItem.items.slice(0, max);
        truncatedArr.forEach((item) => {
          getMediumRenditionUrl(item.id)
            .then((url) => {
              if (url != null) {
                images.push(url);
                // once all 4 thumbnails are retrieved, then set the state
                if (images.length === max) {
                  if (this.mounted) {
                    self.setState({
                      imagesArray: images,
                      totalResults: topLevelItem.totalResults,
                    });
                  }
                }
              }
            });
        });
      });
  }

  /*
   * Called when the component unmounts.
   */
  componentWillUnmount() {
    this.mounted = false;
  }

  /*
   * Render this component.
   */
  render() {
    const { navigation, category } = this.props;
    const {
      imagesArray, totalResults,
    } = this.state;
    const gotAllData = imagesArray;

    // For each of the 4 items in the gallery, create a GalleryItem
    if (gotAllData) {
      return (
        <TouchableHighlight
          onPress={() => navigation.navigate('ImageGrid', { id: category.id, name: category.name })}
          underlayColor="white"
        >
          <View>
            {/* Images for the category */}
            <View style={styles.gallery}>
              {imagesArray.map(
                (image, i) => (
                  <Image
                    key={category.id + image}
                    style={i === 0 ? styles.firstImage : styles.image}
                    source={getImageSource(image)}
                  />
                ),
              )}
            </View>

            {/* Category Name and total number of items in that category */}
            <View style={styles.captionContainer}>
              <Text style={styles.captionText}>{category.name}</Text>
              <Text style={styles.captionCount}>
                {totalResults}
                {' '}
                photos
              </Text>
            </View>
          </View>
        </TouchableHighlight>
      );
    }
    return (null);
  }
}

/*
 * Define the "category" object passed into this component.
 */
Gallery.propTypes = {
  navigation: NAVIGATION.isRequired,
  category: PropTypes.shape({
    name: PropTypes.string,
    id: PropTypes.string,
  }).isRequired,
};
