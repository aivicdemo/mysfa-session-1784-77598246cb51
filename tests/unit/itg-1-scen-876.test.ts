import { validateInvoiceApproval } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成と商談ステータス紐付け', () => {
  // SCEN-876
  test('請求明細の数量が0のとき検証が不合格になる', () => {
    const invoiceData = {
      invoiceId: 'INV-20240115-001',
      customerId: 'CUST-001',
      customerName: 'テスト顧客株式会社',
      invoiceDate: new Date('2024-01-15T00:00:00Z'),
      dueDate: new Date('2024-02-15T00:00:00Z'),
      invoiceDetails: [
        {
          detailId: 'DETAIL-001',
          productId: 'PROD-001',
          productName: 'テスト商品',
          quantity: 0,
          unitPrice: 10000,
          taxRate: 0.1,
          subtotal: 0,
          taxAmount: 0,
          total: 0,
        },
      ],
      subtotalAmount: 0,
      taxAmount: 0,
      totalAmount: 0,
      approvalStatus: '検証待機中',
      approvalTimestamp: null,
    };

    const result = validateInvoiceApproval(invoiceData);

    expect(result.isValid).toBe(false);
    expect(result.errorMessage).toMatch(/数量/);
    expect(result.approvalStatus).toBe('検証不合格');
    expect(result.canApprove).toBe(false);
  });
});