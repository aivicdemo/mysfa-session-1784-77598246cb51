import {
  attachInvoiceToOpportunity,
} from '../../src/logic/it-1784969823049-1-1-1';

// Mock adapters
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

describe('商談ステータスと請求データの紐付け・可視化', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // SCEN-305
  test('商談ステータスが見積中のときに請求データ紐付けが対象外となる', () => {
    const opportunity = {
      opportunity_id: 'OPP-001',
      customer_id: 'CUST-A001',
      status: '見積中',
      amount: 100000,
      created_date: '2024-01-15T10:00:00Z',
    };

    const invoice = {
      invoice_id: 'INV-2024-001',
      opportunity_id: 'OPP-001',
      customer_id: 'CUST-A001',
      amount: 100000,
      due_date: '2024-02-15',
      issue_date: '2024-01-15T10:00:00Z',
      status: '未発行',
    };

    const result = attachInvoiceToOpportunity(
      opportunity,
      invoice,
      mockDocumentStorageAdapter,
      mockNotificationServiceAdapter,
      mockPaymentGatewayAdapter
    );

    expect(result.is_attached).toBe(false);
    expect(result.attachment_status).toBe('未紐付');
    expect(result.reason).toMatch(/ステータス/);
    expect(mockDocumentStorageAdapter.uploadDocument).not.toHaveBeenCalled();
    expect(mockNotificationServiceAdapter.sendInvoiceNotification).not.toHaveBeenCalled();
    expect(mockPaymentGatewayAdapter.generatePaymentLink).not.toHaveBeenCalled();
  });
});