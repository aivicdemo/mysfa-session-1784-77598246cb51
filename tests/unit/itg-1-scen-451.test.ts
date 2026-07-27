import { describe, test, expect, beforeEach } from '@jest/globals';
import { fetchCustomerActivitiesChronologically } from '../../src/logic/it-1';

describe('顧客レコード画面の商談履歴・活動記録表示', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // SCEN-451
  test('活動記録が逆時系列（降順）で並んでいる場合、その順序で返される', () => {
    const customerId = 'CUST-12345';
    
    const mockActivities = [
      {
        activityId: 'ACT-001',
        customerId: customerId,
        activityType: 'email',
        executedAt: '2024-01-15T14:30:00Z',
        description: 'Follow-up email sent',
      },
      {
        activityId: 'ACT-002',
        customerId: customerId,
        activityType: 'call',
        executedAt: '2024-01-10T09:00:00Z',
        description: 'Phone call - discussed pricing',
      },
      {
        activityId: 'ACT-003',
        customerId: customerId,
        activityType: 'visit',
        executedAt: '2024-01-05T16:45:00Z',
        description: 'In-person visit - initial contact',
      },
    ];

    const mockActivityDataSource = {
      getActivitiesByCustomerId: jest.fn().mockResolvedValue(mockActivities),
    };

    const result = fetchCustomerActivitiesChronologically(
      customerId,
      mockActivityDataSource,
    );

    return expect(result).resolves.toEqual([
      {
        activityId: 'ACT-001',
        customerId: customerId,
        activityType: 'email',
        executedAt: '2024-01-15T14:30:00Z',
        description: 'Follow-up email sent',
      },
      {
        activityId: 'ACT-002',
        customerId: customerId,
        activityType: 'call',
        executedAt: '2024-01-10T09:00:00Z',
        description: 'Phone call - discussed pricing',
      },
      {
        activityId: 'ACT-003',
        customerId: customerId,
        activityType: 'visit',
        executedAt: '2024-01-05T16:45:00Z',
        description: 'In-person visit - initial contact',
      },
    ]);
  });
});