'use client';

import { useTableContext } from '~/(views)/contexts/table-context';

import Table from '../../../components/table/table';

const TableView = () => {
  const { columns, data, controllers, emptyState, configs } = useTableContext();
  return (
    <Table
      data={data}
      columns={columns}
      filterKey={'title'}
      emptyStateComponent={emptyState}
      controllers={controllers}
      configs={configs}
    />
  );
};

export default TableView;
