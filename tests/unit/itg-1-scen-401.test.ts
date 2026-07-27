import { fetchDealAndActivityRecordsTimeline } from '../../src/logic/it-1';

describe('顧客レコード画面に過去の商談履歴・活動記録・課題解決状況を時系列で表示する機能', () => {
  // SCEN-401
  test('同一の作成日時を持つ重複レコードが含まれるとき、すべてが返される', () => {
    const customer_id = 'CUST-001';
    const common_created_at = new Date('2024-01-15T10:30:45Z');

    const deal_and_activity_records = [
      {
        id: 'DEAL-001',
        customer_id: customer_id,
        type: 'deal',
        title: '商談A',
        amount: 500000,
        status: '提案中',
        created_at: common_created_at,
      },
      {
        id: 'DEAL-002',
        customer_id: customer_id,
        type: 'deal',
        title: '商談B',
        amount: 300000,
        status: '交渉中',
        created_at: common_created_at,
      },
      {
        id: 'ACT-001',
        customer_id: customer_id,
        type: 'activity',
        title: '商談C',
        activity_type: '訪問',
        description: '顧客訪問実施',
        created_at: common_created_at,
      },
    ];

    const result = fetchDealAndActivityRecordsTimeline(customer_id, deal_and_activity_records);

    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({
      id: 'DEAL-001',
      customer_id: customer_id,
      type: 'deal',
      title: '商談A',
      amount: 500000,
      status: '提案中',
      created_at: common_created_at,
    });
    expect(result[1]).toEqual({
      id: 'DEAL-002',
      customer_id: customer_id,
      type: 'deal',
      title: '商談B',
      amount: 300000,
      status: '交渉中',
      created_at: common_created_at,
    });
    expect(result[2]).toEqual({
      id: 'ACT-001',
      customer_id: customer_id,
      type: 'activity',
      title: '商談C',
      activity_type: '訪問',
      description: '顧客訪問実施',
      created_at: common_created_at,
    });
  });
});