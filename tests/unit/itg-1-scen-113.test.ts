import { extractMonthlyReportData } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-113
  test('月次報告期限・データ抽出処理 - 営業担当者のアクセス権が存在する場合、データ抽出が実行される', () => {
    // 営業担当者ユーザーAのセッション情報
    const salesRepUserA = {
      userId: 'user_001',
      userName: 'Taro Yamada',
      userRole: 'sales_representative',
      assignedBranch: 'Tokyo',
      accessibleBranches: ['Tokyo'],
    };

    // 月次報告期限レコード（2024年1月31日に設定）
    const monthlyDeadlineRecord = {
      deadlineId: 'deadline_001',
      deadlineDate: new Date('2024-01-31T23:59:59Z'),
      targetBranch: 'Tokyo',
      reportingMonth: '2024-01',
      status: 'active',
    };

    // 抽出対象の顧客レコード（東京支店に紐付き）
    const targetCustomers = [
      {
        customerId: 'cust_001',
        customerName: 'ABC Corporation',
        branch: 'Tokyo',
        region: 'Tokyo',
      },
      {
        customerId: 'cust_002',
        customerName: 'XYZ Trading',
        branch: 'Tokyo',
        region: 'Tokyo',
      },
    ];

    // 抽出対象の商談レコード（東京支店顧客に紐付き）
    const targetDeals = [
      {
        dealId: 'deal_001',
        customerId: 'cust_001',
        dealAmount: 500000,
        dealStatus: 'won',
        dealDate: new Date('2024-01-15T10:30:00Z'),
      },
      {
        dealId: 'deal_002',
        customerId: 'cust_002',
        dealAmount: 300000,
        dealStatus: 'won',
        dealDate: new Date('2024-01-20T14:00:00Z'),
      },
    ];

    // 抽出対象の活動レコード（東京支店商談に紐付き）
    const targetActivities = [
      {
        activityId: 'activity_001',
        dealId: 'deal_001',
        activityType: 'visit',
        activityDate: new Date('2024-01-10T09:00:00Z'),
        description: 'Customer visit',
      },
      {
        activityId: 'activity_002',
        dealId: 'deal_002',
        activityType: 'phone_call',
        activityDate: new Date('2024-01-18T11:00:00Z'),
        description: 'Follow-up call',
      },
    ];

    // データ抽出処理を実行
    const extractionParams = {
      session: salesRepUserA,
      deadlineRecord: monthlyDeadlineRecord,
      customers: targetCustomers,
      deals: targetDeals,
      activities: targetActivities,
    };

    const result = extractMonthlyReportData(extractionParams);

    // 期待結果の検証
    expect(result).toBeDefined();
    expect(result.errorMessage).toBeUndefined();
    expect(result.extractedCustomers).toBeDefined();
    expect(result.extractedDeals).toBeDefined();
    expect(result.extractedActivities).toBeDefined();

    // 抽出対象期間の確認（2024年1月1日～2024年1月31日）
    expect(result.extractionPeriodStart).toEqual(new Date('2024-01-01T00:00:00Z'));
    expect(result.extractionPeriodEnd).toEqual(new Date('2024-01-31T23:59:59Z'));

    // 営業担当者のアクセス権に基づいた抽出結果の確認
    expect(result.extractedCustomers.length).toBeGreaterThanOrEqual(1);
    expect(result.extractedDeals.length).toBeGreaterThanOrEqual(1);
    expect(result.extractedActivities.length).toBeGreaterThanOrEqual(1);

    // 抽出結果に東京支店の月次報告レコードが含まれていることを確認
    const extractedDeadlineRecords = result.extractedDeadlineRecords;
    expect(extractedDeadlineRecords).toBeDefined();
    expect(extractedDeadlineRecords.length).toBeGreaterThanOrEqual(1);
    expect(extractedDeadlineRecords[0].deadlineId).toBe('deadline_001');
    expect(extractedDeadlineRecords[0].targetBranch).toBe('Tokyo');
    expect(extractedDeadlineRecords[0].deadlineDate).toEqual(
      new Date('2024-01-31T23:59:59Z')
    );

    // すべての抽出結果が営業担当者Aのアクセス権（Tokyo支店）に紐付いていることを確認
    result.extractedCustomers.forEach((customer) => {
      expect(customer.branch).toBe('Tokyo');
    });

    result.extractedDeals.forEach((deal) => {
      const relatedCustomer = result.extractedCustomers.find(
        (c) => c.customerId === deal.customerId
      );
      expect(relatedCustomer).toBeDefined();
      expect(relatedCustomer?.branch).toBe('Tokyo');
    });

    // エラーメッセージが返されないことを確認
    expect(result.errorMessage).toBeNull();
    expect(result.status).toBe('success');
  });
});