import { describe, test, expect, beforeEach } from '@jest/globals';
import { updateDealStatusAndAttachInvoice } from '../../src/logic/it-1784969823049-1-1-1';

interface Deal {
  dealId: string;
  customerName: string;
  customerEmail: string;
  billingAddress: string;
  billingPhone: string;
  status: string;
  amount: number;
}

interface InvoiceData {
  invoiceId: string;
  dealId: string;
  customerEmail: string;
  documentLink: string;
  paymentLink: string;
  createdAt: string;
}

interface DocumentStorageAdapter {
  uploadDocument(filename: string, content: string): Promise<{ documentId: string }>;
  generateShareLink(documentId: string): Promise<{ shareLink: string }>;
  deleteDocument(documentId: string): Promise<void>;
}

interface NotificationServiceAdapter {
  sendInvoiceNotification(email: string, invoiceId: string): Promise<{ success: boolean }>;
  sendQuoteNotification(email: string, quoteId: string): Promise<{ success: boolean }>;
  sendOrderNotification(email: string, orderId: string): Promise<{ success: boolean }>;
  getDeliveryStatus(messageId: string): Promise<{ status: string }>;
}

interface PaymentGatewayAdapter {
  generatePaymentLink(invoiceId: string, amount: number): Promise<{ paymentLinkId: string }>;
  verifyPayment(paymentLinkId: string): Promise<{ verified: boolean }>;
  getTransactionStatus(transactionId: string): Promise<{ status: string }>;
}

describe('Deal Status Update and Invoice Data Attachment', () => {
  // SCEN-209
  test('should update deal status to closed and auto-attach invoice data when customer info is complete', async () => {
    // Arrange: Setup stub adapters with expected behavior
    const mockDocumentStorage: DocumentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue({ documentId: 'doc-stub-001' }),
      generateShareLink: jest.fn().mockResolvedValue({ shareLink: 'https://drive.example.com/share/doc-stub-001' }),
      deleteDocument: jest.fn().mockResolvedValue(undefined),
    };

    const mockNotificationService: NotificationServiceAdapter = {
      sendInvoiceNotification: jest.fn().mockResolvedValue({ success: true }),
      sendQuoteNotification: jest.fn().mockResolvedValue({ success: true }),
      sendOrderNotification: jest.fn().mockResolvedValue({ success: true }),
      getDeliveryStatus: jest.fn().mockResolvedValue({ status: 'delivered' }),
    };

    const mockPaymentGateway: PaymentGatewayAdapter = {
      generatePaymentLink: jest.fn().mockResolvedValue({ paymentLinkId: 'pay-link-stub-001' }),
      verifyPayment: jest.fn().mockResolvedValue({ verified: true }),
      getTransactionStatus: jest.fn().mockResolvedValue({ status: 'pending' }),
    };

    // Input deal with complete customer information
    const inputDeal: Deal = {
      dealId: 'deal-12345',
      customerName: 'Acme Corporation',
      customerEmail: 'contact@acme.example.com',
      billingAddress: '123 Business Ave, Tokyo, Japan',
      billingPhone: '+81-90-1234-5678',
      status: '検討中',
      amount: 500000,
    };

    // Act: Call the logic function to update deal status and attach invoice
    const result: { deal: Deal; invoice: InvoiceData } = await updateDealStatusAndAttachInvoice(
      inputDeal,
      mockDocumentStorage,
      mockNotificationService,
      mockPaymentGateway,
    );

    // Assert: Verify deal status is updated to closed
    expect(result.deal.status).toBe('成約');

    // Assert: Verify invoice data is created and attached
    expect(result.invoice).toBeDefined();
    expect(result.invoice.dealId).toBe('deal-12345');
    expect(result.invoice.customerEmail).toBe('contact@acme.example.com');

    // Assert: Verify document link exists (from DocumentStorageAdapter)
    expect(result.invoice.documentLink).toBe('https://drive.example.com/share/doc-stub-001');

    // Assert: Verify payment link exists (from PaymentGatewayAdapter)
    expect(result.invoice.paymentLink).toBe('pay-link-stub-001');

    // Assert: Verify external adapters were called exactly once each
    expect(mockDocumentStorage.uploadDocument).toHaveBeenCalledTimes(1);
    expect(mockPaymentGateway.generatePaymentLink).toHaveBeenCalledTimes(1);
    expect(mockNotificationService.sendInvoiceNotification).toHaveBeenCalledTimes(1);

    // Assert: Verify correct parameters were passed to payment gateway
    expect(mockPaymentGateway.generatePaymentLink).toHaveBeenCalledWith('deal-12345', 500000);

    // Assert: Verify notification was sent to correct email
    expect(mockNotificationService.sendInvoiceNotification).toHaveBeenCalledWith(
      'contact@acme.example.com',
      expect.any(String),
    );
  });
});