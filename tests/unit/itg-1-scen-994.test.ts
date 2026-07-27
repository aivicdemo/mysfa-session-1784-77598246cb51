import { verifyMigrationCompletion } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-994
  test('移行完了判定機能 - 同じ移行データで判定処理を2回実行した場合、両回の完了判定結果が一致する', () => {
    const migration_data = {
      customer_id: 'CUST-001',
      source_system: 'Salesforce',
      target_system: 'CustomSalesSystem',
      target_record_count: 1250
    };

    const first_result = verifyMigrationCompletion(migration_data);
    const first_status = first_result.completion_status;
    const first_error_info = first_result.error_info;
    const first_record_count = first_result.target_record_count;

    const second_result = verifyMigrationCompletion(migration_data);
    const second_status = second_result.completion_status;
    const second_error_info = second_result.error_info;
    const second_record_count = second_result.target_record_count;

    expect(first_status).toBe(second_status);
    expect(first_error_info).toEqual(second_error_info);
    expect(first_record_count).toBe(second_record_count);
  });
});