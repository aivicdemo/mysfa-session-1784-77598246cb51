import { sendUnusedUserAlert } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-1025
  test('Gmail連携 - sendUnusedUserAlertが成功応答を受けた場合、30日以上未使用ユーザーの検出を管理者へ通知する', async () => {
    const now = new Date('2024-01-15T11:00:00Z');
    const thirtyOneDaysAgo = new Date('2023-12-15T11:00:00Z');
    const fifteenDaysAgo = new Date('2024-01-01T11:00:00Z');
    const fortyFiveDaysAgo = new Date('2023-12-01T11:00:00Z');

    const testUsers = [
      {
        userId: 'USER_A',
        userName: 'ユーザーA',
        lastLoginDate: thirtyOneDaysAgo,
        status: 'active',
      },
      {
        userId: 'USER_B',
        userName: 'ユーザーB',
        lastLoginDate: fifteenDaysAgo,
        status: 'active',
      },
      {
        userId: 'USER_C',
        userName: 'ユーザーC',
        lastLoginDate: fortyFiveDaysAgo,
        status: 'active',
      },
    ];

    const adminEmailAddress = 'admin@example.com';

    const mockGmailSend = jest.fn().mockResolvedValue({
      status: 200,
      messageId: 'msg_12345',
    });

    const notificationLogRecords: Array<{
      notificationType: string;
      status: string;
      sentAt: Date;
      recipientEmail: string;
      detectedUserCount: number;
    }> = [];

    const mockNotificationLogInsert = jest.fn().mockImplementation((record) => {
      notificationLogRecords.push(record);
    });

    const result = await sendUnusedUserAlert(
      testUsers,
      adminEmailAddress,
      mockGmailSend,
      mockNotificationLogInsert,
      now
    );

    expect(mockGmailSend).toHaveBeenCalledTimes(1);

    const callArgs = mockGmailSend.mock.calls[0][0];
    expect(callArgs.recipientEmail).toBe('admin@example.com');
    expect(callArgs.subject).toContain('未使用ユーザー検出通知');

    expect(callArgs.body).toContain('30日以上未使用のユーザーを検出しました');
    expect(callArgs.body).toContain('ユーザーA');
    expect(callArgs.body).toContain('ユーザーC');
    expect(callArgs.body).not.toContain('ユーザーB');
    expect(callArgs.body).toContain('31日前');
    expect(callArgs.body).toContain('45日前');

    expect(notificationLogRecords).toHaveLength(1);
    expect(notificationLogRecords[0].notificationType).toBe('UNUSED_USER_ALERT');
    expect(notificationLogRecords[0].status).toBe('SUCCESS');
    expect(notificationLogRecords[0].recipientEmail).toBe('admin@example.com');
    expect(notificationLogRecords[0].detectedUserCount).toBe(2);
    expect(notificationLogRecords[0].sentAt).toEqual(now);

    expect(result).toEqual({
      success: true,
      detectedUserCount: 2,
      notificationStatus: 'SUCCESS',
    });
  });
});