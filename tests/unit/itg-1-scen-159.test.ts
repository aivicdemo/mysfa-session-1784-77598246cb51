import { determineExtractionPeriod, aggregateMonthlySalesMetrics } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-159: [edge] 当月集計結果の月判定 - 翌月初日に登録された商談が当月集計に含まれない
  test('翌月初日に登録された商談は当月集計に含まれない', () => {
    // 現在日時を2024年1月31日23時59分に設定
    const jan_31_2024_2359 = new Date('2024-01-31T23:59:00Z');

    // 2024年1月のテスト用商談データを登録
    const janDeal = {
      dealId: 'deal_001',
      dealName: '1月商談',
      customerId: 'cust_001',
      amount: 1000000,
      status: '成約',
      registeredAt: new Date('2024-01-31T23:50:00Z'),
      invoiceIssuedAt: new Date('2024-01-31T23:55:00Z'),
    };

    // システムの現在日時を2024年2月1日00時01分に設定
    const feb_01_2024_0001 = new Date('2024-02-01T00:01:00Z');

    // 2024年2月のテスト用商談データを登録
    const febDeal = {
      dealId: 'deal_002',
      dealName: '2月商談',
      customerId: 'cust_002',
      amount: 500000,
      status: '成約',
      registeredAt: new Date('2024-02-01T00:05:00Z'),
      invoiceIssuedAt: new Date('2024-02-01T00:10:00Z'),
    };

    // 2024年2月の集計対象期間を確認
    const targetMonth = new Date('2024-02-01T00:01:00Z');
    const extractionPeriod = determineExtractionPeriod(targetMonth);

    // 期待される抽出期間: 2024年2月1日00時00分から2024年2月29日23時59分59秒
    const expectedStartDate = new Date('2024-02-01T00:00:00Z');
    const expectedEndDate = new Date('2024-02-29T23:59:59Z');

    expect(extractionPeriod).toEqual({
      startDate: expectedStartDate,
      endDate: expectedEndDate,
    });

    // 2024年2月の集計結果から、登録済み商談の一覧と集計額を取得
    const deals = [janDeal, febDeal];
    const aggregationResult = aggregateMonthlySalesMetrics(
      deals,
      extractionPeriod.startDate,
      extractionPeriod.endDate
    );

    // 期待値: 2024年2月1日に登録された「2月商談」（50万円）のみが集計結果に含まれる
    expect(aggregationResult.dealsInPeriod).toHaveLength(1);
    expect(aggregationResult.dealsInPeriod[0]).toEqual({
      dealId: 'deal_002',
      dealName: '2月商談',
      customerId: 'cust_002',
      amount: 500000,
      status: '成約',
      registeredAt: new Date('2024-02-01T00:05:00Z'),
      invoiceIssuedAt: new Date('2024-02-01T00:10:00Z'),
    });

    // 集計額が50万円であることを確認
    expect(aggregationResult.totalAmount).toBe(500000);

    // 2024年1月31日に登録された「1月商談」は集計結果に含まれていないことを確認
    expect(aggregationResult.dealsInPeriod.some(deal => deal.dealId === 'deal_001')).toBe(false);

    // 受注件数が1件であることを確認
    expect(aggregationResult.confirmedDealsCount).toBe(1);
  });
});