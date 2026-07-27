import { fetchCustomerRecordDetails } from '../../src/logic/it-1';

describe('顧客レコード画面に過去の商談履歴・活動記録・課題解決状況を時系列で表示する機能', () => {
  // SCEN-456
  test('同じ日時の重複レコードが含まれているとき、両方が返される', async () => {
    const customerId = 'CUST-001';
    const duplicateTimestamp = new Date('2024-01-15T14:30:00Z');

    const issueResolution1 = {
      id: 'IR-001',
      issueId: 'C001',
      status: '解決',
      owner: '営業太郎',
      createdAt: duplicateTimestamp,
      recordType: 'issueResolution',
    };

    const issueResolution2 = {
      id: 'IR-002',
      issueId: 'C002',
      status: '解決',
      owner: '営業花子',
      createdAt: duplicateTimestamp,
      recordType: 'issueResolution',
    };

    const mockDealHistory = [
      {
        id: 'DEAL-001',
        dealName: '商談A',
        createdAt: new Date('2024-01-10T10:00:00Z'),
        recordType: 'deal',
      },
    ];

    const mockActivityRecords = [
      {
        id: 'ACT-001',
        activityType: 'email',
        description: 'メール送信',
        createdAt: new Date('2024-01-12T09:00:00Z'),
        recordType: 'activity',
      },
    ];

    const result = await fetchCustomerRecordDetails(customerId, {
      dealHistory: mockDealHistory,
      activityRecords: mockActivityRecords,
      issueResolutions: [issueResolution1, issueResolution2],
    });

    const timelineRecords = result.timeline.sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
    );

    const issueResolutionRecords = timelineRecords.filter(
      (record) => record.recordType === 'issueResolution'
    );

    expect(issueResolutionRecords).toHaveLength(2);
    expect(issueResolutionRecords[0]).toEqual(
      expect.objectContaining({
        id: 'IR-001',
        issueId: 'C001',
        status: '解決',
        owner: '営業太郎',
        createdAt: duplicateTimestamp,
        recordType: 'issueResolution',
      })
    );
    expect(issueResolutionRecords[1]).toEqual(
      expect.objectContaining({
        id: 'IR-002',
        issueId: 'C002',
        status: '解決',
        owner: '営業花子',
        createdAt: duplicateTimestamp,
        recordType: 'issueResolution',
      })
    );

    const allRecords = result.timeline;
    expect(allRecords.length).toBeGreaterThanOrEqual(4);
  });
});