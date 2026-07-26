import { refreshCustomerRecordCacheIfExpired } from '../../src/logic/it-1';

describe('顧客レコード画面に過去の商談履歴・活動記録・課題解決状況を時系列で表示する機能', () => {
  // SCEN-160
  test('キャッシュ自動更新機能 - 有効期限が厳密に0秒の境界値においてキャッシュ更新が正確に処理される', () => {
    const current_time = new Date('2024-04-15T10:30:00Z');
    const cache_expiry_time = new Date('2024-04-15T10:30:00Z');
    const customer_id = 'CUST-001';

    const cached_data = {
      customer_id,
      customer_name: 'OldCompanyName',
      deal_history: [
        {
          deal_id: 'DEAL-001',
          status: 'closed',
          amount: 100000,
          created_at: '2024-03-01T09:00:00Z'
        }
      ],
      activity_records: [
        {
          activity_id: 'ACT-001',
          activity_type: 'email',
          recorded_at: '2024-03-15T14:30:00Z'
        }
      ],
      cache_created_at: '2024-04-15T09:30:00Z',
      cache_expires_at: cache_expiry_time.toISOString()
    };

    const fresh_data = {
      customer_id,
      customer_name: 'UpdatedCompanyName',
      deal_history: [
        {
          deal_id: 'DEAL-001',
          status: 'closed',
          amount: 100000,
          created_at: '2024-03-01T09:00:00Z'
        },
        {
          deal_id: 'DEAL-002',
          status: 'proposal',
          amount: 250000,
          created_at: '2024-04-10T11:00:00Z'
        }
      ],
      activity_records: [
        {
          activity_id: 'ACT-001',
          activity_type: 'email',
          recorded_at: '2024-03-15T14:30:00Z'
        },
        {
          activity_id: 'ACT-002',
          activity_type: 'visit',
          recorded_at: '2024-04-14T15:45:00Z'
        }
      ],
      issue_resolutions: [
        {
          issue_id: 'ISSUE-001',
          resolution_status: 'resolved',
          resolved_at: '2024-04-12T10:00:00Z'
        }
      ]
    };

    const result = refreshCustomerRecordCacheIfExpired({
      customer_id,
      current_time,
      cached_data,
      fresh_data
    });

    expect(result.cache_was_expired).toBe(true);
    expect(result.cache_was_refreshed).toBe(true);
    expect(result.refreshed_data.customer_name).toBe('UpdatedCompanyName');
    expect(result.refreshed_data.deal_history).toHaveLength(2);
    expect(result.refreshed_data.deal_history[1].deal_id).toBe('DEAL-002');
    expect(result.refreshed_data.deal_history[1].amount).toBe(250000);
    expect(result.refreshed_data.activity_records).toHaveLength(2);
    expect(result.refreshed_data.activity_records[1].activity_id).toBe('ACT-002');
    expect(result.refreshed_data.activity_records[1].activity_type).toBe('visit');
    expect(result.refreshed_data.issue_resolutions).toHaveLength(1);
    expect(result.refreshed_data.issue_resolutions[0].issue_id).toBe('ISSUE-001');
    expect(result.refreshed_data.issue_resolutions[0].resolution_status).toBe('resolved');
    expect(result.cache_update_timestamp).toBe('2024-04-15T10:30:00Z');
    expect(result.error_message).toBeUndefined();
    expect(result.data_consistency_verified).toBe(true);
  });
});