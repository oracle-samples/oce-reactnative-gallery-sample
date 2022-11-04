/**
 * Copyright (c) 2022, Oracle and/or its affiliates.
 * Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl/
 */
import React from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { NAVIGATION } from '../types/index';

import Gallery from './Gallery';

import { fetchCategories, fetchTaxonomies } from '../scripts/services';
import { AppColors, CommonStyles } from '../styles/common';
import { calculateNumColumns } from '../scripts/utils';

const styles = StyleSheet.create({
  flatListContainer: {
    margin: 10,
  },

  listItemContainer: {
    flex: 1,
    margin: 10,
  },

  listItemInvisible: {
    backgroundColor: AppColors.TRANSPARENT,
  },

  topcontainer: {
    flex: 1,
  },
});

/**
 * The component responsible for rendering the home page.
 * Fetches the taxonomies first for the channel and then fetches the categories
 * for each taxonomy. It then passes the each category to the Gallery component
 */
export default class HomePage extends React.Component {
  constructor(props) {
    super(props);
    // This is a false eslint hit - we do use it via a 'self' reference
    // eslint-disable-next-line react/no-unused-class-component-methods
    this.mounted = false;

    const currentScreenWidth = Math.round(Dimensions.get('window').width);
    const numColumns = calculateNumColumns();

    this.state = {
      errorMsg: null,
      loading: true,
      error: false,
      categoriesArray: [],
      currentScreenWidth,
      numColumns,
    };

    // bind functions so they can use "this"
    this.addEmptyItemsToData = this.addEmptyItemsToData.bind(this);
    this.onTopViewLayout = this.onTopViewLayout.bind(this);
    this.renderItem = this.renderItem.bind(this);
  }

  /**
   * Fetches the taxonomies first for the channel and then fetches the categories
   * for each taxonomy
   */
  componentDidMount() {
    // This is a false eslint hit - we do use it via a 'self' reference
    // eslint-disable-next-line react/no-unused-class-component-methods
    this.mounted = true;

    // get the taxonomies
    let categories = [];
    const self = this;

    fetchTaxonomies()
      .then((topLevelItem) => {
        // If the top level item was not found, display an error message
        if (!topLevelItem) {
          if (self.mounted) {
            self.setState({
              error: true,
              errorMsg: 'There was an error fetching the taxonomies.',
            });
            return;
          }
        }

        const taxonomyIds = topLevelItem.items.map((taxonomy) => taxonomy.id);

        // If there are no taxonomies, display an error message
        if (taxonomyIds.length === 0) {
          if (self.mounted) {
            self.setState({
              error: true,
              errorMsg: 'There are no published taxonomies in this repository.',
            });
            return;
          }
        }

        // For each taxonomy, fetch the categories and append them to an array
        taxonomyIds.forEach((taxonomyId, index) => {
          fetchCategories(taxonomyId)
            .then((categoriesTopItem) => {
              categories = categories.concat(categoriesTopItem.items);

              // update the state as you concat the categories.
              if (categories.length !== 0 && self.mounted) {
                self.setState({
                  categoriesArray: categories,
                  loading: false,
                });
              }

              // if there are no categories, set error message accordingly
              if (index === taxonomyIds.length - 1 && categories.length === 0 && self.mounted) {
                self.setState({
                  error: true,
                  errorMsg: 'There are no published categories for taxonomies in this repository.',
                });
              }
            })
            .catch(() => {
              self.setState({ error: true });
            });
        });
      })
      .catch(() => {
        self.setState({ error: true });
      });
  }

  /*
   * Called when the component unmounts.
   */
  componentWillUnmount() {
    // This is a false eslint hit - we do use it via a 'self' reference
    // eslint-disable-next-line react/no-unused-class-component-methods
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
      const numColumns = calculateNumColumns();
      this.setState({
        numColumns,
        currentScreenWidth: newScreenWidth,
      });
    }
  }

  /*
   * If the last row of the list does not fill all the columns,
   * pad the data out with empty items.
   */
  addEmptyItemsToData() {
    const { categoriesArray } = this.state;
    const { numColumns } = this.state;
    const numberOfFullRows = Math.floor(categoriesArray.length / numColumns);
    let numberOfElementsLastRow = categoriesArray.length - (numberOfFullRows * numColumns);

    while (numberOfElementsLastRow !== numColumns && numberOfElementsLastRow !== 0) {
      categoriesArray.push({ id: `BLANK_ITEM-${numberOfElementsLastRow}`, isEmpty: true });
      numberOfElementsLastRow += 1;
    }

    return categoriesArray;
  }

  /*
   * Renders the category by either rendering a view with no contents and transparent
   * background, or by rendering a Gallery component based on whether the category
   * is an empty padding item.
   */
  renderItem({ item }) {
    const { navigation } = this.props;

    if (item.isEmpty !== undefined && item.isEmpty === true) {
      return (
        <View
          style={[styles.listItemContainer, styles.listItemInvisible]}
        />
      );
    }

    return (
      <View style={[styles.listItemBorder, styles.listItemContainer]}>
        <Gallery key={item.id} category={item} navigation={navigation} />
      </View>
    );
  }

  /*
   * Render this component.
   */
  render() {
    const {
      error, errorMsg, loading, numColumns,
    } = this.state;

    return (
      <SafeAreaView style={styles.topcontainer}>
        {/* Render error */}
        {error && (
        <View>
          <Text style={CommonStyles.error}>
            Oops, something went wrong.  Please verify that you have seeded
            data to the server and configured your serverUrl and channelToken.
          </Text>
          {errorMsg && (
          <Text style={CommonStyles.error}>{errorMsg}</Text>
          )}
        </View>
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
        {!loading && !error && (
        <View onLayout={this.onTopViewLayout}>
          <FlatList
            data={this.addEmptyItemsToData()}
            style={styles.flatListContainer}
            renderItem={this.renderItem}
            keyExtractor={(item) => item.id}
            numColumns={numColumns}
            key={numColumns}
          />
        </View>
        )}
      </SafeAreaView>
    );
  }
}

/*
 * Define the type of data used in this component.
 */
HomePage.propTypes = {
  navigation: NAVIGATION.isRequired,
};
