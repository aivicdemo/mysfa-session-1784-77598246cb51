import { validateInvoiceApproval } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成と商談ステータス紐付け - 請求書承認検証機能', () => {
  // SCEN-913
  test('請求書が既に承認済みのとき、再検証で同じ結果が得られる', async () => {
    const invoiceId = 'INV-20240115-001';
    const customerId = 'CUST-001';
    const approvalAmount = 100000;
    const approvalDatetime = new Date('2024-01-15T10:00:00Z');
    const approverUserId = 'user-admin-001';

    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn(),
      generateShareLink: jest.fn(),
      deleteDocument: jest.fn(),
    };

    const mockNotificationServiceAdapter = {
      sendQuoteNotification: jest.fn(),
      sendOrderNotification: jest.fn(),
      sendInvoiceNotification: jest.fn(),
      getDeliveryStatus: jest.fn(),
    };

    const mockPaymentGatewayAdapter = {
      generatePaymentLink: jest.fn(),
      verifyPayment: jest.fn(),
      getTransactionStatus: jest.fn(),
    };

    const preRegisteredInvoice = {
      invoiceId: invoiceId,
      customerId: customerId,
      amount: approvalAmount,
      status: 'APPROVED',
      approvalDatetime: approvalDatetime.toISOString(),
      approverUserId: approverUserId,
    };

    const firstValidationResult = await validateInvoiceApproval(
      invoiceId,
      {
        documentStorageAdapter: mockDocumentStorageAdapter,
        notificationServiceAdapter: mockNotificationServiceAdapter,
        paymentGatewayAdapter: mockPaymentGatewayAdapter,
      }
    );

    const secondValidationResult = await validateInvoiceApproval(
      invoiceId,
      {
        documentStorageAdapter: mockDocumentStorageAdapter,
        notificationServiceAdapter: mockNotificationServiceAdapter,
        paymentGatewayAdapter: mockPaymentGatewayAdapter,
      }
    );

    expect(firstValidationResult).toEqual(secondValidationResult);

    expect(firstValidationResult.validationStatus).toBe('APPROVED');
    expect(firstValidationResult.approvalDatetime).toBe(approvalDatetime.toISOString());
    expect(firstValidationResult.approverUserId).toBe(approverUserId);
    expect(firstValidationResult.validationFlag).toBe(true);
    expect(firstValidationResult.errorMessage).toBeNull();

    expect(secondValidationResult.validationStatus).toBe('APPROVED');
    expect(secondValidationResult.approvalDatetime).toBe(approvalDatetime.toISOString());
    expect(secondValidationResult.approverUserId).toBe(approverUserId);
    expect(secondValidationResult.validationFlag).toBe(true);
    expect(secondValidationResult.errorMessage).toBeNull();

    expect(mockDocumentStorageAdapter.uploadDocument).not.toHaveBeenCalled();
    expect(mockNotificationServiceAdapter.sendInvoiceNotification).not.toHaveBeenCalled();
    expect(mockPaymentGatewayAdapter.generatePaymentLink).not.toHaveBeenCalled();
  });
});