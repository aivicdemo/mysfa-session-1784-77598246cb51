import { extractBillingTargetData } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成機能', () => {
  // SCEN-207
  test('抽出条件による請求対象データの絞り込み機能 - 期間の境界値が正確に処理される', () => {
    // Precondition: 営業管理システムに商談レコードが登録されている状態
    const deals = [
      {
        id: 'deal_001',
        customerId: 'cust_001',
        amount: 100000,
        status: '受注',
        createdDate: '2023-12-31',
      },
      {
        id: 'deal_002',
        customerId: 'cust_002',
        amount: 150000,
        status: '受注',
        createdDate: '2024-01-01',
      },
      {
        id: 'deal_003',
        customerId: 'cust_003',
        amount: 200000,
        status: '受注',
        createdDate: '2024-01-15',
      },
      {
        id: 'deal_004',
        customerId: 'cust_004',
        amount: 120000,
        status: '受注',
        createdDate: '2024-01-31',
      },
      {
        id: 'deal_005',
        customerId: 'cust_005',
        amount: 80000,
        status: '受注',
        createdDate: '2024-02-01',
      },
    ];

    // Trigger: 営業担当者が抽出条件に期間「2024-01-01～2024-01-31」を指定して「抽出」ボタンをクリック
    const result = extractBillingTargetData(deals, {
      startDate: '2024-01-01',
      endDate: '2024-01-31',
      status: '受注',
    });

    // Outcome: 指定期間内（開始日・終了日を含む）のデータのみが抽出される
    expect(result).toHaveLength(3);
    expect(result.map((d) => d.id)).toEqual(['deal_002', 'deal_003', 'deal_004']);
    expect(result.map((d) => d.amount)).toEqual([150000, 200000, 120000]);

    // Verify: 開始日前のデータが除外されている
    expect(result.some((d) => d.id === 'deal_001')).toBe(false);

    // Verify: 終了日後のデータが除外されている
    expect(result.some((d) => d.id === 'deal_005')).toBe(false);

    // Trigger: 開始日と終了日が同一日「2024-01-15」の場合で再度抽出
    const resultSingleDay = extractBillingTargetData(deals, {
      startDate: '2024-01-15',
      endDate: '2024-01-15',
      status: '受注',
    });

    // Outcome: 該当する日付のデータが正確に抽出される
    expect(resultSingleDay).toHaveLength(1);
    expect(resultSingleDay[0].id).toBe('deal_003');
    expect(resultSingleDay[0].amount).toBe(200000);
  });
});