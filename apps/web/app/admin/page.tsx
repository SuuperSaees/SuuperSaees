import { AdminDashboard } from '@kit/admin/components/admin-dashboard';
import { AdminGuard } from '@kit/admin/components/admin-guard';

function AdminPage() {
  return (
    <>
      <AdminDashboard />
    </>
  );
}

export default AdminGuard(AdminPage);
