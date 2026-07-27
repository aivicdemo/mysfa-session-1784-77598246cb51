import { renderCustomerTimeline } from '../../src/logic/it-1';

describe('顧客レコード画面の過去商談履歴・活動記録の時系列表示', () => {
  test('SCEN-405: 活動記録の作成日時フィールドが欠けているとき、エラーが発生する', () => {
    const mockActivities = [
      {
        id: 'activity_001',
        type: 'email',
        description: 'Initial contact',
        createdAt: '2024-01-10T09:00:00Z',
      },
      {
        id: 'activity_002',
        type: 'phone',
        description: 'Follow-up call',
        createdAt: null,
      },
    ];

    const mockDeals = [
      {
        id: 'deal_001',
        customerId: 'customer_001',
        amount: 150000,
        status: 'proposed',
        createdAt: '2024-01-15T10:30:00Z',
      },
    ];

    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    const result = renderCustomerTimeline({
      customerId: 'customer_001',
      activities: mockActivities,
      deals: mockDeals,
    });

    expect(result.success).toBe(false);
    expect(result.errorMessage).toBe(
      '活動記録の日時情報が不正です。システム管理者に連絡してください'
    );
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringMatching(/Missing or invalid createdAt field in activity record/)
    );

    consoleErrorSpy.mockRestore();
  });
});