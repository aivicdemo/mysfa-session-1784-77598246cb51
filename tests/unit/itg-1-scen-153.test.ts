import { fetchCustomerRecordWithHistory } from '../../src/logic/it-1';

describe('顧客レコード画面に過去の商談履歴・活動記録・課題解決状況を時系列で表示する機能', () => {
  // SCEN-153
  test('同一タイムスタンプを持つ複数レコードがある場合のソート順序が確定的に処理される', async () => {
    const commonTimestamp = '2024-01-15T14:30:00Z';
    const customerId = 'CUST001';
    const mockRecords = [
      {
        recordId: 'REC003',
        timestamp: commonTimestamp,
        type: 'activity',
        content: 'Email sent to customer',
        activityType: 'email',
        createdAt: '2024-01-15T14:30:00.000Z'
      },
      {
        recordId: 'REC001',
        timestamp: commonTimestamp,
        type: 'activity',
        content: 'Phone call completed',
        activityType: 'phone',
        createdAt: '2024-01-15T14:30:00.000Z'
      },
      {
        recordId: 'REC002',
        timestamp: commonTimestamp,
        type: 'dealing',
        content: 'Negotiation in progress',
        dealingStatus: 'negotiation',
        createdAt: '2024-01-15T14:30:00.000Z'
      },
      {
        recordId: 'REC004',
        timestamp: commonTimestamp,
        type: 'activity',
        content: 'Visit conducted',
        activityType: 'visit',
        createdAt: '2024-01-15T14:30:00.000Z'
      }
    ];

    const fetchMock = require('jest-fetch-mock');
    fetchMock.enableMocks();
    fetchMock.resetMocks();

    fetchMock.mockResponseOnce(
      JSON.stringify({
        customerId: customerId,
        customerName: 'Test Customer Inc.',
        records: mockRecords,
        totalCount: 4
      }),
      { status: 200 }
    );

    const result1 = await fetchCustomerRecordWithHistory({
      customerId: customerId,
      sortOrder: 'desc',
      limit: 100
    });

    expect(result1.records).toBeDefined();
    expect(result1.records.length).toBe(4);
    expect(result1.records[0].recordId).toBe('REC001');
    expect(result1.records[1].recordId).toBe('REC002');
    expect(result1.records[2].recordId).toBe('REC003');
    expect(result1.records[3].recordId).toBe('REC004');

    fetchMock.resetMocks();
    fetchMock.mockResponseOnce(
      JSON.stringify({
        customerId: customerId,
        customerName: 'Test Customer Inc.',
        records: mockRecords,
        totalCount: 4
      }),
      { status: 200 }
    );

    const result2 = await fetchCustomerRecordWithHistory({
      customerId: customerId,
      sortOrder: 'desc',
      limit: 100
    });

    expect(result2.records.length).toBe(4);
    expect(result2.records[0].recordId).toBe(result1.records[0].recordId);
    expect(result2.records[1].recordId).toBe(result1.records[1].recordId);
    expect(result2.records[2].recordId).toBe(result1.records[2].recordId);
    expect(result2.records[3].recordId).toBe(result1.records[3].recordId);

    fetchMock.resetMocks();
    fetchMock.mockResponseOnce(
      JSON.stringify({
        customerId: customerId,
        customerName: 'Test Customer Inc.',
        records: mockRecords,
        totalCount: 4
      }),
      { status: 200 }
    );

    const result3 = await fetchCustomerRecordWithHistory({
      customerId: customerId,
      sortOrder: 'desc',
      limit: 100
    });

    expect(result3.records[0].recordId).toBe('REC001');
    expect(result3.records[1].recordId).toBe('REC002');
    expect(result3.records[2].recordId).toBe('REC003');
    expect(result3.records[3].recordId).toBe('REC004');

    expect(result1.records.map((r: any) => r.recordId)).toEqual(
      result2.records.map((r: any) => r.recordId)
    );
    expect(result2.records.map((r: any) => r.recordId)).toEqual(
      result3.records.map((r: any) => r.recordId)
    );

    expect(result1.records[0].timestamp).toBe(commonTimestamp);
    expect(result1.records[1].timestamp).toBe(commonTimestamp);
    expect(result1.records[2].timestamp).toBe(commonTimestamp);
    expect(result1.records[3].timestamp).toBe(commonTimestamp);

    fetchMock.disableMocks();
  });
});