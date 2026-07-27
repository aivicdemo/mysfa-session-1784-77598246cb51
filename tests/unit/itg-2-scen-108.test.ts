import { validateInvoiceApproval } from '../../src/logic/it-1784969823049-2-1-2';

describe('顧客向けポータル - 請求書承認検証機能', () => {
  // SCEN-108: [edge] 請求書承認検証機能 - 請求書明細の金額に端数（小数点以下）が生じるとき、丸め方針に従い検証する
  test('請求書明細の端数を四捨五入で丸め、合計金額を検証して承認可能ステータスを返す', () => {
    const invoiceLineItems = [
      {
        lineId: 'line_001',
        description: '商品A',
        unitPrice: 1000.333,
        quantity: 1,
      },
      {
        lineId: 'line_002',
        description: '商品B',
        unitPrice: 2000.667,
        quantity: 1,
      },
      {
        lineId: 'line_003',
        description: '商品C',
        unitPrice: 3000.5,
        quantity: 1,
      },
    ];

    const rounding_policy = 'ROUND_HALF_UP';

    const result = validateInvoiceApproval({
      lineItems: invoiceLineItems,
      roundingPolicy: rounding_policy,
    });

    expect(result.roundedLineItems).toEqual([
      {
        lineId: 'line_001',
        description: '商品A',
        originalAmount: 1000.333,
        roundedAmount: 1000,
      },
      {
        lineId: 'line_002',
        description: '商品B',
        originalAmount: 2000.667,
        roundedAmount: 2001,
      },
      {
        lineId: 'line_003',
        description: '商品C',
        originalAmount: 3000.5,
        roundedAmount: 3001,
      },
    ]);

    expect(result.totalAmount).toBe(6002);

    expect(result.approvalStatus).toBe('APPROVABLE');

    expect(result.auditLog).toEqual(
      expect.objectContaining({
        roundingApplied: true,
        roundingPolicy: 'ROUND_HALF_UP',
        lineItemsProcessed: 3,
        fractionalValueDiscarded: [0.333, 0.667, 0.5],
      })
    );
  });
});