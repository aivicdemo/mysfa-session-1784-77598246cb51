import { extractInvoiceDataByDateRange } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成機能', () => {
  // SCEN-772
  test('[edge] 請求対象データ抽出機能 - 期間条件が開始日直前のとき、該当データが抽出されない', () => {
    const testInvoices = [
      {
        invoiceId: 'INV-001',
        invoiceDate: new Date('2024-01-15T00:00:00Z'),
        amount: 100000,
        status: 'confirmed',
      },
      {
        invoiceId: 'INV-002',
        invoiceDate: new Date('2024-01-20T00:00:00Z'),
        amount: 50000,
        status: 'confirmed',
      },
      {
        invoiceId: 'INV-003',
        invoiceDate: new Date('2024-01-25T00:00:00Z'),
        amount: 75000,
        status: 'confirmed',
      },
    ];

    const startDate = new Date('2024-01-15T00:00:00Z');
    const endDate = new Date('2024-01-31T23:59:59Z');

    const result = extractInvoiceDataByDateRange(testInvoices, startDate, endDate);

    expect(result).toHaveLength(2);
    expect(result.map((inv) => inv.invoiceId)).toEqual(['INV-002', 'INV-003']);
    expect(result.map((inv) => inv.amount)).toEqual([50000, 75000]);
    expect(result[0].invoiceId).toBe('INV-002');
    expect(result[0].invoiceDate).toEqual(new Date('2024-01-20T00:00:00Z'));
    expect(result[0].status).toBe('confirmed');
    expect(result[1].invoiceId).toBe('INV-003');
    expect(result[1].invoiceDate).toEqual(new Date('2024-01-25T00:00:00Z'));
    expect(result[1].status).toBe('confirmed');
  });
});