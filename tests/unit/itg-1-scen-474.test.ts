import { describe, it, expect, beforeEach } from '@jest/globals';
import { fetchCustomerRecordActivities } from '../../src/logic/it-1';

describe('顧客レコード画面の商談履歴・活動記録表示', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // SCEN-474
  it('月初日の課題解決状況が含まれているとき、正しく返される', () => {
    const customerId = 'CUST-001';
    const issueCreatedAtMonthStart = new Date('2024-01-01T09:00:00Z');
    const issueResolvedAt = new Date('2024-01-15T14:30:00Z');
    const otherActivityDate = new Date('2024-01-10T10:00:00Z');

    const mockActivities = [
      {
        id: 'ACTIVITY-001',
        customerId: customerId,
        type: 'issue',
        createdAt: issueCreatedAtMonthStart,
        status: 'resolved',
        resolvedAt: issueResolvedAt,
        title: 'Contract terms inquiry',
        description: 'Customer asked about payment terms',
      },
      {
        id: 'ACTIVITY-002',
        customerId: customerId,
        type: 'email',
        createdAt: otherActivityDate,
        status: 'completed',
        title: 'Follow-up email sent',
        description: 'Sent proposal document',
      },
      {
        id: 'ACTIVITY-003',
        customerId: customerId,
        type: 'issue',
        createdAt: new Date('2023-12-25T11:00:00Z'),
        status: 'resolved',
        resolvedAt: new Date('2023-12-28T16:45:00Z'),
        title: 'Delivery date confirmation',
        description: 'Customer requested expedited delivery',
      },
    ];

    const result = fetchCustomerRecordActivities(customerId, mockActivities);

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(3);

    const sortedResult = result.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const monthStartIssue = sortedResult.find(
      (activity) =>
        activity.id === 'ACTIVITY-001' &&
        new Date(activity.createdAt).toISOString().slice(0, 10) === '2024-01-01'
    );

    expect(monthStartIssue).toBeDefined();
    expect(monthStartIssue?.status).toBe('resolved');
    expect(monthStartIssue?.resolvedAt).toBe(issueResolvedAt.toISOString());
    expect(monthStartIssue?.type).toBe('issue');
    expect(monthStartIssue?.createdAt).toBe(issueCreatedAtMonthStart.toISOString());

    const firstInTimeline = sortedResult[0];
    expect(new Date(firstInTimeline.createdAt).getTime()).toBeGreaterThanOrEqual(
      new Date(sortedResult[1].createdAt).getTime()
    );

    expect(sortedResult[0].createdAt).toBe(
      new Date('2024-01-15T14:30:00Z').toISOString()
    );
    expect(sortedResult[1].createdAt).toBe(otherActivityDate.toISOString());
    expect(sortedResult[2].createdAt).toBe(
      new Date('2023-12-25T11:00:00Z').toISOString()
    );
  });
});