import { Component, createElement } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import * as actions from './explore-dataset-filters-actions';
import reducers, { initialState } from './explore-dataset-filters-reducer';

import ExploreDatasetFiltersComponent from './explore-dataset-filters-component';
import getFilterStatus from './explore-dataset-filters-selectors';

const mapStateToProps = state => ({
  data: getFilterStatus(state)
});

class ExploreDatasetFiltersContainer extends Component {
  static async getInitialProps(...params) {
    const props = await super.getInitialProps(...params);
    await params.store.dispatch(props.getFiltersData());
    console.log('hey!!');
    return props;
  }

  render() {
    return createElement(ExploreDatasetFiltersComponent, {
      ...this.props
    });
  }
}

export { actions, reducers, initialState };

export default connect(mapStateToProps, actions)(ExploreDatasetFiltersContainer);
