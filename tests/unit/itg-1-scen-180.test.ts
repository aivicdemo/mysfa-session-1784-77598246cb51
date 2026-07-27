import { aggregateDealProgressByCustomer } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-180: [edge] 顧客別商談進捗集計機能 - 初期接触ステータスの商談合計金額が0円のとき、その金額が0として集計される
  test('初期接触ステータスの複数商談が全て0円の場合、合計金額が0として正確に集計される', () => {
    const deals = [
      {
        dealId: 'DEAL-001',
        customerId: 'CUST-A',
        dealName: 'Deal1',
        status: '初期接触',
        amount: 0,
        closedDate: new Date('2024-01-15'),
      },
      {
        dealId: 'DEAL-002',
        customerId: 'CUST-A',
        dealName: 'Deal2',
        status: '初期接触',
        amount: 0,
        closedDate: new Date('2024-01-16'),
      },
      {
        dealId: 'DEAL-003',
        customerId: 'CUST-A',
        dealName: 'Deal3',
        status: '初期接触',
        amount: 0,
        closedDate: new Date('2024-01-17'),
      },
    ];

    const result = aggregateDealProgressByCustomer(deals);

    expect(result).toEqual(
      expect.objectContaining({
        customerId: 'CUST-A',
        progressByStatus: expect.arrayContaining([
          expect.objectContaining({
            status: '初期接触',
            dealCount: 3,
            totalAmount: 0,
          }),
        ]),
      })
    );

    const initialContactStatus = result.progressByStatus.find(
      (item) => item.status === '初期接触'
    );
    expect(initialContactStatus).toBeDefined();
    expect(initialContactStatus?.totalAmount).toBe(0);
    expect(typeof initialContactStatus?.totalAmount).toBe('number');
  });
});