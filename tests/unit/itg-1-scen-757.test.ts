import { reconcileInvoiceWithDeal } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-757
  test('請求書明細が1件の請求書が存在する場合、金額照合が実行される', () => {
    // Arrange: テスト用の請求書データを準備
    const invoiceData = {
      invoice_id: 'INV-001',
      customer_id: 'CUST-001',
      invoice_amount: 20000,
      line_items: [
        {
          line_item_id: 'LINE-001',
          product_name: 'テスト商品',
          unit_price: 10000,
          quantity: 2,
          subtotal: 20000,
        },
      ],
      issue_date: '2024-01-15',
      status: 'issued',
    };

    // テスト用の商談データを準備
    const dealData = {
      deal_id: 'DEAL-001',
      customer_id: 'CUST-001',
      deal_amount: 20000,
      status: 'won',
      expected_invoice_date: '2024-01-15',
    };

    // スタブ: DocumentStorageAdapter
    const documentStorageAdapterStub = {
      uploadDocument: jest.fn().mockResolvedValue({ file_id: 'FILE-001' }),
      generateShareLink: jest.fn().mockResolvedValue({ share_link: 'https://example.com/doc' }),
      deleteDocument: jest.fn().mockResolvedValue({ success: true }),
    };

    // スタブ: NotificationServiceAdapter
    const notificationServiceAdapterStub = {
      sendQuoteNotification: jest.fn().mockResolvedValue({ status: 'sent' }),
      sendOrderNotification: jest.fn().mockResolvedValue({ status: 'sent' }),
      sendInvoiceNotification: jest.fn().mockResolvedValue({ status: 'sent' }),
      getDeliveryStatus: jest.fn().mockResolvedValue({ delivered: true, opened: true }),
    };

    // スタブ: PaymentGatewayAdapter
    const paymentGatewayAdapterStub = {
      generatePaymentLink: jest.fn().mockResolvedValue({ payment_link: 'https://payment.example.com' }),
      verifyPayment: jest.fn().mockResolvedValue({ verified: true, transaction_id: 'TXN-001' }),
      getTransactionStatus: jest.fn().mockResolvedValue({ status: 'completed', amount: 20000 }),
    };

    // Act: 商談ステータス・請求データ照合機能を実行
    const reconciliationResult = reconcileInvoiceWithDeal(
      invoiceData,
      dealData,
      {
        documentStorageAdapter: documentStorageAdapterStub,
        notificationServiceAdapter: notificationServiceAdapterStub,
        paymentGatewayAdapter: paymentGatewayAdapterStub,
      }
    );

    // Assert: 金額照合ロジックが正常に実行されたことを検証
    expect(reconciliationResult).toEqual({
      invoice_id: 'INV-001',
      deal_id: 'DEAL-001',
      amount_match: true,
      invoice_total_amount: 20000,
      deal_amount: 20000,
      line_item_count: 1,
      reconciliation_status: 'matched',
      reconciliation_date: expect.any(String),
    });

    // 金額照合関数が呼び出されたことを確認（内部トレース）
    expect(reconciliationResult.amount_match).toBe(true);

    // 請求書の合計金額が正確に計算されたことを検証
    expect(reconciliationResult.invoice_total_amount).toBe(20000);

    // 商談金額と請求書合計金額の照合結果を確認
    expect(reconciliationResult.deal_amount).toBe(reconciliationResult.invoice_total_amount);

    // ステータスが「matched」で返却されたことを確認
    expect(reconciliationResult.reconciliation_status).toBe('matched');
  });
});