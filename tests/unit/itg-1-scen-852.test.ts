import { validateInvoiceForApproval } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成と商談ステータス紐付け', () => {
  test('SCEN-852: 請求書の金額が業務上の最大規模（999999999999.99）のとき検証が合格する', () => {
    // セットアップ: モックアダプタの定義
    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue({
        documentId: 'doc-max-value-test',
        url: 'https://storage.example.com/doc-max-value-test',
      }),
      generateShareLink: jest.fn().mockResolvedValue({
        shareLink: 'https://share.example.com/max-value-link',
        expiresAt: new Date('2024-12-31T23:59:59Z'),
      }),
      deleteDocument: jest.fn().mockResolvedValue({ success: true }),
    };

    const mockNotificationServiceAdapter = {
      sendQuoteNotification: jest.fn().mockResolvedValue({ messageId: 'msg-quote-1' }),
      sendOrderNotification: jest.fn().mockResolvedValue({ messageId: 'msg-order-1' }),
      sendInvoiceNotification: jest.fn().mockResolvedValue({ messageId: 'msg-invoice-1' }),
      getDeliveryStatus: jest.fn().mockResolvedValue({
        status: 'delivered',
        openedAt: new Date('2024-01-15T12:00:00Z'),
      }),
    };

    const mockPaymentGatewayAdapter = {
      generatePaymentLink: jest.fn().mockResolvedValue({
        paymentLink: 'https://payment.example.com/link-max-value',
        expiresAt: new Date('2024-01-22T23:59:59Z'),
      }),
      verifyPayment: jest.fn().mockResolvedValue({ status: 'verified', transactionId: 'txn-123' }),
      getTransactionStatus: jest.fn().mockResolvedValue({ status: 'completed' }),
    };

    // 請求書オブジェクトの生成: 金額フィールドに最大規模値を設定
    const invoiceData = {
      invoiceId: 'INV-2024-999999999999',
      customerId: 'CUST-001',
      customerName: '大型顧客株式会社',
      customerEmail: 'billing@large-customer.example.com',
      invoiceDate: new Date('2024-01-15T00:00:00Z'),
      dueDate: new Date('2024-02-15T00:00:00Z'),
      totalAmount: 999999999999.99,
      currency: 'JPY',
      status: 'draft',
      lineItems: [
        {
          lineItemId: 'LI-001',
          description: '大型プロジェクト実装サービス',
          quantity: 1,
          unitPrice: 500000000000.00,
          amount: 500000000000.00,
        },
        {
          lineItemId: 'LI-002',
          description: '運用サポート費',
          quantity: 1,
          unitPrice: 499999999999.99,
          amount: 499999999999.99,
        },
      ],
      notes: '最大規模案件の請求書',
      dealId: 'DEAL-9999',
      companyId: 'COMP-001',
      createdBy: 'USER-ADMIN-001',
      createdAt: new Date('2024-01-15T10:00:00Z'),
    };

    // 請求書承認検証ロジックの実行
    const validationResult = validateInvoiceForApproval(
      invoiceData,
      mockDocumentStorageAdapter,
      mockNotificationServiceAdapter,
      mockPaymentGatewayAdapter,
    );

    // 検証結果が「合格」ステータスで返されることを確認
    expect(validationResult.status).toBe('APPROVED');

    // 金額が正確に保持されていることを確認
    expect(validationResult.validatedInvoice.totalAmount).toBe(999999999999.99);

    // 各行明細の金額が正確に保持されていることを確認
    expect(validationResult.validatedInvoice.lineItems[0].amount).toBe(500000000000.00);
    expect(validationResult.validatedInvoice.lineItems[1].amount).toBe(499999999999.99);

    // 金額合計が正確に計算されて保持されていることを確認
    const lineItemTotal = validationResult.validatedInvoice.lineItems.reduce(
      (sum, item) => sum + item.amount,
      0,
    );
    expect(lineItemTotal).toBe(999999999999.99);

    // 検証ログに最大規模値として処理されたことが記録されていることを確認
    expect(validationResult.validationLog).toBeDefined();
    expect(validationResult.validationLog.length).toBeGreaterThan(0);
    expect(validationResult.validationLog).toContainEqual(
      expect.objectContaining({
        type: 'amount_validation',
        value: 999999999999.99,
        result: 'passed',
      }),
    );

    // 必須フィールドすべての検証が成功していることを確認
    expect(validationResult.fieldValidations).toEqual(
      expect.objectContaining({
        invoiceId: { valid: true },
        customerId: { valid: true },
        customerName: { valid: true },
        customerEmail: { valid: true },
        invoiceDate: { valid: true },
        dueDate: { valid: true },
        totalAmount: { valid: true },
        lineItems: { valid: true },
      }),
    );

    // 丸め込みやオーバーフロー等のエラーが発生していないことを確認
    expect(validationResult.errors).toEqual([]);
    expect(validationResult.warnings).toEqual([]);
  });
});