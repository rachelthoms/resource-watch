import React from 'react';
import PropTypes from 'prop-types';

// Redux
import { connect } from 'react-redux';


// Components
import DatasetIndex from 'components/app/myrw/datasets/pages/index';
import DatasetNew from 'components/app/myrw/datasets/pages/new';
import DatasetShow from 'components/app/myrw/datasets/pages/show';

function DatasetTab(props) {
  const { tab, subtab, id, user } = props;

  return (
    <div className="c-datasets-tab">
      {!id && user.token &&
        <DatasetIndex tab={tab} subtab={subtab} id={id} user={user} />
      }

      {id && id === 'new' && user.token &&
        <DatasetNew tab={tab} subtab={subtab} id={id} user={user} />
      }

      {id && id !== 'new' && user.token &&
        <DatasetShow tab={tab} subtab={subtab} id={id} user={user} />
      }
    </div>
  );
}

DatasetTab.propTypes = {
  user: PropTypes.object,
  tab: PropTypes.string,
  id: PropTypes.string,
  subtab: PropTypes.string
};

const mapStateToProps = state => ({
  user: state.user
});

export default connect(mapStateToProps, null)(DatasetTab);
