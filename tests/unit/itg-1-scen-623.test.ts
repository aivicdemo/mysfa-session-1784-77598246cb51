import { generateInvoiceFromQuote } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成と商談ステータス紐付け', () => {
  test('SCEN-623: 複数の見積明細に同値が並ぶ場合、各明細を個別に請求明細として計上される', async () => {
    // テストデータ: 同一商品コード・単価・数量の見積明細を2件作成
    const quoteLineItem1 = {
      lineItemId: 'quote_line_001',
      productCode: 'A',
      unitPrice: 1000,
      quantity: 5,
      amount: 5000,
    };

    const quoteLineItem2 = {
      lineItemId: 'quote_line_002',
      productCode: 'A',
      unitPrice: 1000,
      quantity: 5,
      amount: 5000,
    };

    const quoteData = {
      quoteId: 'quote_001',
      customerId: 'customer_001',
      customerName: 'Test Customer',
      totalAmount: 10000,
      status: 'confirmed',
      lineItems: [quoteLineItem1, quoteLineItem2],
      createdAt: new Date('2024-01-15T10:00:00Z'),
    };

    // DocumentStorageAdapterのスタブ
    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue({
        documentId: 'doc_001',
        fileUrl: 'https://example.com/invoice_001.pdf',
      }),
      generateShareLink: jest.fn().mockResolvedValue({
        shareLink: 'https://example.com/share/link_001',
        expiresAt: new Date('2024-01-22T10:00:00Z'),
      }),
      deleteDocument: jest.fn().mockResolvedValue({ success: true }),
    };

    // 請求書自動生成を実行
    const generatedInvoice = await generateInvoiceFromQuote(quoteData, mockDocumentStorageAdapter);

    // 生成された請求書の構造を検証
    expect(generatedInvoice).toBeDefined();
    expect(generatedInvoice.invoiceId).toBeDefined();
    expect(generatedInvoice.customerId).toBe('customer_001');
    expect(generatedInvoice.customerName).toBe('Test Customer');

    // 請求明細が2行個別に計上されていることを検証
    expect(generatedInvoice.lineItems).toHaveLength(2);

    // 第1行目の請求明細を検証
    expect(generatedInvoice.lineItems[0]).toEqual({
      invoiceLineId: expect.any(String),
      productCode: 'A',
      unitPrice: 1000,
      quantity: 5,
      amount: 5000,
    });

    // 第2行目の請求明細を検証
    expect(generatedInvoice.lineItems[1]).toEqual({
      invoiceLineId: expect.any(String),
      productCode: 'A',
      unitPrice: 1000,
      quantity: 5,
      amount: 5000,
    });

    // 各行が異なるプライマリキーを持つことを検証
    expect(generatedInvoice.lineItems[0].invoiceLineId).not.toBe(
      generatedInvoice.lineItems[1].invoiceLineId
    );

    // 請求書の合計金額が正確に計算されていることを検証
    // 1,000円 × 5個 × 2行 = 10,000円
    expect(generatedInvoice.totalAmount).toBe(10000);

    // DocumentStorageAdapterのuploadDocumentが呼び出されたことを検証
    expect(mockDocumentStorageAdapter.uploadDocument).toHaveBeenCalledWith(
      expect.objectContaining({
        invoiceId: generatedInvoice.invoiceId,
        customerId: 'customer_001',
      })
    );

    // 生成された請求書のステータスが適切に設定されていることを検証
    expect(generatedInvoice.status).toBe('generated');
  });
});