// Test file to verify pagination structure compatibility
import { Pagination } from '../web/lib/pagination';
import { Invoice } from '../web/lib/invoice.types';

// Test that our new structure is compatible
type TestInvoicesPagination = Pagination.Response<Invoice.Response>;

// Mock data to test structure
const mockResponse: TestInvoicesPagination = {
  data: [],
  total: 0,
  limit: 10,
  page: 1,
  nextCursor: null,
  prevCursor: null,
};

console.log('✅ Pagination structure test passed!', mockResponse);

// Test that it matches what the frontend expects (like in briefs table)
type ExpectedStructure = {
  data: any[] | null;
  total: number | null;
  limit: number | null;
  page: number | null;
  nextCursor?: string | null;
  prevCursor?: string | null;
};

// This should not cause any type errors
const testCompatibility: ExpectedStructure = mockResponse;
console.log('✅ Frontend compatibility test passed!', testCompatibility);
