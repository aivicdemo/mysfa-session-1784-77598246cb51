import { extractBillingData } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成機能', () => {
  test('SCEN-766: 請求対象データ抽出機能 - ステータス条件が部分一致するとき、該当データが抽出されない', () => {
    const testInvoices = [
      {
        id: 'INV-A',
        status: 'pending_approval',
        customerName: 'Customer A',
        amount: 100000,
        createdAt: '2024-01-15T10:00:00Z',
      },
      {
        id: 'INV-B',
        status: 'pending_payment',
        customerName: 'Customer B',
        amount: 200000,
        createdAt: '2024-01-16T10:00:00Z',
      },
      {
        id: 'INV-C',
        status: 'approved',
        customerName: 'Customer C',
        amount: 150000,
        createdAt: '2024-01-17T10:00:00Z',
      },
    ];

    const extractionCondition = {
      status: 'pending',
      matchType: 'exact',
    };

    const result = extractBillingData(testInvoices, extractionCondition);

    expect(result).toEqual([]);
  });
});