import { extractDealRecordsByPeriod } from '../../src/logic/it-1';

describe('顧客レコード画面に過去の商談履歴・活動記録・課題解決状況を時系列で表示する機能', () => {
  // SCEN-115
  test('月次報告期限・データ抽出処理 - 抽出対象期間内に作成された商談レコード1件のみの場合、その1件が返される', () => {
    const targetStartDate = new Date('2024-01-01T00:00:00Z');
    const targetEndDate = new Date('2024-01-31T23:59:59Z');
    const withinPeriodCreatedAt = new Date('2024-01-15T10:30:00Z');
    const outsidePeriodCreatedAt = new Date('2024-02-05T10:30:00Z');

    const dealWithinPeriod = {
      dealId: 'DL001',
      customerName: 'テスト顧客A',
      amount: 500000,
      status: '進行中',
      createdAt: withinPeriodCreatedAt,
    };

    const dealOutsidePeriod = {
      dealId: 'DL002',
      customerName: 'テスト顧客B',
      amount: 300000,
      status: '提案中',
      createdAt: outsidePeriodCreatedAt,
    };

    const allDeals = [dealWithinPeriod, dealOutsidePeriod];

    const result = extractDealRecordsByPeriod(allDeals, targetStartDate, targetEndDate);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      dealId: 'DL001',
      customerName: 'テスト顧客A',
      amount: 500000,
      status: '進行中',
      createdAt: withinPeriodCreatedAt,
    });
  });
});