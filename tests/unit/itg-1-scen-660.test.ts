import { reconcileSalesAndInvoice } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-660: [edge] 売上実績と請求書のズレ解消機能 - 請求書の金額が0円のとき、0円として処理される
  test('should process zero-amount invoice correctly and reconcile sales and invoice with zero difference', () => {
    // Arrange: 請求書データの準備（金額0円）
    const invoiceData = {
      invoiceId: 'INV-2024-000001',
      customerId: 'CUST-00001',
      invoiceAmount: 0,
      invoiceDate: '2024-01-15',
      dueDate: '2024-02-15',
      status: 'draft',
      lineItems: [
        {
          itemId: 'ITEM-001',
          description: '商品A',
          quantity: 0,
          unitPrice: 0,
          lineTotal: 0,
        },
      ],
    };

    const salesRevenueData = {
      revenueId: 'REV-2024-000001',
      customerId: 'CUST-00001',
      dealId: 'DEAL-00001',
      recordedAmount: 0,
      recordedDate: '2024-01-15',
      status: 'recorded',
    };

    // DocumentStorageAdapter スタブ
    const documentStorageAdapterStub = {
      uploadDocument: jest.fn().mockResolvedValue({
        documentId: 'DOC-2024-000001',
        fileUrl: 'https://storage.example.com/invoices/INV-2024-000001.pdf',
        uploadStatus: 'success',
      }),
      generateShareLink: jest.fn().mockResolvedValue({
        shareLink: 'https://share.example.com/temp-link-12345',
        expiresAt: '2024-01-22T11:00:00Z',
      }),
      deleteDocument: jest.fn().mockResolvedValue({
        deleteStatus: 'success',
      }),
    };

    // NotificationServiceAdapter スタブ
    const notificationServiceAdapterStub = {
      sendInvoiceNotification: jest.fn().mockResolvedValue({
        notificationId: 'NOTIF-2024-000001',
        recipient: 'customer@example.com',
        sentAt: '2024-01-15T12:00:00Z',
        deliveryStatus: 'sent',
      }),
      sendQuoteNotification: jest.fn().mockResolvedValue({}),
      sendOrderNotification: jest.fn().mockResolvedValue({}),
      getDeliveryStatus: jest.fn().mockResolvedValue({}),
    };

    // PaymentGatewayAdapter スタブ
    const paymentGatewayAdapterStub = {
      generatePaymentLink: jest.fn().mockResolvedValue({
        paymentLinkId: 'PAYLINK-2024-000001',
        paymentUrl: 'https://payment.example.com/pay?id=PAYLINK-2024-000001',
        invoiceId: 'INV-2024-000001',
        amount: 0,
        linkExpiresAt: '2024-02-15T23:59:59Z',
      }),
      verifyPayment: jest.fn().mockResolvedValue({
        transactionId: 'TXN-00000001',
        status: 'verified',
      }),
      getTransactionStatus: jest.fn().mockResolvedValue({
        status: 'completed',
      }),
    };

    // Act: 請求書確定・保存処理を実行
    const result = reconcileSalesAndInvoice(
      invoiceData,
      salesRevenueData,
      documentStorageAdapterStub,
      notificationServiceAdapterStub,
      paymentGatewayAdapterStub
    );

    // Assert: 0円請求書が正常に保存されたことを確認
    expect(result.invoiceStatus).toBe('confirmed');
    expect(result.invoiceAmount).toBe(0);
    expect(result.reconciliationDifference).toBe(0);

    // Assert: 売上実績と請求書の金額が一致していることを確認
    expect(result.salesAmount).toBe(0);
    expect(result.invoiceAmount).toBe(0);
    expect(result.amountMatch).toBe(true);

    // Assert: PaymentGatewayAdapter.generatePaymentLinkが0円に対して呼ばれたことを確認
    expect(paymentGatewayAdapterStub.generatePaymentLink).toHaveBeenCalledWith(
      expect.objectContaining({
        invoiceId: 'INV-2024-000001',
        amount: 0,
      })
    );

    // Assert: DocumentStorageAdapter.uploadDocumentが呼ばれたことを確認
    expect(documentStorageAdapterStub.uploadDocument).toHaveBeenCalled();

    // Assert: NotificationServiceAdapter.sendInvoiceNotificationが呼ばれたことを確認
    expect(notificationServiceAdapterStub.sendInvoiceNotification).toHaveBeenCalled();

    // Assert: 支払いリンク生成が0円として処理されたことを確認
    expect(result.paymentLink).toEqual(
      expect.objectContaining({
        amount: 0,
        paymentLinkId: expect.any(String),
      })
    );

    // Assert: 0円請求書が正当な値として処理されたことを確認
    expect(result.isValidZeroAmountInvoice).toBe(true);
  });
});