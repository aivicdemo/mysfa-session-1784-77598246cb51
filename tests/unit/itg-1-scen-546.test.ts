import { reconcileDealAndInvoiceStatus } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-546
  test('対象となる商談が複数件のとき全件が正しく照合される', async () => {
    // Prepare test data: 3 deals with different statuses
    const dealA = {
      id: 'deal-001',
      status: '受注',
      amount: 1000000,
      createdAt: new Date('2024-01-01T00:00:00Z'),
      customerId: 'customer-a',
      customerEmail: 'customer-a@example.com',
      customerName: 'Customer A',
      lineItems: [{ description: 'Product A', quantity: 1, unitPrice: 1000000 }],
    };

    const dealB = {
      id: 'deal-002',
      status: '受注',
      amount: 500000,
      createdAt: new Date('2024-01-05T00:00:00Z'),
      customerId: 'customer-b',
      customerEmail: 'customer-b@example.com',
      customerName: 'Customer B',
      lineItems: [{ description: 'Product B', quantity: 1, unitPrice: 500000 }],
    };

    const dealC = {
      id: 'deal-003',
      status: '提案中',
      amount: 300000,
      createdAt: new Date('2024-01-10T00:00:00Z'),
      customerId: 'customer-c',
      customerEmail: 'customer-c@example.com',
      customerName: 'Customer C',
      lineItems: [{ description: 'Product C', quantity: 1, unitPrice: 300000 }],
    };

    const deals = [dealA, dealB, dealC];

    // Stub DocumentStorageAdapter
    const documentStorageAdapterCalls: Array<{
      method: string;
      args: unknown[];
    }> = [];

    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn(async (docContent: unknown, fileName: string) => {
        documentStorageAdapterCalls.push({
          method: 'uploadDocument',
          args: [docContent, fileName],
        });
        return { documentId: `doc-${fileName}`, url: `https://storage.example.com/${fileName}` };
      }),
      generateShareLink: jest.fn(async (documentId: string) => {
        documentStorageAdapterCalls.push({
          method: 'generateShareLink',
          args: [documentId],
        });
        return { shareLink: `https://share.example.com/${documentId}`, expiresAt: new Date('2024-02-01T00:00:00Z') };
      }),
      deleteDocument: jest.fn(async (documentId: string) => {
        documentStorageAdapterCalls.push({
          method: 'deleteDocument',
          args: [documentId],
        });
        return { success: true };
      }),
    };

    // Stub NotificationServiceAdapter
    const notificationServiceAdapterCalls: Array<{
      method: string;
      args: unknown[];
    }> = [];

    const mockNotificationServiceAdapter = {
      sendQuoteNotification: jest.fn(async (quoteData: unknown) => {
        notificationServiceAdapterCalls.push({
          method: 'sendQuoteNotification',
          args: [quoteData],
        });
        return { status: 'sent' };
      }),
      sendOrderNotification: jest.fn(async (orderData: unknown) => {
        notificationServiceAdapterCalls.push({
          method: 'sendOrderNotification',
          args: [orderData],
        });
        return { status: 'sent' };
      }),
      sendInvoiceNotification: jest.fn(async (invoiceData: unknown) => {
        notificationServiceAdapterCalls.push({
          method: 'sendInvoiceNotification',
          args: [invoiceData],
        });
        return { status: 'sent' };
      }),
      getDeliveryStatus: jest.fn(async (emailId: string) => {
        notificationServiceAdapterCalls.push({
          method: 'getDeliveryStatus',
          args: [emailId],
        });
        return { delivered: true, opened: false };
      }),
    };

    // Stub PaymentGatewayAdapter
    const paymentGatewayAdapterCalls: Array<{
      method: string;
      args: unknown[];
    }> = [];

    const mockPaymentGatewayAdapter = {
      generatePaymentLink: jest.fn(async (invoiceData: unknown) => {
        paymentGatewayAdapterCalls.push({
          method: 'generatePaymentLink',
          args: [invoiceData],
        });
        return { paymentLink: `https://payment.example.com/invoice-${Math.random()}`, expiresAt: new Date('2024-02-01T00:00:00Z') };
      }),
      verifyPayment: jest.fn(async (transactionId: string) => {
        paymentGatewayAdapterCalls.push({
          method: 'verifyPayment',
          args: [transactionId],
        });
        return { verified: true, status: 'completed' };
      }),
      getTransactionStatus: jest.fn(async (transactionId: string) => {
        paymentGatewayAdapterCalls.push({
          method: 'getTransactionStatus',
          args: [transactionId],
        });
        return { status: 'completed', amount: 1000000 };
      }),
    };

    // Execute reconciliation and mismatch detection
    const result = await reconcileDealAndInvoiceStatus(deals, {
      documentStorageAdapter: mockDocumentStorageAdapter,
      notificationServiceAdapter: mockNotificationServiceAdapter,
      paymentGatewayAdapter: mockPaymentGatewayAdapter,
    });

    // Verify expected results
    expect(result.totalDealsProcessed).toBe(3);
    expect(result.dealsWithoutMismatch).toBe(3);
    expect(result.detectedMismatchCount).toBe(0);

    // Verify deal reconciliation results
    const dealAResult = result.reconciliationResults.find((r) => r.dealId === 'deal-001');
    expect(dealAResult).toEqual({
      dealId: 'deal-001',
      status: '受注',
      invoiceIssued: true,
      mismatchDetected: false,
      invoiceIssuedDate: expect.any(String),
    });

    const dealBResult = result.reconciliationResults.find((r) => r.dealId === 'deal-002');
    expect(dealBResult).toEqual({
      dealId: 'deal-002',
      status: '受注',
      invoiceIssued: true,
      mismatchDetected: false,
      invoiceIssuedDate: expect.any(String),
    });

    const dealCResult = result.reconciliationResults.find((r) => r.dealId === 'deal-003');
    expect(dealCResult).toEqual({
      dealId: 'deal-003',
      status: '提案中',
      invoiceIssued: false,
      mismatchDetected: false,
      invoiceIssuedDate: null,
    });

    // Verify DocumentStorageAdapter calls
    const uploadDocumentCalls = documentStorageAdapterCalls.filter((call) => call.method === 'uploadDocument');
    expect(uploadDocumentCalls.length).toBe(2); // dealA and dealB only
    expect(mockDocumentStorageAdapter.uploadDocument).toHaveBeenCalledTimes(2);

    // Verify generateShareLink was called for invoiced deals
    const generateShareLinkCalls = documentStorageAdapterCalls.filter((call) => call.method === 'generateShareLink');
    expect(generateShareLinkCalls.length).toBe(2); // dealA and dealB

    // Verify NotificationServiceAdapter calls
    const sendInvoiceNotificationCalls = notificationServiceAdapterCalls.filter(
      (call) => call.method === 'sendInvoiceNotification'
    );
    expect(sendInvoiceNotificationCalls.length).toBe(2); // dealA and dealB only
    expect(mockNotificationServiceAdapter.sendInvoiceNotification).toHaveBeenCalledTimes(2);

    // Verify PaymentGatewayAdapter calls
    const generatePaymentLinkCalls = paymentGatewayAdapterCalls.filter((call) => call.method === 'generatePaymentLink');
    expect(generatePaymentLinkCalls.length).toBe(2); // dealA and dealB only
    expect(mockPaymentGatewayAdapter.generatePaymentLink).toHaveBeenCalledTimes(2);

    // Verify no duplicate processing
    expect(result.processingLog).toContain('deal-001');
    expect(result.processingLog).toContain('deal-002');
    expect(result.processingLog).toContain('deal-003');

    // Verify all processing completed successfully
    expect(result.executionStatus).toBe('completed');
    expect(result.errors).toEqual([]);
  });
});