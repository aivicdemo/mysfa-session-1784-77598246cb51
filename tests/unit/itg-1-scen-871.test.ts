import { validateInvoiceForApproval } from '../../src/logic/it-1-1';

interface InvoiceData {
  invoiceId: string;
  customerId: string;
  amount: number;
  taxRate: number;
  invoiceDate: string;
  customerEmail: string;
  lineItems: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
  }>;
}

interface DocumentStorageAdapter {
  uploadDocument: (filename: string, content: Buffer) => Promise<{ filePath: string }>;
  generateShareLink: (filePath: string) => Promise<{ shareLink: string }>;
  deleteDocument: (filePath: string) => Promise<void>;
}

interface NotificationServiceAdapter {
  sendInvoiceNotification: (email: string, invoiceId: string) => Promise<{ status: string }>;
  getDeliveryStatus: (notificationId: string) => Promise<{ delivered: boolean }>;
}

interface PaymentGatewayAdapter {
  generatePaymentLink: (invoiceId: string, amount: number) => Promise<{ paymentLink: string }>;
  verifyPayment: (transactionId: string) => Promise<{ verified: boolean }>;
  getTransactionStatus: (transactionId: string) => Promise<{ status: string }>;
}

interface ValidationResult {
  approvalStatus: 'approved' | 'rejected';
  errorMessages: string[];
  generatedPdfPath: string;
  paymentLink: string;
}

describe('見積・注文・請求書の自動生成機能', () => {
  // SCEN-871: [normal] 請求書承認検証機能 - 同じ請求書データで検証を 2 回実行しても同じ結果が得られる
  test('should return identical validation results when invoice approval is executed twice with same data', async () => {
    const invoiceData: InvoiceData = {
      invoiceId: 'INV-20250115-001',
      customerId: 'CUST-0001',
      amount: 150000,
      taxRate: 0.1,
      invoiceDate: '2025-01-15',
      customerEmail: 'customer@example.com',
      lineItems: [
        {
          description: 'Product A',
          quantity: 2,
          unitPrice: 75000,
        },
      ],
    };

    const mockDocumentStorage: DocumentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue({
        filePath: '/invoices/INV-20250115-001.pdf',
      }),
      generateShareLink: jest.fn().mockResolvedValue({
        shareLink: 'https://drive.example.com/share/INV-20250115-001',
      }),
      deleteDocument: jest.fn().mockResolvedValue(undefined),
    };

    const mockNotificationService: NotificationServiceAdapter = {
      sendInvoiceNotification: jest.fn().mockResolvedValue({
        status: 'sent',
      }),
      getDeliveryStatus: jest.fn().mockResolvedValue({
        delivered: true,
      }),
    };

    const mockPaymentGateway: PaymentGatewayAdapter = {
      generatePaymentLink: jest.fn().mockResolvedValue({
        paymentLink: 'https://payment.example.com/pay/INV-20250115-001',
      }),
      verifyPayment: jest.fn().mockResolvedValue({
        verified: true,
      }),
      getTransactionStatus: jest.fn().mockResolvedValue({
        status: 'pending',
      }),
    };

    const firstResult: ValidationResult = await validateInvoiceForApproval(
      invoiceData,
      mockDocumentStorage,
      mockNotificationService,
      mockPaymentGateway
    );

    const secondResult: ValidationResult = await validateInvoiceForApproval(
      invoiceData,
      mockDocumentStorage,
      mockNotificationService,
      mockPaymentGateway
    );

    expect(firstResult.approvalStatus).toBe('approved');
    expect(secondResult.approvalStatus).toBe('approved');
    expect(firstResult.approvalStatus).toEqual(secondResult.approvalStatus);

    expect(firstResult.errorMessages.length).toBe(0);
    expect(secondResult.errorMessages.length).toBe(0);
    expect(firstResult.errorMessages).toEqual(secondResult.errorMessages);

    expect(firstResult.generatedPdfPath).toBe('/invoices/INV-20250115-001.pdf');
    expect(secondResult.generatedPdfPath).toBe('/invoices/INV-20250115-001.pdf');
    expect(firstResult.generatedPdfPath).toEqual(secondResult.generatedPdfPath);

    expect(firstResult.paymentLink).toBe('https://payment.example.com/pay/INV-20250115-001');
    expect(secondResult.paymentLink).toBe('https://payment.example.com/pay/INV-20250115-001');
    expect(firstResult.paymentLink).toEqual(secondResult.paymentLink);
  });
});