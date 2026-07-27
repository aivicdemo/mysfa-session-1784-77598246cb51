import { validateInvoiceApproval } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成と商談ステータス紐付け', () => {
  // SCEN-846
  test('請求書の合計金額が請求明細の合計と一致するとき検証が合格する', () => {
    const invoiceData = {
      invoiceId: 'INV-001',
      customerId: 'CUST-001',
      customerName: '株式会社サンプル',
      invoiceDate: new Date('2024-01-15T00:00:00Z'),
      totalAmount: 10000,
      lineItems: [
        {
          lineItemId: 'LINE-001',
          productName: '品目A',
          quantity: 2,
          unitPrice: 1000,
          subtotal: 2000,
        },
        {
          lineItemId: 'LINE-002',
          productName: '品目B',
          quantity: 1,
          unitPrice: 3000,
          subtotal: 3000,
        },
        {
          lineItemId: 'LINE-003',
          productName: '品目C',
          quantity: 5,
          unitPrice: 1000,
          subtotal: 5000,
        },
      ],
      validationLog: [] as string[],
    };

    const result = validateInvoiceApproval(invoiceData);

    expect(result.passed).toBe(true);
    expect(result.status).toBe('承認合格');
    expect(result.errorMessage).toBe('');
    expect(result.validationLog).toContain(
      '請求書合計金額（10000円）と請求明細合計（10000円）が一致しました'
    );
  });
});