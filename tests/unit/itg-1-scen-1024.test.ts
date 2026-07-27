import { detectLicenseOverageAndNotify } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-1024
  test('ライセンス利用が契約数を超えた場合、管理者へ通知メールを送信', async () => {
    // 初期設定: スタブを定義
    const mockSalesforceDataSource = {
      fetchLicenseUsers: jest.fn().mockResolvedValue({
        totalUsers: 105,
        contractedUsers: 100,
        editionDetails: [
          {
            editionName: 'Salesforce',
            activeUsers: 105,
            contractedLimit: 100,
          },
        ],
      }),
      fetchEditionDetails: jest.fn().mockResolvedValue([]),
      fetchFeatureUsageMetrics: jest.fn().mockResolvedValue([]),
      fetchAnnualCostData: jest.fn().mockResolvedValue([]),
    };

    const mockNotificationService = {
      sendLicenseOverageAlert: jest.fn().mockResolvedValue({
        status: 200,
        notificationId: 'notif-20240415-001',
        timestamp: '2024-04-15T10:30:00Z',
        deliveryStatus: 'success',
      }),
      sendUnusedUserAlert: jest.fn(),
      sendCostForecastAlert: jest.fn(),
    };

    const mockAlertLogStore = {
      records: [] as Array<{
        alertType: string;
        notificationId: string;
        deliveryStatus: string;
        overage: number;
        contractedCount: number;
        activeCount: number;
        adminEmail: string;
        timestamp: string;
      }>,
      insert: function(record: any) {
        this.records.push(record);
      },
    };

    // テスト実行: ライセンス利用状況チェック処理を実行
    const result = await detectLicenseOverageAndNotify(
      mockSalesforceDataSource,
      mockNotificationService,
      mockAlertLogStore,
      'admin@company.example.com'
    );

    // 検証1: sendLicenseOverageAlertが呼び出されたことを確認
    expect(mockNotificationService.sendLicenseOverageAlert).toHaveBeenCalled();

    // 検証2: sendLicenseOverageAlertに渡された引数を検証
    const callArguments =
      mockNotificationService.sendLicenseOverageAlert.mock.calls[0][0];
    expect(callArguments).toEqual(
      expect.objectContaining({
        adminEmail: 'admin@company.example.com',
        overageCount: 5,
        contractedCount: 100,
        activeCount: 105,
        subject: expect.stringContaining('ライセンス利用超過アラート'),
        message: expect.stringContaining('105ユーザー'),
      })
    );

    // 検証3: アラートログテーブルに記録されたことを確認
    expect(mockAlertLogStore.records).toHaveLength(1);
    const logRecord = mockAlertLogStore.records[0];
    expect(logRecord).toEqual(
      expect.objectContaining({
        alertType: 'license_overage',
        notificationId: 'notif-20240415-001',
        deliveryStatus: 'success',
        overage: 5,
        contractedCount: 100,
        activeCount: 105,
        adminEmail: 'admin@company.example.com',
      })
    );

    // 検証4: 戻り値の確認
    expect(result).toEqual(
      expect.objectContaining({
        overageDetected: true,
        overage: 5,
        notificationId: 'notif-20240415-001',
        status: 'notification_sent',
      })
    );
  });
});