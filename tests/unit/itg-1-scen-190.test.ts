import { fetchCustomerTimelineRecords } from '../../src/logic/it-1';

describe('顧客レコード画面に過去の商談履歴・活動記録を時系列で表示する機能', () => {
  // SCEN-190
  test('商談・活動記録が存在しない場合に空の配列が返される', async () => {
    const fetchMock = require('jest-fetch-mock');
    fetchMock.enableMocks();
    fetchMock.resetMocks();

    const customerId = 'CUST-00001';
    const userId = 'USER-00001';

    fetchMock.mockResponseOnce(
      JSON.stringify({
        deals: [],
        activities: [],
      }),
      { status: 200 }
    );

    const result = await fetchCustomerTimelineRecords({
      customerId: customerId,
      userId: userId,
    });

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
    expect(result).toEqual([]);

    expect(fetchMock.mock.calls.length).toBe(1);
  });
});