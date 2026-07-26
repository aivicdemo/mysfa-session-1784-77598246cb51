import { validateMigrationDataConsistency } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-231
  test('移行前後で顧客マスタのレコード数が一致する場合、データ整合性チェックが正常終了する', () => {
    const pre_migration_customer_count = 1000;
    const post_migration_customer_count = 1000;

    const result = validateMigrationDataConsistency({
      pre_migration_customer_count,
      post_migration_customer_count,
    });

    expect(result.status).toBe('成功');
    expect(result.message).toContain('データ整合性が確認されました');
    expect(result.errors).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
    expect(result.record_count_match).toBe(true);
  });
});