import { displayCustomerHistoryTimeline } from '../../src/logic/it-1';

describe('顧客レコード画面の過去商談履歴・活動記録の時系列表示機能', () => {
  test('SCEN-398', () => {
    // Arrange: 顧客レコードに紐付く商談データを3件作成（異なる日時）
    const customer_id = 'CUST-001';
    const deal_1 = {
      deal_id: 'DEAL-001',
      customer_id: customer_id,
      deal_name: 'Deal A',
      amount: 100000,
      status: 'proposal',
      created_at: new Date('2024-01-10T10:00:00Z'),
    };
    const deal_2 = {
      deal_id: 'DEAL-002',
      customer_id: customer_id,
      deal_name: 'Deal B',
      amount: 150000,
      status: 'negotiation',
      created_at: new Date('2024-01-20T14:30:00Z'),
    };
    const deal_3 = {
      deal_id: 'DEAL-003',
      customer_id: customer_id,
      deal_name: 'Deal C',
      amount: 200000,
      status: 'won',
      created_at: new Date('2024-01-15T09:15:00Z'),
    };

    const deals = [deal_1, deal_2, deal_3];

    // 活動記録リポジトリのスタブ：該当顧客の活動記録が空（0件）を返す
    const activity_records_stub = {
      findByCustomerId: jest.fn().mockReturnValue([]),
    };

    // Act: 顧客レコードの過去商談履歴・活動記録を表示
    const result = displayCustomerHistoryTimeline(
      customer_id,
      deals,
      activity_records_stub
    );

    // Assert: 
    // 1. 商談のみが表示されること（活動記録は0件）
    expect(result.deals).toHaveLength(3);
    expect(result.activities).toHaveLength(0);

    // 2. 商談が最新順（降順）にソートされていること
    //    期待順序: 2024-01-20 → 2024-01-15 → 2024-01-10
    expect(result.deals[0].deal_id).toBe('DEAL-002'); // 2024-01-20
    expect(result.deals[1].deal_id).toBe('DEAL-003'); // 2024-01-15
    expect(result.deals[2].deal_id).toBe('DEAL-001'); // 2024-01-10

    // 3. 各商談の created_at が正しい順序であること
    expect(result.deals[0].created_at).toEqual(new Date('2024-01-20T14:30:00Z'));
    expect(result.deals[1].created_at).toEqual(new Date('2024-01-15T09:15:00Z'));
    expect(result.deals[2].created_at).toEqual(new Date('2024-01-10T10:00:00Z'));
  });
});