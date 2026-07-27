import {
  updateDealStatusAndLinkInvoice,
} from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求データの紐付け・可視化', () => {
  // SCEN-300: [normal] 商談ステータスが『受注』から『完了』に更新されたとき、紐付けが新規に実行される
  test('商談ステータスが受注から完了に更新されたとき、請求書PDF生成・メール通知・支払いリンク生成が実行される', () => {
    // 前提：商談レコードが『受注』ステータスで存在し、対応する請求データが登録されている
    const dealId = 'DEAL-20240415-001';
    const customerId = 'CUST-12345';
    const invoiceAmount = 150000;
    const invoiceDate = '2024-04-15';
    const customerEmail = 'customer@example.com';
    const documentReference = 'DOC-PDF-20240415-001';
    const paymentLink = 'https://payment.example.com/link/PAY-20240415-001';
    const linkingCompletedAt = '2024-04-15T09:30:00Z';

    // モック：DocumentStorageAdapter
    const mockDocumentStorage = {
      uploadDocument: jest.fn().mockResolvedValue({
        documentId: documentReference,
        uploadedAt: linkingCompletedAt,
      }),
      generateShareLink: jest.fn().mockResolvedValue({
        shareLink: 'https://drive.example.com/share/DOC-PDF-20240415-001',
      }),
      deleteDocument: jest.fn().mockResolvedValue({ success: true }),
    };

    // モック：NotificationServiceAdapter
    const mockNotificationService = {
      sendQuoteNotification: jest.fn().mockResolvedValue({
        messageId: 'MSG-QUOTE-001',
        deliveryStatus: 'sent',
      }),
      sendOrderNotification: jest.fn().mockResolvedValue({
        messageId: 'MSG-ORDER-001',
        deliveryStatus: 'sent',
      }),
      sendInvoiceNotification: jest.fn().mockResolvedValue({
        messageId: 'MSG-INV-20240415-001',
        deliveryStatus: 'sent',
      }),
      getDeliveryStatus: jest.fn().mockResolvedValue({
        status: 'delivered',
        openedAt: '2024-04-15T10:15:00Z',
      }),
    };

    // モック：PaymentGatewayAdapter
    const mockPaymentGateway = {
      generatePaymentLink: jest.fn().mockResolvedValue({
        paymentUrl: paymentLink,
        expiresAt: '2024-05-15T23:59:59Z',
        transactionId: 'TXN-20240415-001',
      }),
      verifyPayment: jest.fn().mockResolvedValue({
        paid: false,
        status: 'pending',
      }),
      getTransactionStatus: jest.fn().mockResolvedValue({
        status: 'pending',
        amount: invoiceAmount,
      }),
    };

    // 入力：商談ステータス更新リクエスト
    const dealUpdateInput = {
      dealId,
      customerId,
      currentStatus: '受注',
      newStatus: '完了',
      invoiceAmount,
      invoiceDate,
      customerEmail,
      invoiceCurrencyCode: 'JPY',
    };

    // 実行：商談ステータスを『受注』から『完了』に更新し、紐付けロジックを発火
    const result = updateDealStatusAndLinkInvoice(
      dealUpdateInput,
      mockDocumentStorage,
      mockNotificationService,
      mockPaymentGateway
    );

    // 検証1：DocumentStorageAdapter.uploadDocumentが1回呼び出され、請求書PDFがアップロードされた
    expect(mockDocumentStorage.uploadDocument).toHaveBeenCalledTimes(1);
    expect(mockDocumentStorage.uploadDocument).toHaveBeenCalledWith(
      expect.objectContaining({
        dealId,
        customerId,
        invoiceAmount,
        invoiceDate,
        documentType: 'invoice',
      })
    );

    // 検証2：NotificationServiceAdapter.sendInvoiceNotificationが1回呼び出され、顧客に通知メールが送信された
    expect(mockNotificationService.sendInvoiceNotification).toHaveBeenCalledTimes(1);
    expect(mockNotificationService.sendInvoiceNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        dealId,
        customerEmail,
        invoiceAmount,
        documentReference,
      })
    );

    // 検証3：PaymentGatewayAdapter.generatePaymentLinkが1回呼び出され、支払いリンクが生成された
    expect(mockPaymentGateway.generatePaymentLink).toHaveBeenCalledTimes(1);
    expect(mockPaymentGateway.generatePaymentLink).toHaveBeenCalledWith(
      expect.objectContaining({
        dealId,
        customerId,
        invoiceAmount,
        currencyCode: 'JPY',
      })
    );

    // 検証4：紐付け結果の確認
    // 商談レコードの紐付けステータスが『紐付け済み』に更新されたこと
    expect(result.linkingStatus).toBe('紐付け済み');

    // 紐付けタイムスタンプが記録されたこと
    expect(result.linkedAt).toBe(linkingCompletedAt);

    // 生成されたドキュメント参照IDが保持されたこと
    expect(result.generatedDocumentId).toBe(documentReference);

    // ドキュメントリンクが保持されたこと
    expect(result.documentLink).toBeDefined();
    expect(typeof result.documentLink).toBe('string');

    // 支払いリンクが保持されたこと
    expect(result.paymentLink).toBe(paymentLink);

    // 商談ステータスが『完了』に更新されたこと
    expect(result.dealStatus).toBe('完了');

    // 紐付け処理全体の成功を確認
    expect(result.success).toBe(true);
  });
});