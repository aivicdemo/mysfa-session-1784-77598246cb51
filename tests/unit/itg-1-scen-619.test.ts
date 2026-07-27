import { generateInvoice } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成機能', () => {
  // SCEN-619: [edge] 請求書自動生成機能 - 請求書発行日が年をまたぐ場合、請求書に正しい年月日が記録される
  test('should generate invoice with correct date when crossing year boundary', async () => {
    // Setup: Mock DocumentStorageAdapter
    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue({
        documentId: 'doc-2025-00001',
        shareLink: 'https://storage.example.com/share/doc-2025-00001',
      }),
      generateShareLink: jest.fn(),
      deleteDocument: jest.fn(),
    };

    // Mock current date: 2024-12-31 23:59:59 UTC
    const originalDateNow = Date.now;
    const decemberDate = new Date('2024-12-31T23:59:59Z').getTime();
    jest.spyOn(global, 'Date').mockImplementation(() => {
      return new Date('2024-12-31T23:59:59Z') as any;
    });

    // Test customer data
    const testCustomer = {
      customerId: 'TEST-CUST-001',
      customerName: 'テスト太郎',
      email: 'test@example.com',
    };

    // Test billing target data
    const testBillingData = {
      customerId: 'TEST-CUST-001',
      amount: 100000,
      billingPeriodStart: '2024-12-01',
      billingPeriodEnd: '2024-12-31',
    };

    // Advance time to 2025-01-01 00:00:00 UTC
    jest.spyOn(global, 'Date').mockImplementation(() => {
      return new Date('2025-01-01T00:00:00Z') as any;
    });

    // Call generateInvoice
    const result = await generateInvoice(
      testCustomer,
      testBillingData,
      mockDocumentStorageAdapter,
    );

    // Verify invoiceDate is 2025-01-01
    expect(result.invoiceDate).toBe('2025-01-01');

    // Verify invoiceNumber follows the format YYYY-NNNNN
    expect(result.invoiceNumber).toBe('2025-00001');

    // Verify generatedAt timestamp
    expect(result.generatedAt).toBe('2025-01-01T00:00:00Z');

    // Verify DocumentStorageAdapter.uploadDocument was called exactly once
    expect(mockDocumentStorageAdapter.uploadDocument).toHaveBeenCalledTimes(1);

    // Verify the call includes correct invoice data with proper date
    const uploadCall = mockDocumentStorageAdapter.uploadDocument.mock.calls[0];
    expect(uploadCall[0]).toMatchObject({
      invoiceNumber: '2025-00001',
      invoiceDate: '2025-01-01',
      customerName: 'テスト太郎',
      amount: 100000,
    });

    // Verify PDF content includes correct date
    expect(uploadCall[0].pdfContent).toContain('2025年1月1日');

    // Restore Date mock
    jest.spyOn(global, 'Date').mockRestore();
  });
});