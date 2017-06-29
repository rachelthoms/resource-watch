import React from 'react';
import InsightForm from 'components/admin/insights/form/InsightForm';
import Title from 'components/ui/Title';
import Layout from 'components/admin/layout/Layout';

export default class InsightEdit extends React.Component {

  render() {
    return (
      <Layout
        title="New insight"
        description="Edit insight description..."
      >
        <div className="row">
          <div className="column small-12">
            <Title className="-huge -p-primary">
              Create Insight
            </Title>
            <InsightForm
              application={['rw']}
              authorization={process.env.TEMP_TOKEN}
              onSubmit={() => Router.pushRoute('insights')}
              mode="new"
            />
          </div>
        </div>
      </Layout>
    );
  }
}
