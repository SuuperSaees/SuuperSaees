import { Order } from '~/lib/order.types';
import Table from '../../../components/table/table';
import CardStats from '../../../components/ui/card-stats';
import { useColumns } from '~/hooks/use-columns';
import { isAfter, isBefore, subDays } from 'date-fns';

interface HomeSectionProps {
  memberOrders: Order.Response[];
}
export default function HomeSection({ memberOrders }: HomeSectionProps) {
  const columns = useColumns('orders');

  // Current Date
  const now = new Date();

  // Define Time Ranges
  const last30Days = subDays(now, 30);
  const last60Days = subDays(now, 60);

  // Split Orders into Periods
  const ordersCurrentPeriod = memberOrders.filter(order =>
    isAfter(new Date(order.created_at), last30Days) && isBefore(new Date(order.created_at), now)
  );

  const ordersPreviousPeriod = memberOrders.filter(order =>
    isAfter(new Date(order.created_at), last60Days) && isBefore(new Date(order.created_at), last30Days)
  );

  // Calculate Stats
  const calculateStats = (orders: Order.Type[]) => ({
    active: orders.filter(order => order.status !== 'completed' && order.status !== 'annulled').length,
    completed: orders.filter(order => order.status === 'completed').length,
    total: orders.length,
  });

  const currentStats = calculateStats(ordersCurrentPeriod);
  const previousStats = calculateStats(ordersPreviousPeriod);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        <CardStats
          title="Active Projects"
          value={{ current: currentStats.active, previous: previousStats.active, unit: 'months' }}
        />
        <CardStats
          title="Average Rating"
          value={{ current: 4.5, previous: 4.7, unit: 'months' }} // Placeholder for rating
        />
        <CardStats
          title="Projects in the Last Month"
          value={{ current: currentStats.total, previous: previousStats.total, unit: 'months' }}
        />
        <CardStats
          title="Completed Projects"
          value={{ current: currentStats.completed, previous: previousStats.completed, unit: 'months' }}
        />
      </div>
      <Table data={memberOrders} columns={columns} filterKey={'title'} />
    </div>
  );
}