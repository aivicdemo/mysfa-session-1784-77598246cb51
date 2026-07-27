import { describe, it, expect, beforeEach } from '@jest/globals';
import { retrieveCustomerActivityRecords } from '../../src/logic/it-1';

describe('顧客レコード画面の商談履歴・活動記録表示', () => {
  it('SCEN-450: 活動記録が時系列（昇順）で並んでいる場合、その順序で返される', () => {
    // Arrange: テスト対象の活動記録データを時系列（昇順）で準備
    const customerId = 'CUST-001';
    const activityRecords = [
      {
        activityId: 'ACT-001',
        customerId: customerId,
        activityType: 'email',
        activityDate: new Date('2024-01-10T09:00:00Z'),
        description: 'Initial contact email',
        createdAt: new Date('2024-01-10T09:00:00Z'),
      },
      {
        activityId: 'ACT-002',
        customerId: customerId,
        activityType: 'phone',
        activityDate: new Date('2024-01-15T14:30:00Z'),
        description: 'Phone call follow-up',
        createdAt: new Date('2024-01-15T14:30:00Z'),
      },
      {
        activityId: 'ACT-003',
        customerId: customerId,
        activityType: 'visit',
        activityDate: new Date('2024-01-20T11:15:00Z'),
        description: 'On-site visit',
        createdAt: new Date('2024-01-20T11:15:00Z'),
      },
      {
        activityId: 'ACT-004',
        customerId: customerId,
        activityType: 'email',
        activityDate: new Date('2024-01-25T16:45:00Z'),
        description: 'Proposal email',
        createdAt: new Date('2024-01-25T16:45:00Z'),
      },
    ];

    // Act: 顧客の活動記録を時系列で取得
    const result = retrieveCustomerActivityRecords(customerId, activityRecords);

    // Assert: 活動記録が時系列の昇順（古い順）で返されることを検証
    expect(result).toHaveLength(4);

    // 1件目: 2024-01-10 09:00
    expect(result[0]).toEqual(
      expect.objectContaining({
        activityId: 'ACT-001',
        activityDate: new Date('2024-01-10T09:00:00Z'),
        activityType: 'email',
      })
    );

    // 2件目: 2024-01-15 14:30
    expect(result[1]).toEqual(
      expect.objectContaining({
        activityId: 'ACT-002',
        activityDate: new Date('2024-01-15T14:30:00Z'),
        activityType: 'phone',
      })
    );

    // 3件目: 2024-01-20 11:15
    expect(result[2]).toEqual(
      expect.objectContaining({
        activityId: 'ACT-003',
        activityDate: new Date('2024-01-20T11:15:00Z'),
        activityType: 'visit',
      })
    );

    // 4件目: 2024-01-25 16:45
    expect(result[3]).toEqual(
      expect.objectContaining({
        activityId: 'ACT-004',
        activityDate: new Date('2024-01-25T16:45:00Z'),
        activityType: 'email',
      })
    );

    // 時系列順序の検証: 各レコードのactivityDateが昇順であることを確認
    for (let i = 0; i < result.length - 1; i++) {
      expect(result[i].activityDate.getTime()).toBeLessThanOrEqual(
        result[i + 1].activityDate.getTime()
      );
    }
  });
});