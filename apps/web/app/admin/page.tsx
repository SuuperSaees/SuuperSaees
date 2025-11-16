import { AdminDashboard } from '@kit/admin/components/admin-dashboard';
import { AdminGuard } from '@kit/admin/components/admin-guard';
import { PageBody, PageHeader } from '@kit/ui/page';

function AdminPage() {
  return (
    <>
      <PageHeader
        title={'Super Admin'}
        description={`Your SaaS stats at a glance`}
        className='mx-auto flex w-full lg:px-16 p-8'
      />

      <PageBody className='mx-auto flex w-full lg:px-16 p-8'>
        <AdminDashboard />
      </PageBody>
    </>
  );
}

export default AdminGuard(AdminPage);
