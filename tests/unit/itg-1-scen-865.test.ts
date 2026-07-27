import { verifyInvoiceApproval } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成と商談ステータス紐付け', () => {
  // SCEN-865
  test('請求書承認検証機能 - 請求明細の数量に端数が含まれる場合、合計額が正確に計算される', () => {
    const invoiceDetails = [
      {
        id: 'detail_001',
        unitPrice: 100.00,
        quantity: 3.333,
      },
      {
        id: 'detail_002',
        unitPrice: 50.00,
        quantity: 2.5,
      },
      {
        id: 'detail_003',
        unitPrice: 75.50,
        quantity: 1.2,
      },
    ];

    const result = verifyInvoiceApproval({
      invoiceDetails,
    });

    // 期待計算:
    // 明細1: 100.00 × 3.333 = 333.30円
    // 明細2: 50.00 × 2.5 = 125.00円
    // 明細3: 75.50 × 1.2 = 90.60円
    // 合計: 333.30 + 125.00 + 90.60 = 548.90円

    expect(result.totalAmount).toBe(548.90);
    expect(result.isValid).toBe(true);
    expect(result.details).toHaveLength(3);
    expect(result.details[0].subtotal).toBe(333.30);
    expect(result.details[1].subtotal).toBe(125.00);
    expect(result.details[2].subtotal).toBe(90.60);
  });
});