import { extractBillingTargetData } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成機能', () => {
  test('SCEN-774: 請求対象データ抽出機能 - 期間条件が終了日直後のとき、該当データが抽出されない', () => {
    // テストデータ準備
    const billingDataset = [
      {
        id: '1001',
        dealStatus: '受注',
        billingDate: new Date('2024-01-15T00:00:00Z'),
        amount: 100000,
        customerId: 'CUST001',
        dealId: 'DEAL001',
      },
      {
        id: '1002',
        dealStatus: '受注',
        billingDate: new Date('2024-01-31T00:00:00Z'),
        amount: 250000,
        customerId: 'CUST002',
        dealId: 'DEAL002',
      },
      {
        id: '1003',
        dealStatus: '受注',
        billingDate: new Date('2024-02-01T00:00:00Z'),
        amount: 150000,
        customerId: 'CUST003',
        dealId: 'DEAL003',
      },
    ];

    // 期間条件を設定
    const startDate = new Date('2024-01-01T00:00:00Z');
    const endDate = new Date('2024-01-31T00:00:00Z');

    // 請求対象データ抽出機能を実行
    const extractedData = extractBillingTargetData(billingDataset, startDate, endDate);

    // 期待結果を検証
    expect(extractedData).toHaveLength(2);
    expect(extractedData[0].id).toBe('1001');
    expect(extractedData[0].billingDate).toEqual(new Date('2024-01-15T00:00:00Z'));
    expect(extractedData[0].amount).toBe(100000);
    expect(extractedData[1].id).toBe('1002');
    expect(extractedData[1].billingDate).toEqual(new Date('2024-01-31T00:00:00Z'));
    expect(extractedData[1].amount).toBe(250000);
    // 2024年2月1日のデータが含まれていないことを確認
    expect(extractedData.some((item) => item.id === '1003')).toBe(false);
  });
});