import { aggregateMonthlySalesAndBillingStatus } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-140: [edge] 売上実績・請求状況の月次集計機能 - キャンセルまたは失注の商談が売上実績から除外される
  test('should exclude cancelled and lost deals from monthly sales aggregation', () => {
    const targetMonth = '2024-01';
    
    // 初期状態: 成約商談3件（金額1000、1500、2000）
    const dealsBeforeCancellation = [
      {
        deal_id: 'D001',
        customer_id: 'C001',
        status: '成約',
        amount: 1000,
        billing_date: '2024-01-15',
      },
      {
        deal_id: 'D002',
        customer_id: 'C002',
        status: '成約',
        amount: 1500,
        billing_date: '2024-01-16',
      },
      {
        deal_id: 'D003',
        customer_id: 'C003',
        status: '成約',
        amount: 2000,
        billing_date: '2024-01-17',
      },
    ];

    // 月次集計実行（変更前）
    const aggregationBefore = aggregateMonthlySalesAndBillingStatus({
      target_month: targetMonth,
      deals: dealsBeforeCancellation,
    });

    // 変更前の売上合計: 1000 + 1500 + 2000 = 4500
    expect(aggregationBefore.total_sales).toBe(4500);
    expect(aggregationBefore.deal_count).toBe(3);
    expect(aggregationBefore.billing_amount).toBe(4500);

    // D001をキャンセルに変更
    const dealsAfterFirstCancellation = [
      {
        deal_id: 'D001',
        customer_id: 'C001',
        status: 'キャンセル',
        amount: 1000,
        billing_date: '2024-01-15',
      },
      {
        deal_id: 'D002',
        customer_id: 'C002',
        status: '成約',
        amount: 1500,
        billing_date: '2024-01-16',
      },
      {
        deal_id: 'D003',
        customer_id: 'C003',
        status: '成約',
        amount: 2000,
        billing_date: '2024-01-17',
      },
    ];

    // 月次集計実行（キャンセル後）
    const aggregationAfterCancellation = aggregateMonthlySalesAndBillingStatus({
      target_month: targetMonth,
      deals: dealsAfterFirstCancellation,
    });

    // キャンセル後の売上合計: 1500 + 2000 = 3500
    expect(aggregationAfterCancellation.total_sales).toBe(3500);
    expect(aggregationAfterCancellation.deal_count).toBe(2);
    expect(aggregationAfterCancellation.billing_amount).toBe(3500);

    // D002を失注に変更
    const dealsAfterSecondCancellation = [
      {
        deal_id: 'D001',
        customer_id: 'C001',
        status: 'キャンセル',
        amount: 1000,
        billing_date: '2024-01-15',
      },
      {
        deal_id: 'D002',
        customer_id: 'C002',
        status: '失注',
        amount: 1500,
        billing_date: '2024-01-16',
      },
      {
        deal_id: 'D003',
        customer_id: 'C003',
        status: '成約',
        amount: 2000,
        billing_date: '2024-01-17',
      },
    ];

    // 月次集計実行（失注後）
    const aggregationAfterLoss = aggregateMonthlySalesAndBillingStatus({
      target_month: targetMonth,
      deals: dealsAfterSecondCancellation,
    });

    // 失注後の売上合計: 2000のみ
    expect(aggregationAfterLoss.total_sales).toBe(2000);
    expect(aggregationAfterLoss.deal_count).toBe(1);
    expect(aggregationAfterLoss.billing_amount).toBe(2000);

    // 売上合計の差分確認（変更前→キャンセル後）
    const first_reduction = aggregationBefore.total_sales - aggregationAfterCancellation.total_sales;
    expect(first_reduction).toBe(1000);

    // 売上合計の差分確認（キャンセル後→失注後）
    const second_reduction = aggregationAfterCancellation.total_sales - aggregationAfterLoss.total_sales;
    expect(second_reduction).toBe(1500);

    // エクスポート対象データ確認（キャンセル・失注商談を除外した集計）
    const exportData = aggregationAfterLoss.export_data;
    expect(exportData).toEqual([
      {
        deal_id: 'D003',
        customer_id: 'C003',
        status: '成約',
        amount: 2000,
        billing_date: '2024-01-17',
      },
    ]);

    // 全商談リストでステータスが正しく反映されていることを確認
    const fullDealList = aggregationAfterLoss.full_deal_list;
    expect(fullDealList).toHaveLength(3);
    
    const cancelledDeal = fullDealList.find((d: any) => d.deal_id === 'D001');
    expect(cancelledDeal.status).toBe('キャンセル');
    
    const lostDeal = fullDealList.find((d: any) => d.deal_id === 'D002');
    expect(lostDeal.status).toBe('失注');
    
    const contractedDeal = fullDealList.find((d: any) => d.deal_id === 'D003');
    expect(contractedDeal.status).toBe('成約');

    // キャンセル・失注商談がレポート集計から除外されていることを最終確認
    expect(aggregationAfterLoss.included_deal_ids).toEqual(['D003']);
    expect(aggregationAfterLoss.excluded_deal_ids).toEqual(['D001', 'D002']);
  });
});