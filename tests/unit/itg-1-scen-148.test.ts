import { fetchPurchaseHistoryForCustomer } from '../../src/logic/it-1';

describe('顧客レコード画面に過去の商談履歴・活動記録・課題解決状況を時系列で表示する機能', () => {
  // SCEN-148
  test('過去購買履歴フィルタリング機能 - 購買履歴が存在しない場合に空の結果セットが返される', async () => {
    const fetchMock = require('jest-fetch-mock');
    fetchMock.enableMocks();
    fetchMock.resetMocks();

    const customerId = 'CUST-999999';
    const userId = 'USR-001';
    const lookbackYears = 3;
    const currentDate = new Date('2024-12-15T10:00:00Z');

    fetchMock.mockResponseOnce(
      JSON.stringify({
        customerId: customerId,
        purchaseHistory: [],
        filteredByPeriod: {
          startDate: '2021-12-15T00:00:00Z',
          endDate: '2024-12-15T23:59:59Z',
        },
        count: 0,
      }),
      { status: 200 }
    );

    const result = await fetchPurchaseHistoryForCustomer({
      customerId: customerId,
      userId: userId,
      lookbackYears: lookbackYears,
      currentDate: currentDate,
    });

    expect(result.purchaseHistory).toEqual([]);
    expect(result.count).toBe(0);
    expect(result.filteredByPeriod.startDate).toBe('2021-12-15T00:00:00Z');
    expect(result.filteredByPeriod.endDate).toBe('2024-12-15T23:59:59Z');
  });
});