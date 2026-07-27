import { fetchCustomerDealHistory } from '../../src/logic/it-1';

describe('顧客レコード画面の商談履歴・活動記録表示', () => {
  test('SCEN-441: 商談履歴が複数件の顧客レコードを表示するとき、すべてのレコードが返される', async () => {
    const customerId = 'CUST-001';
    const expectedDeals = [
      {
        dealId: 'DEAL-001',
        dealName: 'システムA導入',
        status: '受注',
        amount: 5000000,
        dealDate: '2024-01-15',
      },
      {
        dealId: 'DEAL-002',
        dealName: 'システムB検討',
        status: '提案中',
        amount: 3000000,
        dealDate: '2024-02-20',
      },
      {
        dealId: 'DEAL-003',
        dealName: '保守契約更新',
        status: '商談終了',
        amount: 1000000,
        dealDate: '2024-03-10',
      },
    ];

    const result = await fetchCustomerDealHistory(customerId);

    expect(result).toHaveLength(3);
    expect(result[0]).toEqual(expectedDeals[0]);
    expect(result[1]).toEqual(expectedDeals[1]);
    expect(result[2]).toEqual(expectedDeals[2]);
  });
});