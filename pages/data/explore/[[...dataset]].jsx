import { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'next/router';

// actions
import { setIsServer as setServerAction } from 'redactions/common';
import * as actions from 'layout/explore/actions';

// hoc
import {
  withRedux,
  withUserServerSide,
} from 'hoc/auth';

// components
import Explore from 'layout/explore';

class ExplorePage extends PureComponent {
  componentDidMount() {
    const {
      setIsServer,
    } = this.props;

    setIsServer(false);
  }

  componentDidUpdate(prevProps) {
    if (this.shouldUpdateUrl(prevProps)) {
      this.setExploreURL();
    }
  }

  componentWillUnmount() {
    const {
      resetExplore,
    } = this.props;

    resetExplore();
  }

  setExploreURL() {
    const {
      explore: {
        datasets,
        filters,
        sort,
        map: {
          viewport,
          basemap,
          labels,
          boundaries,
          layerGroups,
          aoi,
        },
        sidebar: { anchor, section, selectedCollection },
      },
      router,
    } = this.props;

    const query = {
      // dataset --> "Old" Explore Detail
      ...!!datasets && datasets.selected && { dataset: datasets.selected },
      ...!!anchor && { hash: anchor },
      section,
      selectedCollection,
      // map params
      zoom: viewport.zoom,
      lat: viewport.latitude,
      lng: viewport.longitude,
      pitch: viewport.pitch,
      bearing: viewport.bearing,
      basemap,
      labels,
      ...!!boundaries && { boundaries },
      ...!!layerGroups.length
        && {
          layers: encodeURIComponent(JSON.stringify(layerGroups.map((lg) => ({
            dataset: lg.dataset,
            opacity: lg.opacity || 1,
            visible: lg.visible,
            layer: lg.layers.find((l) => l.active === true).id,
          })))),
        },
      aoi,

      // Datasets
      page: datasets.page,
      sort: sort.selected,
      sortDirection: sort.direction,
      ...filters.search && { search: filters.search },
      ...!!filters.selected.topics.length
        && { topics: encodeURIComponent(JSON.stringify(filters.selected.topics)) },
      ...!!filters.selected.data_types.length
        && { data_types: encodeURIComponent(JSON.stringify(filters.selected.data_types)) },
      ...!!filters.selected.frequencies.length
        && { frequencies: encodeURIComponent(JSON.stringify(filters.selected.frequencies)) },
      ...!!filters.selected.time_periods.length
        && { time_periods: encodeURIComponent(JSON.stringify(filters.selected.time_periods)) },
    };

    if (typeof window !== 'undefined') {
      router.replace(
        {
          pathname: '/data/explore/[[...dataset]]',
          query,
        },
        {},
        {
          shallow: true,
        },
      );
    }
  }

  shouldUpdateUrl(prevProps) {
    const {
      explore: {
        datasets, filters, sort, map,
      },
    } = this.props;

    const {
      explore: {
        datasets: prevDatasets,
        filters: prevFilters,
        sort: prevSort,
        map: prevMap,
      },
    } = prevProps;

    const layers = encodeURIComponent(JSON.stringify(map.layerGroups.map((lg) => ({
      dataset: lg.dataset,
      opacity: lg.opacity || 1,
      visible: lg.visible,
      layer: lg.layers.find((l) => l.active === true).id,
    }))));

    const prevLayers = encodeURIComponent(JSON.stringify(prevMap.layerGroups.map((lg) => ({
      dataset: lg.dataset,
      opacity: lg.opacity || 1,
      visible: lg.visible,
      layer: lg.layers.find((l) => l.active === true).id,
    }))));

    return (
      // Map
      map.viewport.zoom !== prevMap.viewport.zoom
      || map.viewport.latitude !== prevMap.viewport.latitude
      || map.viewport.longitude !== prevMap.viewport.longitude
      || map.viewport.pitch !== prevMap.viewport.pitch
      || map.viewport.bearing !== prevMap.viewport.bearing
      || map.basemap !== prevMap.basemap
      || map.labels.id !== prevMap.labels.id
      || map.boundaries !== prevMap.boundaries
      || layers !== prevLayers
      || map.aoi !== prevMap.aoi
      // Datasets
      || datasets.selected !== prevDatasets.selected
      || datasets.page !== prevDatasets.page
      || sort.selected !== prevSort.selected
      || sort.direction !== prevSort.direction
      || filters.search !== prevFilters.search
      || filters.selected.topics.length !== prevFilters.selected.topics.length
      || filters.selected.data_types.length !== prevFilters.selected.data_types.length
      || filters.selected.frequencies.length !== prevFilters.selected.frequencies.length
      || filters.selected.time_periods.length !== prevFilters.selected.time_periods.length
    );
  }

  render() {
    return (<Explore />);
  }
}

export const getServerSideProps = withRedux(withUserServerSide(async ({ store, query }) => {
  const { dispatch } = store;
  const {
    page,
    search,
    sort,
    sortDirection,
    topics,
    data_types: dataTypes,
    frequencies,
    time_periods: timePeriods,
    zoom,
    lat,
    lng,
    pitch,
    bearing,
    basemap,
    labels,
    boundaries,
    layers,
    dataset,
    section,
    selectedCollection,
    aoi,
  } = query;

  // Query
  if (page) dispatch(actions.setDatasetsPage(+page));
  if (search) dispatch(actions.setFiltersSearch(search));
  // adds this extra-condition to enable backward compatibility
  // with deprecated `most-visited` sorting filter
  if (sort && sort !== 'most-visited') dispatch(actions.setSortSelected(sort));
  if (sortDirection) dispatch(actions.setSortDirection(+sortDirection));
  if (topics) dispatch(actions.setFiltersSelected({ key: 'topics', list: JSON.parse(decodeURIComponent(topics)) }));
  if (dataTypes) dispatch(actions.setFiltersSelected({ key: 'data_types', list: JSON.parse(decodeURIComponent(dataTypes)) }));
  if (frequencies) dispatch(actions.setFiltersSelected({ key: 'frequencies', list: JSON.parse(decodeURIComponent(frequencies)) }));
  if (timePeriods) dispatch(actions.setFiltersSelected({ key: 'time_periods', list: JSON.parse(decodeURIComponent(timePeriods)) }));
  // Selected dataset --> "Old" Explore Detail
  if (dataset) dispatch(actions.setSelectedDataset(dataset.join('')));
  // Selected sidebar section (all data/discover/near-real/time... etc)
  if (section) dispatch(actions.setSidebarSection(section));
  // Selected collection (if any)
  if (selectedCollection) dispatch(actions.setSidebarSelectedCollection(selectedCollection));

  // sets map params from URL
  dispatch(actions.setViewport({
    ...zoom && { zoom: +zoom },
    ...(lat && lng) && {
      latitude: +lat,
      longitude: +lng,
    },
    ...pitch && { pitch: +pitch },
    ...bearing && { bearing: +bearing },
  }));
  if (basemap) dispatch(actions.setBasemap(basemap));
  if (labels) dispatch(actions.setLabels(labels));
  if (boundaries) dispatch(actions.setBoundaries(!!boundaries));
  if (aoi) dispatch(actions.setAreaOfInterest(aoi));

  // Fetch layers
  if (layers) await dispatch(actions.fetchMapLayerGroups(JSON.parse(decodeURIComponent(layers))));

  // Fetch tags
  await dispatch(actions.fetchFiltersTags());

  return ({
    props: ({}),
  });
}));

ExplorePage.propTypes = {
  explore: PropTypes.shape({
    datasets: PropTypes.arrayOf(PropTypes.shape({})),
    filters: PropTypes.shape({
      search: PropTypes.string,
      selected: PropTypes.shape({
        topics: PropTypes.arrayOf(PropTypes.shape({})),
        data_types: PropTypes.arrayOf(PropTypes.shape({})),
        frequencies: PropTypes.arrayOf(PropTypes.shape({})),
        time_periods: PropTypes.arrayOf(PropTypes.shape({})),
      }),
    }),
    map: PropTypes.shape({
      viewport: PropTypes.shape({
        zoom: PropTypes.number,
        latitude: PropTypes.number,
        longitude: PropTypes.number,
        pitch: PropTypes.number,
        bearing: PropTypes.number,
      }),
      basemap: PropTypes.string,
      labels: PropTypes.string,
      boundaries: PropTypes.bool,
      layerGroups: PropTypes.arrayOf(
        PropTypes.shape({}),
      ),
      aoi: PropTypes.string,
    }),
    sidebar: PropTypes.shape({
      section: PropTypes.string,
      anchor: PropTypes.string,
      selectedCollection: PropTypes.string,
    }),
    sort: PropTypes.shape({
      selected: PropTypes.string,
      direction: PropTypes.string,
    }),
  }).isRequired,
  resetExplore: PropTypes.func.isRequired,
  setIsServer: PropTypes.func.isRequired,
  router: PropTypes.shape({
    replace: PropTypes.func.isRequired,
  }).isRequired,
};

export default connect(
  (state) => ({ explore: state.explore }),
  {
    ...actions,
    setIsServer: setServerAction,
  },
)(withRouter(ExplorePage));
