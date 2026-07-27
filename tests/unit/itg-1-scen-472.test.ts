import { fetchCustomerActivityRecords } from '../../src/logic/it-1';

describe('顧客レコード画面の商談履歴・活動記録表示', () => {
  // SCEN-472
  test('月初日の活動記録が含まれているとき、正しく返される', () => {
    const customer_id = 'CUST_001';
    const activity_on_month_start = {
      activity_id: 'ACT_001',
      customer_id: customer_id,
      activity_date: new Date('2024-01-01T09:00:00Z'),
      activity_type: 'email',
      description: 'Initial contact on month start',
    };
    const activity_on_day_5 = {
      activity_id: 'ACT_002',
      customer_id: customer_id,
      activity_date: new Date('2024-01-05T14:30:00Z'),
      activity_type: 'phone',
      description: 'Follow-up call',
    };
    const activity_on_day_15 = {
      activity_id: 'ACT_003',
      customer_id: customer_id,
      activity_date: new Date('2024-01-15T10:15:00Z'),
      activity_type: 'visit',
      description: 'Site visit',
    };

    const input_activities = [
      activity_on_day_15,
      activity_on_month_start,
      activity_on_day_5,
    ];

    const result = fetchCustomerActivityRecords(customer_id, input_activities);

    expect(result).toHaveLength(3);
    expect(result[0].activity_id).toBe('ACT_001');
    expect(result[0].activity_date).toEqual(new Date('2024-01-01T09:00:00Z'));
    expect(result[1].activity_id).toBe('ACT_002');
    expect(result[1].activity_date).toEqual(new Date('2024-01-05T14:30:00Z'));
    expect(result[2].activity_id).toBe('ACT_003');
    expect(result[2].activity_date).toEqual(new Date('2024-01-15T10:15:00Z'));
  });
});