import { fetchDealHistoryAndActivities } from '../../src/logic/it-1';

describe('顧客レコード画面の商談履歴・活動記録表示', () => {
  // SCEN-439
  test('商談履歴が0件の顧客レコードを表示するとき、空の一覧が返される', () => {
    const customerId = 'TEST-CUST-001';
    const dealHistoryRecords: Array<{
      dealId: string;
      dealName: string;
      status: string;
      amount: number;
      date: string;
    }> = [];
    const activityRecords: Array<{
      activityId: string;
      type: string;
      description: string;
      date: string;
    }> = [];

    const result = fetchDealHistoryAndActivities(customerId, dealHistoryRecords, activityRecords);

    expect(result).toEqual({
      hasRecords: false,
      dealHistoryCount: 0,
      activityCount: 0,
      records: [],
      displayMessage: '商談履歴がありません',
      showTableHeader: true,
      showPagination: false,
      externalServiceCalled: false,
    });
    expect(result.dealHistoryCount).toBe(0);
    expect(result.activityCount).toBe(0);
    expect(result.records.length).toBe(0);
    expect(result.displayMessage).toBe('商談履歴がありません');
    expect(result.showTableHeader).toBe(true);
    expect(result.showPagination).toBe(false);
    expect(result.externalServiceCalled).toBe(false);
  });
});