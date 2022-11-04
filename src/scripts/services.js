/**
 * Copyright (c) 2022, Oracle and/or its affiliates.
 * Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl/
 */

/**
 * This file contains a number of utility methods used to obtain data
 * from the server using the Oracle Content SDK JavaScript Library.
 */

import {
  getTaxonomies,
  queryTaxonomyCategories,
  getItems,
  getItem,
} from './content-rn';

/*
 * Utility method to log an error.
 */
function logError(message, error) {
  if (error && error.statusMessage) {
    console.log(`${message} : `, error.statusMessage);
  } else if (error.error && error.error.code && error.error.code === 'ETIMEDOUT') {
    console.log(`${message} : `, error);
  } else if (error.error && error.error.code) {
    console.log(`${message} : `, error.error.code);
  } else if (error) {
    console.error(message, error);
  }
}

/**
 * Fetch the taxonomies for the channel set in the delivery client.
 *
 * @param {object} client - the delivery client
 * @returns {*} - taxonomies for the channel
 */
export function fetchTaxonomies() {
  return getTaxonomies()
    .then((topLevelItem) => topLevelItem)
    .catch((error) => logError('Fetching taxonomies failed', error));
}

/**
 * Fetch the categories for the specified taxonomyId.
 *
 * @param {object} client - the delivery client
 * @param {string} taxonomyId - the id of the taxonomy for which the categories are desired
 * @returns {*} - categories for the specified taxonomyId
 */
export function fetchCategories(taxonomyId) {
  return queryTaxonomyCategories({
    id: `${taxonomyId}`,
  }).then((topLevelItem) => topLevelItem)
    .catch((error) => logError('Fetching categories for taxonomy failed', error));
}

/**
 * Fetch the items that belong to the category whose id is specified.
 *
 * @param {object} client - the delivery client
 * @param {string} categoryId - the id of the category for which items are to be fetched
 * @param {boolean} limit - whether a limit of 4 needs to be applieds
 * @returns {*} - items that belong to the category
 */
export function fetchItemsForCategory(categoryId, limit) {
  return getItems({
    q: `(taxonomies.categories.nodes.id eq "${categoryId}")`,
    limit: limit ? 4 : 100,
    totalResults: true,
  }).then((topLevelItem) => topLevelItem)
    .catch((error) => logError('Fetching items for category failed', error));
}

/**
 * Retrieve the thumbnail URL for the item specified.
 *
 * @param {DeliveryClient} client - The delivery client which will execute the search
 * @param {String} identifier - the Id of the item whose thumbnail URL is required
 * @returns {String} - the thumbnail URL
 */
export function getMediumRenditionUrl(identifier) {
  return getItem({
    id: identifier,
    expand: 'fields.renditions',
  }).then((asset) => {
    let url = null;
    if (asset.fields && asset.fields.renditions) {
      const object = asset.fields.renditions.filter((item) => item.name === 'Medium')[0];
      const format = object.formats.filter((item) => item.format === 'jpg')[0];
      const self = format.links.filter((item) => item.rel === 'self')[0];
      url = self.href;
    }
    return url;
  }).catch((error) => logError('Fetching medium rendition URL failed', error));
}

/**
 * Retrieve the rendition URLs for the item specified.
 *
 * @param {DeliveryClient} client - The delivery client which will execute the search
 * @param {String} identifier - the Id of the item whose rendition URLs are required
 * @returns {*} - the list rendition URLs
 */
export function retrieveRenditionURLs(identifier) {
  return getItem({
    id: identifier,
    expand: 'fields.renditions',
  }).then((asset) => {
    const urls = {};
    if (asset.fields && asset.fields.renditions) {
      asset.fields.renditions.forEach((rendition) => {
        const { name } = rendition;
        const format = rendition.formats.filter((item) => item.format === 'jpg')[0];
        const self = format.links.filter((item) => item.rel === 'self')[0];
        const url = self.href;
        urls[name] = url;
      });
    }
    urls.Native = asset.fields.native.links[0].href;
    return urls;
  }).catch((error) => logError('Fetching rendition URLs failed', error));
}
