import { validateAgainstQuote } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成と商談ステータス紐付け', () => {
  test('SCEN-907: 請求書承認検証機能 - 見積の金額と請求書の金額が一致するとき検証が合格する', () => {
    // 見積書データ
    const quoteId = 'QT-001';
    const customerId = 'CUST-A';
    const quoteTotalAmount = 150000;
    const quoteLineItems = [
      {
        lineId: 'QL-001',
        productName: '商品X',
        quantity: 1,
        unitPrice: 100000,
        amount: 100000,
      },
      {
        lineId: 'QL-002',
        productName: '商品Y',
        quantity: 1,
        unitPrice: 50000,
        amount: 50000,
      },
    ];

    // 請求書データ
    const invoiceId = 'INV-001';
    const invoiceTotalAmount = 150000;
    const invoiceLineItems = [
      {
        lineId: 'IL-001',
        productName: '商品X',
        quantity: 1,
        unitPrice: 100000,
        amount: 100000,
      },
      {
        lineId: 'IL-002',
        productName: '商品Y',
        quantity: 1,
        unitPrice: 50000,
        amount: 50000,
      },
    ];

    // 見積書オブジェクト
    const quote = {
      id: quoteId,
      customerId: customerId,
      status: 'APPROVED',
      totalAmount: quoteTotalAmount,
      lineItems: quoteLineItems,
      createdAt: new Date('2024-01-15T10:00:00Z'),
    };

    // 請求書オブジェクト
    const invoice = {
      id: invoiceId,
      quoteId: quoteId,
      customerId: customerId,
      status: 'PENDING_APPROVAL',
      totalAmount: invoiceTotalAmount,
      lineItems: invoiceLineItems,
      createdAt: new Date('2024-01-15T11:00:00Z'),
    };

    // 請求書承認検証を実行
    const result = validateAgainstQuote(invoice, quote);

    // 検証結果を確認
    expect(result.status).toBe('APPROVED');
    expect(result.message).toBe('見積書QT-001との金額一致を確認しました。合計金額：150,000円');
    expect(result.invoiceStatus).toBe('承認済み');
    expect(result.totalAmount).toBe(150000);
    expect(result.lineItemsMatch).toBe(true);
  });
});