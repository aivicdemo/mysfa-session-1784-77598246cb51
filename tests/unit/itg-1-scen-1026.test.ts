import { LicenseAlertNotificationService } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-1026
  test('Gmail連携 - sendCostForecastAlertが成功応答を受けた場合、年間費用予測が予算超過見込みであることを管理者へ通知する', async () => {
    // Arrange
    const adminEmailAddress = 'admin@example.com';
    const predictedAnnualCost = 1200000;
    const budgetLimit = 1000000;
    const excessAmount = 200000;

    const assumedGmailApiResponse = {
      messageId: 'msg_12345abcde',
      threadId: 'thread_67890fghij',
      labelIds: ['SENT'],
      status: 200,
    };

    const mockGmailAdapter = {
      sendEmail: jest.fn().mockResolvedValue(assumedGmailApiResponse),
    };

    const mockNotificationLogger = {
      recordNotification: jest.fn().mockResolvedValue({
        logId: 'log_20240115_001',
        executedAt: new Date('2024-01-15T11:00:00Z'),
        method: 'sendCostForecastAlert',
        status: 'success',
        adminEmail: adminEmailAddress,
        predictedCost: predictedAnnualCost,
        budgetLimit: budgetLimit,
      }),
    };

    const service = new LicenseAlertNotificationService(
      mockGmailAdapter,
      mockNotificationLogger,
    );

    const costForecastPayload = {
      adminEmailAddress,
      predictedAnnualCost,
      budgetLimit,
      excessAmount,
    };

    // Act
    const result = await service.sendCostForecastAlert(costForecastPayload);

    // Assert - Gmail APIスタブが呼び出されたことを確認
    expect(mockGmailAdapter.sendEmail).toHaveBeenCalled();

    // Assert - 宛先が正しいこと
    const gmailCallArgs = mockGmailAdapter.sendEmail.mock.calls[0][0];
    expect(gmailCallArgs.to).toBe(adminEmailAddress);

    // Assert - 件名に「年間費用予測が予算を超える見込みです」を含むこと
    expect(gmailCallArgs.subject).toContain('年間費用予測が予算を超える見込みです');

    // Assert - 本文に具体的な数値（120万円、100万円、20万円）が記載されていること
    expect(gmailCallArgs.body).toContain('1200000');
    expect(gmailCallArgs.body).toContain('1000000');
    expect(gmailCallArgs.body).toContain('200000');

    // Assert - スタブからの成功応答を受け取った後、成功を示すレスポンスが返されていることを確認
    expect(result).toBeDefined();
    expect(result.status).toBe('success');
    expect(result.messageId).toBe('msg_12345abcde');

    // Assert - ログテーブルに実行結果が記録されていることを確認
    expect(mockNotificationLogger.recordNotification).toHaveBeenCalled();

    const logCallArgs =
      mockNotificationLogger.recordNotification.mock.calls[0][0];
    expect(logCallArgs.method).toBe('sendCostForecastAlert');
    expect(logCallArgs.status).toBe('success');
    expect(logCallArgs.adminEmail).toBe(adminEmailAddress);
    expect(logCallArgs.predictedCost).toBe(1200000);
    expect(logCallArgs.budgetLimit).toBe(1000000);
    expect(logCallArgs.excessAmount).toBe(200000);
  });
});