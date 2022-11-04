/**
 * Copyright (c) 2022, Oracle and/or its affiliates.
 * Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl/
 */

/**
 * This file contains all the complex PropTypes for data used in this application.
 */

import { shape, func } from 'prop-types';

export const NAVIGATION = shape({
  navigate: func.isRequired,
  setOptions: func.isRequired,
});

export const ROUTE = shape({
  params: shape({}),
});
