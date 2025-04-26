import { AdminAccountsTable } from '@kit/admin/components/admin-accounts-table';
import { AdminGuard } from '@kit/admin/components/admin-guard';
import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';
import { PageBody, PageHeader } from '@kit/ui/page';

interface SearchParams {
  page?: string;
  account_type?: 'all' | 'team' | 'personal';
  query?: string;
  created_after?: string;
  search_field?: string | string[];
}

export const metadata = {
  title: `Accounts`,
};

async function AccountsPage({ searchParams }: { searchParams: SearchParams }) {
  const client = getSupabaseServerComponentClient({
    admin: true,
  });

  const page = searchParams.page ? parseInt(searchParams.page) : 1;
  const pageSize = 10; // Default page size
  
  // Get search fields from URL parameters
  const searchFields = getSearchFields(searchParams.search_field);
  
  // Calculate range for pagination
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  
  try {
    // Start building the query
    let query = client.from('accounts').select('*', { count: 'exact' });
    
    // Apply date filter if provided
    if (searchParams.created_after) {
      query = query.gte('created_at', searchParams.created_after);
    }
    
    // Apply search query if provided
    if (searchParams.query?.trim()) {
      const searchTerm = `%${searchParams.query.trim()}%`;
      
      // If specific fields are selected, search only in those fields
      if (searchFields.length > 0 && !searchFields.includes('all')) {
        // Use a more reliable approach for multi-field search
        const orFilters = [];
        
        if (searchFields.includes('name')) {
          orFilters.push(`name.ilike.${searchTerm}`);
        }
        
        if (searchFields.includes('email')) {
          orFilters.push(`email.ilike.${searchTerm}`);
        }
        
        if (orFilters.length > 0) {
          query = query.or(orFilters.join(','));
        }
      } else {
        // Search in all fields using OR
        query = query.or(`name.ilike.${searchTerm},email.ilike.${searchTerm}`);
      }
    }
    
    // Apply pagination
    query = query.range(from, to);
    
    // Execute the query
    const { data: dataAccounts, error: errorAccounts, count: countAccounts } = await query;
    
    if (errorAccounts) {
      console.error('Error fetching accounts:', errorAccounts);
      throw errorAccounts;
    }

    
    // Calculate page count
    const pageCount = countAccounts ? Math.ceil(countAccounts / pageSize) : 0;
    
    return (
      <>
        <PageHeader
          title={'Accounts'}
          description={`Below is the list of all the accounts in your application.`}
          className='mx-auto flex w-full lg:px-16 py-16'
        />

        <PageBody className='mx-auto flex w-full lg:px-16 p-8"'>
          <AdminAccountsTable
            page={page}
            pageSize={pageSize}
            pageCount={pageCount}
            data={dataAccounts ?? []}
            filters={{
              type: searchParams.account_type ?? 'all',
              created_after: searchParams.created_after,
            }}
          />
        </PageBody>
      </>
    );
  } catch (error) {
    console.error('Error in AccountsPage:', error);
    
    return (
      <>
        <PageHeader
          title={'Accounts'}
          description={`Below is the list of all the accounts in your application.`}
          className='mx-auto flex w-full lg:px-16 py-16'
        />

        <PageBody className='mx-auto flex w-full lg:px-16 p-8"'>
          {renderError(error)}
        </PageBody>
      </>
    );
  }
}

// Helper function to render error state
function renderError(error: unknown) {
  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
      <h3 className="text-lg font-semibold mb-2">Error loading accounts</h3>
      <p>There was a problem fetching the accounts data. Please try again later.</p>
      <p className="mt-2 text-sm text-red-600">
        {error instanceof Error ? error.message : 'Unknown error'}
      </p>
    </div>
  );
}

// Helper function to get search fields from URL parameters
function getSearchFields(searchField?: string | string[]): string[] {
  if (!searchField) {
    return ['all'];
  }
  
  if (Array.isArray(searchField)) {
    return searchField;
  }
  
  return [searchField];
}

export default AdminGuard(AccountsPage);
