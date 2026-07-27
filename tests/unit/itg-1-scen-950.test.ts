import { reconcileSalesAndInvoice } from '../../src/logic/it-1784969823049-1-1-1';

describe('売上実績・請求状況照合機能', () => {
  // SCEN-950
  test('移行前後で売上実績と請求書が完全に一致する場合、照合結果が合致と判定される', () => {
    const customerId = 'C001';
    const targetDate = '2024-01-15';

    const salesRecord = {
      customerId: 'C001',
      salesDate: '2024-01-15',
      amount: 100000,
      productName: 'productA',
      quantity: 10,
    };

    const invoiceRecord = {
      customerId: 'C001',
      invoiceDate: '2024-01-15',
      amount: 100000,
      productName: 'productA',
      quantity: 10,
    };

    const result = reconcileSalesAndInvoice(
      customerId,
      targetDate,
      salesRecord,
      invoiceRecord
    );

    expect(result.status).toBe('MATCHED');
    expect(result.differenceDetails).toEqual([]);
    expect(result.matchPercentage).toBe(100);
  });
});