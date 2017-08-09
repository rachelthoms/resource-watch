import React from 'react';

// Components
import DatasetsTable from 'components/datasets/table/DatasetsTable';

function DatasetsIndex() {
  return (
    <div className="c-partners-index">
      <DatasetsTable
        application={[process.env.APPLICATIONS]}
        routes={{
          index: 'admin_data',
          detail: 'admin_data_detail'
        }}
      />
    </div>
  );
}

export default DatasetsIndex;
