import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { detectAndNotifyLicenseOverage } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-1027: [error] Gmail連携 - メール送信が失敗した場合、ダッシュボードに「通知送信に失敗しました」と表示され、代替動作として通知ログテーブルに失敗記録が残される
  test('SCEN-1027: メール送信失敗時にダッシュボードエラーメッセージ表示と通知ログへの失敗記録が実行される', async () => {
    // Arrange
    const contractedUserCount = 10;
    const actualUserCount = 12;
    const errorCode = 500;
    const errorMessage = 'Internal Server Error: Gmail API timeout';
    const currentTime = new Date('2024-12-15T14:30:00Z');

    const mockNotificationServiceAdapter = {
      sendLicenseOverageAlert: jest.fn().mockRejectedValueOnce(
        new Error(errorMessage)
      ),
    };

    const mockNotificationLogRepository = {
      insertFailureLog: jest.fn().mockResolvedValueOnce({
        id: 'log_001',
        notification_type: 'license_overage_alert',
        status: 'failed',
        error_message: errorMessage,
        created_at: currentTime,
        retry_count: 0,
      }),
      queryByType: jest.fn().mockResolvedValueOnce([
        {
          id: 'log_001',
          notification_type: 'license_overage_alert',
          status: 'failed',
          error_message: errorMessage,
          created_at: currentTime,
          retry_count: 0,
        },
      ]),
    };

    const licenseState = {
      contractedUserCount: contractedUserCount,
      actualUserCount: actualUserCount,
    };

    // Act
    const result = await detectAndNotifyLicenseOverage(
      licenseState,
      mockNotificationServiceAdapter,
      mockNotificationLogRepository,
      currentTime
    );

    // Assert
    // ダッシュボード画面のエラーメッセージ表示確認
    expect(result.dashboardMessage).toBe(
      '通知送信に失敗しました。管理者に手動確認をお願いします'
    );

    // sendLicenseOverageAlert メソッドが呼び出されたことを確認
    expect(mockNotificationServiceAdapter.sendLicenseOverageAlert).toHaveBeenCalledWith(
      expect.objectContaining({
        contractedCount: contractedUserCount,
        actualCount: actualUserCount,
      })
    );

    // 通知ログテーブルへの失敗記録確認
    expect(mockNotificationLogRepository.insertFailureLog).toHaveBeenCalledWith(
      expect.objectContaining({
        notification_type: 'license_overage_alert',
        status: 'failed',
        error_message: errorMessage,
        retry_count: 0,
      })
    );

    // 通知ログテーブルから失敗記録を取得して検証
    const failureLogs = await mockNotificationLogRepository.queryByType(
      'license_overage_alert'
    );
    expect(failureLogs).toHaveLength(1);
    expect(failureLogs[0]).toEqual(
      expect.objectContaining({
        notification_type: 'license_overage_alert',
        status: 'failed',
        error_message: errorMessage,
        created_at: currentTime,
        retry_count: 0,
      })
    );
  });
});