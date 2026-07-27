import { searchRevenueRecords } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-349
  test('月次決算レポート生成機能 - 売上実績テーブルから対象期間のレコードを検索するとき、検索結果が1件である', () => {
    // Arrange: 対象期間内の売上実績レコードをセットアップ
    const targetStartDate = new Date('2024-01-01T00:00:00Z');
    const targetEndDate = new Date('2024-01-31T23:59:59Z');
    const revenueRecordWithinPeriod = {
      revenueId: 'REV-001',
      revenueDate: new Date('2024-01-15T10:30:00Z'),
      amount: 150000,
      customerId: 'CUST-A001',
      productId: 'PROD-X100',
      description: '商品X納入',
      status: 'confirmed'
    };

    // 対象期間外のレコード（テストに含めないことで除外を確認）
    const revenueRecordOutsidePeriod = {
      revenueId: 'REV-002',
      revenueDate: new Date('2024-02-05T14:20:00Z'),
      amount: 200000,
      customerId: 'CUST-B002',
      productId: 'PROD-Y200',
      description: '商品Y納入',
      status: 'confirmed'
    };

    // Act: 対象期間で検索実行
    const searchResult = searchRevenueRecords({
      startDate: targetStartDate,
      endDate: targetEndDate,
      records: [revenueRecordWithinPeriod, revenueRecordOutsidePeriod]
    });

    // Assert: 検索結果が正確に1件であることを確認
    expect(searchResult.length).toBe(1);
    
    // 返されたレコードが期待値と一致することを確認
    expect(searchResult[0]).toEqual({
      revenueId: 'REV-001',
      revenueDate: new Date('2024-01-15T10:30:00Z'),
      amount: 150000,
      customerId: 'CUST-A001',
      productId: 'PROD-X100',
      description: '商品X納入',
      status: 'confirmed'
    });
    
    // 対象期間内のすべての項目が含まれていることを確認
    expect(searchResult[0].revenueId).toBeDefined();
    expect(searchResult[0].revenueDate).toBeDefined();
    expect(searchResult[0].amount).toBe(150000);
    expect(searchResult[0].customerId).toBe('CUST-A001');
    expect(searchResult[0].productId).toBe('PROD-X100');
  });
});