/**
 * Copyright (c) 2022, Oracle and/or its affiliates.
 * Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl/
 */
/* eslint-disable camelcase */

/**
 * This file contains APIs to get data from a CEC server.
 */
import data from '../config/content.json';

/**
 * Returns the source object for the View element.
 *
 * If authentication is needed, the source object will contain the header value
 * containing the access token.
 *
 * @param imageURL url for the image to render
 * @returns object containing the source for an Image element
 */
export function getImageSource(imageURL) {
  return { uri: imageURL };
}

// ---- Server REST calls to get data ----

const DELIVERY_API_URL_PATH = '/content/published/api/';

/**
 * Utility method to build up the URL for published content.
 *
 * @returns published content server URL
 */
function getContentServerURL() {
  const path = DELIVERY_API_URL_PATH;
  return `${data.serverUrl}${path}${data.apiVersion}/`;
}

/**
 * Adds the channel token to the URL
 *
 * @param {*} currUrl  the current URL to add the channel token to
 * @returns the URL with the channel token added
 */
function addChannelToURL(currUrl) {
  return `${currUrl}?channelToken=${data.channelToken}`;
}

/**
 * Makes a request to the content server
 *
 * @param {String} url the URL to the Content server
 */
async function callServer(url) {
  const requestOptions = {
    method: 'GET',
  };
  return fetch(url, requestOptions);
}

/**
 * Get taxonomies for the channel.<br/>
 * All arguments are passed through to the Content Delivery REST API call.
 *
 * @param {object} params - A JavaScript object containing the "getTaxonomies" parameters.
 * @returns {Promise} A JavaScript Promise object that can be used to retrieve the data
 * after the call has completed.
 * @example
 * // get all taxonomies
 * client.getTaxonomies().then(function (topLevelItem) {
 *   onsole.log(topLevelItem);
 *   return topLevelItem;
 * }, function (xhr, status, error) {
 *   console.log(xhr.responseText);
 * });
 */
export function getTaxonomies() {
  let url = `${getContentServerURL()}taxonomies`;
  url = addChannelToURL(url);

  return callServer(url)
    .then((response) => response.json())
    .then((json) => json)
    .catch((error) => {
      console.error(error);
    });
}

export function queryTaxonomyCategories(args) {
  let url = `${getContentServerURL()}taxonomies/${args.id}/categories`;
  url = addChannelToURL(url);

  return callServer(url)
    .then((response) => response.json())
    .then((json) => json)
    .catch((error) => {
      console.error(error);
    });
}

/**
 * Get a list of items based on SCIM search criteria.
 * All arguments are passed through to the Content Delivery REST API call.
 *
 * @param {object} args - A JavaScript object containing the "queryItems" parameters.
 * @param {string} [args.q=''] - An SCIM query string to restrict results.
 * @param {string} [args.fields=''] - A list of fields to include for each item returned.
 * @param {number} [args.offset] - Return results starting at this number in the results.
 * @param {number} [args.limit] - Limit the number of items returned.
 * @param {array|string} [args.orderBy=[]] - The order by which results should be returned.
 * @param {function} [args.beforeSend=undefined] - A callback passing in the xhr (browser)
 *                    or options (node) object before making the REST call.
 * @returns {Promise} A JavaScript Promise object that can be used to retrieve the data
 *                    after the call has completed.
 * @example
 * // get all items and order by type and name
 * getItems({
 *   'q': '(type eq "' + contentType + '")',
 * }).then(function (items) {
 *   console.log(items);
 * });
 */
export function getItems(args) {
  let url = `${getContentServerURL()}items`;
  url = addChannelToURL(url);

  // add query params to the url
  Object.entries(args).map((entry) => {
    const [key, value] = entry;
    if (key !== 'id' && key !== 'slug') {
      url = `${url}&${key}=${value}`;
    }
    return true;
  });

  return callServer(url)
    .then((response) => response.json())
    .then((json) => json)
    .catch((error) => {
      console.error(error);
    });
}

/**
 * Get a single item given its ID or SLUG. <br/>
 * The ID can be found in the search results.
 * @param {object} args - A JavaScript object containing the "getItem" parameters.
 * @param {string} [args.id] - The ID of the content item to return. <br/>
 *                    The ID or SLUG must be specified.
 * @param {string} [args.slug] - The SLUG of the content item to return, used instead of id.
 *                    <br/>The ID or SLUG must be specified.
 * @param {string} [args.language] - The language locale variant of the content item to return.
 * @param {function} [args.beforeSend=undefined] - A callback passing in the xhr (browser)
 *                    or options (node) object before making the REST call.
 * @returns {Promise} A JavaScript Promise object that can be used to retrieve the data
 *                    after the call has completed.
 * @example
 * Getting item by ID
 * contentPromise = getItem({
 *   'id': contentId
 * });
 *
 * Getting item by SLUG
 * contentPromise = getItem({
 *   'slug': contentSlug
 * });
 *
 * handle the result
 * contentPromise.then(
 *   function (result) {
 *     console.log(result);
 *   },
 *   function (error) {
 *     console.error(error);
 *   }
 * );
 */
export function getItem(args) {
  let url = `${getContentServerURL()}items/`;

  // add the item identifier to the url
  if ('id' in args) {
    // using ID :   /item/{itemId}
    url += args.id;
  } else if ('slug' in args) {
    // using Slug : /item/.by.slug/{slug}
    url = `${url}.by.slug/${args.slug}`;
  }

  // add the channel token to the URL
  url = addChannelToURL(url);

  Object.entries(args).map((entry) => {
    const [key, value] = entry;
    if (key !== 'id' && key !== 'slug') {
      url = `${url}&${key}=${value}`;
    }
    return true;
  });

  return callServer(url)
    .then((response) => response.json())
    .then((json) => json)
    .catch((error) => {
      console.error(error);
    });
}

/**
 * Create the native URL to render an image asset into the page.<br/>
 * @returns {string} A fully qualified URL to the published image asset.
 * @param {object} args - A JavaScript object containing the "getRenditionURL" parameters.
 * @param {string} args.id - The ID of the image asset.
 * @example
 * get the rendition URL for this client
 * console.log(getRenditionURL({
 *   'id': digitalAssetId
 * }));
 */
export function getRenditionURL(args) {
  let url = `${getContentServerURL()}assets/${args.id}/native`;
  url = addChannelToURL(url);
  return url;
}
