import { fetchCustomerActivityRecords } from '../../src/logic/it-1';

describe('顧客レコード画面の商談履歴・活動記録表示', () => {
  test('SCEN-455: 活動記録に同じ日時の重複レコードが含まれているとき、両方が返される', async () => {
    const customer_id = 'CUST-001';
    const duplicate_timestamp = '2024-01-15T10:30:00Z';

    const mock_activity_data_source = {
      getActivityRecords: jest.fn().mockResolvedValue([
        {
          activity_id: 'ACT-001',
          customer_id: customer_id,
          activity_type: 'email',
          activity_datetime: duplicate_timestamp,
          created_by: 'USER-001',
          description: 'First duplicate email activity'
        },
        {
          activity_id: 'ACT-002',
          customer_id: customer_id,
          activity_type: 'email',
          activity_datetime: duplicate_timestamp,
          created_by: 'USER-002',
          description: 'Second duplicate email activity'
        }
      ])
    };

    const result = await fetchCustomerActivityRecords(
      customer_id,
      mock_activity_data_source
    );

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      activity_id: 'ACT-001',
      customer_id: customer_id,
      activity_type: 'email',
      activity_datetime: duplicate_timestamp,
      created_by: 'USER-001',
      description: 'First duplicate email activity'
    });
    expect(result[1]).toEqual({
      activity_id: 'ACT-002',
      customer_id: customer_id,
      activity_type: 'email',
      activity_datetime: duplicate_timestamp,
      created_by: 'USER-002',
      description: 'Second duplicate email activity'
    });
    expect(result[0].activity_id).toBe('ACT-001');
    expect(result[1].activity_id).toBe('ACT-002');
    expect(result[0].created_by).toBe('USER-001');
    expect(result[1].created_by).toBe('USER-002');
  });
});