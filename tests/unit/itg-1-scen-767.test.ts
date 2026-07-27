import { extractInvoicingTargetData } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成と商談ステータス紐付け', () => {
  // SCEN-767
  test('請求対象データ抽出機能 - 金額条件が下限値ちょうどのとき、該当データが抽出される', () => {
    const minimumAmount = 10000;
    
    const dealRecords = [
      {
        dealId: 'DEAL_001',
        customerId: 'CUST_A',
        amount: 10000,
        status: 'won',
        invoiceIssuedDate: '2024-01-15T09:00:00Z',
      },
      {
        dealId: 'DEAL_002',
        customerId: 'CUST_B',
        amount: 9999,
        status: 'won',
        invoiceIssuedDate: '2024-01-14T10:00:00Z',
      },
      {
        dealId: 'DEAL_003',
        customerId: 'CUST_C',
        amount: 10001,
        status: 'won',
        invoiceIssuedDate: '2024-01-16T11:00:00Z',
      },
    ];

    const extractionCondition = {
      minimumAmount: minimumAmount,
      status: 'won',
      period: {
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-01-31T23:59:59Z',
      },
    };

    const result = extractInvoicingTargetData(dealRecords, extractionCondition);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(
      expect.objectContaining({
        dealId: 'DEAL_001',
        customerId: 'CUST_A',
        amount: 10000,
      })
    );
  });
});