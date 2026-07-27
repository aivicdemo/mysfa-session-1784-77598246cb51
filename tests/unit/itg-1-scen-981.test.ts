import { determineMigrationCompletion } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-981
  test('移行完了判定機能 - 全照合結果が合致かつ不整合件数が0の場合、移行完了と判定される', () => {
    const migration_id = 'MIG-2024-001';
    const reconciliation_timestamp = new Date('2024-04-30T10:00:00Z');
    
    const reconciliation_results = {
      customer_master_matched: true,
      product_master_matched: true,
      order_data_matched: true,
      invoice_data_matched: true,
      payment_data_matched: true,
    };
    
    const discrepancy_count = 0;
    
    const result = determineMigrationCompletion(
      migration_id,
      reconciliation_results,
      discrepancy_count,
      reconciliation_timestamp
    );
    
    expect(result.status).toBe('COMPLETED');
    expect(result.is_completed).toBe(true);
    expect(result.completion_timestamp).toEqual(new Date('2024-04-30T10:00:00Z'));
    expect(result.discrepancy_count).toBe(0);
  });
});