import { generateInvoice } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成機能', () => {
  // SCEN-613
  test('請求書発行時、請求書レコードを営業管理システムのDBに保存する', async () => {
    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue({
        documentId: 'doc_12345',
        url: 'https://storage.example.com/invoices/doc_12345.pdf',
      }),
      generateShareLink: jest.fn().mockResolvedValue({
        shareLink: 'https://share.example.com/token_abc123',
        expiresAt: new Date('2024-02-15T23:59:59Z'),
      }),
      deleteDocument: jest.fn().mockResolvedValue({ success: true }),
    };

    const mockNotificationServiceAdapter = {
      sendQuoteNotification: jest.fn().mockResolvedValue({ messageId: 'msg_001' }),
      sendOrderNotification: jest.fn().mockResolvedValue({ messageId: 'msg_002' }),
      sendInvoiceNotification: jest.fn().mockResolvedValue({ messageId: 'msg_003' }),
      getDeliveryStatus: jest.fn().mockResolvedValue({ status: 'delivered', openedAt: null }),
    };

    const mockPaymentGatewayAdapter = {
      generatePaymentLink: jest.fn().mockResolvedValue({
        paymentLink: 'https://payment.example.com/pay_xyz789',
        expiresAt: new Date('2024-02-29T23:59:59Z'),
      }),
      verifyPayment: jest.fn().mockResolvedValue({ verified: true, transactionId: 'txn_001' }),
      getTransactionStatus: jest.fn().mockResolvedValue({ status: 'pending' }),
    };

    const mockDatabaseConnection = {
      saveInvoice: jest.fn().mockResolvedValue({
        invoiceId: 'INV-20240115-001',
        customerId: 'CUST-001',
        invoiceDate: new Date('2024-01-15T00:00:00Z'),
        dueDate: new Date('2024-02-15T00:00:00Z'),
        invoiceAmount: 110000,
        taxAmount: 10000,
        taxRate: 0.1,
        handlingFee: 0,
        bankAccountInfo: {
          bankName: '営業銀行',
          branchName: '営業支店',
          accountType: '普通',
          accountNumber: '1234567',
        },
        status: '発行済み',
        createdAt: new Date('2024-01-15T11:00:00Z'),
        updatedAt: new Date('2024-01-15T11:00:00Z'),
      }),
    };

    const invoiceInput = {
      customerId: 'CUST-001',
      customerName: '営業テスト株式会社',
      customerEmail: 'contact@example.com',
      invoiceDate: new Date('2024-01-15T00:00:00Z'),
      dueDate: new Date('2024-02-15T00:00:00Z'),
      lineItems: [
        {
          itemName: '営業ソフトウェアライセンス',
          quantity: 10,
          unitPrice: 10000,
          subtotal: 100000,
        },
      ],
      subtotal: 100000,
      taxRate: 0.1,
      taxAmount: 10000,
      invoiceAmount: 110000,
      handlingFee: 0,
      bankAccountInfo: {
        bankName: '営業銀行',
        branchName: '営業支店',
        accountType: '普通',
        accountNumber: '1234567',
      },
    };

    const result = await generateInvoice(
      invoiceInput,
      mockDatabaseConnection,
      mockDocumentStorageAdapter,
      mockNotificationServiceAdapter,
      mockPaymentGatewayAdapter
    );

    expect(result.invoiceId).toBe('INV-20240115-001');
    expect(result.customerId).toBe('CUST-001');
    expect(result.invoiceDate).toEqual(new Date('2024-01-15T00:00:00Z'));
    expect(result.dueDate).toEqual(new Date('2024-02-15T00:00:00Z'));
    expect(result.invoiceAmount).toBe(110000);
    expect(result.taxAmount).toBe(10000);
    expect(result.taxRate).toBe(0.1);
    expect(result.handlingFee).toBe(0);
    expect(result.bankAccountInfo.bankName).toBe('営業銀行');
    expect(result.bankAccountInfo.branchName).toBe('営業支店');
    expect(result.bankAccountInfo.accountType).toBe('普通');
    expect(result.bankAccountInfo.accountNumber).toBe('1234567');
    expect(result.status).toBe('発行済み');
    expect(result.createdAt).toEqual(new Date('2024-01-15T11:00:00Z'));
    expect(result.updatedAt).toEqual(new Date('2024-01-15T11:00:00Z'));

    expect(mockDatabaseConnection.saveInvoice).toHaveBeenCalledWith(
      expect.objectContaining({
        customerId: 'CUST-001',
        invoiceDate: new Date('2024-01-15T00:00:00Z'),
        dueDate: new Date('2024-02-15T00:00:00Z'),
        invoiceAmount: 110000,
        taxAmount: 10000,
        taxRate: 0.1,
        handlingFee: 0,
        status: '発行済み',
      })
    );

    expect(mockDocumentStorageAdapter.uploadDocument).toHaveBeenCalled();
    expect(mockNotificationServiceAdapter.sendInvoiceNotification).toHaveBeenCalled();
    expect(mockPaymentGatewayAdapter.generatePaymentLink).toHaveBeenCalled();
  });
});