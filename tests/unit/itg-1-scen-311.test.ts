import { validateMigrationDataConsistency } from "../../src/logic/it-1-3";

describe("売上実績・請求状況のリアルタイム集計・レポート生成", () => {
  test("SCEN-311: [edge] 移行後データ一貫性検証機能 - 不整合データ件数がゼロの境界値で、移行完了判定基準を満たしたと判定される", () => {
    // テストデータ: 移行前後で完全に一致したレコード1000件
    const pre_migration_records = Array.from({ length: 1000 }, (_, idx) => ({
      record_id: `pre_${idx + 1}`,
      customer_id: `cust_${(idx % 10) + 1}`,
      deal_id: `deal_${(idx % 50) + 1}`,
      amount: 100000 + idx * 100,
      status: idx % 3 === 0 ? "受注" : idx % 3 === 1 ? "完了" : "提案中",
      created_at: new Date("2024-01-01T00:00:00Z").toISOString(),
      updated_at: new Date("2024-01-15T11:00:00Z").toISOString(),
    }));

    const post_migration_records = Array.from({ length: 1000 }, (_, idx) => ({
      record_id: `post_${idx + 1}`,
      customer_id: `cust_${(idx % 10) + 1}`,
      deal_id: `deal_${(idx % 50) + 1}`,
      amount: 100000 + idx * 100,
      status: idx % 3 === 0 ? "受注" : idx % 3 === 1 ? "完了" : "提案中",
      created_at: new Date("2024-01-01T00:00:00Z").toISOString(),
      updated_at: new Date("2024-01-15T11:00:00Z").toISOString(),
    }));

    const validation_criteria = {
      max_inconsistency_count: 0,
      required_fields: [
        "customer_id",
        "deal_id",
        "amount",
        "status",
        "created_at",
      ],
      field_match_threshold: 1.0,
    };

    const result = validateMigrationDataConsistency({
      pre_migration_data: pre_migration_records,
      post_migration_data: post_migration_records,
      validation_criteria,
    });

    // 不整合データ件数がゼロであることを検証
    expect(result.inconsistency_count).toBe(0);

    // 移行完了判定基準を満たしていることを検証
    expect(result.meets_completion_criteria).toBe(true);

    // 移行ステータスが『移行完了』であることを検証
    expect(result.migration_status).toBe("移行完了");

    // 一貫性メッセージが正しく出力されることを検証
    expect(result.consistency_message).toBe(
      "すべてのデータが一貫性を保っています"
    );

    // レポート内の詳細情報を検証
    expect(result.report.total_records_checked).toBe(1000);
    expect(result.report.matching_records_count).toBe(1000);
    expect(result.report.field_consistency_rate).toBe(100);
    expect(result.report.validation_timestamp).toBeDefined();
    expect(result.report.validation_timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);

    // 移行プロセスが正常に完了したと認識されることを検証
    expect(result.process_completion_flag).toBe(true);
    expect(result.admin_notification_required).toBe(false);
  });
});