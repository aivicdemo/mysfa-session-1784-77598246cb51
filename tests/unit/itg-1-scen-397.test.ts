import { fetchCustomerActivityRecords } from '../../src/logic/it-1';

describe('顧客レコード画面の過去商談履歴・活動記録の時系列表示機能', () => {
  test('SCEN-397: 商談データが空のとき、活動記録のみが最新順にソートされて返される', () => {
    const customerId = 'CUST-001';

    const mockActivityRecords = [
      {
        id: 'ACT-001',
        customerId: customerId,
        type: 'phone',
        datetime: '2024-01-10T14:30:00Z',
        description: '顧客Aへ電話確認',
      },
      {
        id: 'ACT-002',
        customerId: customerId,
        type: 'email',
        datetime: '2024-01-15T09:00:00Z',
        description: '提案資料をメール送付',
      },
      {
        id: 'ACT-003',
        customerId: customerId,
        type: 'visit',
        datetime: '2024-01-12T11:00:00Z',
        description: 'オフィス訪問ヒアリング',
      },
    ];

    const result = fetchCustomerActivityRecords(customerId, mockActivityRecords);

    expect(result).toEqual([
      {
        id: 'ACT-002',
        customerId: customerId,
        type: 'email',
        datetime: '2024-01-15T09:00:00Z',
        description: '提案資料をメール送付',
      },
      {
        id: 'ACT-003',
        customerId: customerId,
        type: 'visit',
        datetime: '2024-01-12T11:00:00Z',
        description: 'オフィス訪問ヒアリング',
      },
      {
        id: 'ACT-001',
        customerId: customerId,
        type: 'phone',
        datetime: '2024-01-10T14:30:00Z',
        description: '顧客Aへ電話確認',
      },
    ]);

    expect(result.length).toBe(3);
    expect(result[0].datetime).toBe('2024-01-15T09:00:00Z');
    expect(result[1].datetime).toBe('2024-01-12T11:00:00Z');
    expect(result[2].datetime).toBe('2024-01-10T14:30:00Z');
  });
});