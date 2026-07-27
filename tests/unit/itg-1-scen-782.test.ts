import { extractInvoiceTargetData } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成機能', () => {
  // SCEN-782
  test('金額上限が負数のとき、バリデーションエラーが発生する', () => {
    const invalidParams = {
      amountLimit: -1000,
      status: 'received',
      period: { startDate: new Date('2024-01-01'), endDate: new Date('2024-01-31') }
    };

    expect(() => {
      extractInvoiceTargetData(invalidParams);
    }).toThrow(/金額上限/);
  });
});