import { validateDataConsistency, confirmMigrationCompletion } from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  // SCEN-309
  test("移行後データ一貫性検証機能 - 移行前後で不整合データが検出された場合、是正前に完了判定が下されない", () => {
    const migration_pre_customer_count = 150;
    const migration_post_customer_count = 145;
    const migration_pre_total_amount = 10000000;
    const migration_post_total_amount = 9999500;
    const migration_pre_transaction_count = 320;
    const migration_post_transaction_count = 318;

    const test_dataset = {
      pre_migration: {
        customer_count: migration_pre_customer_count,
        total_sales_amount: migration_pre_total_amount,
        transaction_count: migration_pre_transaction_count,
        target_period_start: "2024-04-01",
        target_period_end: "2024-04-30",
      },
      post_migration: {
        customer_count: migration_post_customer_count,
        total_sales_amount: migration_post_total_amount,
        transaction_count: migration_post_transaction_count,
        target_period_start: "2024-04-01",
        target_period_end: "2024-04-30",
      },
    };

    const validation_result = validateDataConsistency(test_dataset);

    expect(validation_result.is_consistent).toBe(false);
    expect(validation_result.discrepancies.length).toBeGreaterThan(0);
    expect(validation_result.discrepancies).toContainEqual({
      category: "customer_count",
      pre_value: migration_pre_customer_count,
      post_value: migration_post_customer_count,
      difference: migration_pre_customer_count - migration_post_customer_count,
    });
    expect(validation_result.discrepancies).toContainEqual({
      category: "total_sales_amount",
      pre_value: migration_pre_total_amount,
      post_value: migration_post_total_amount,
      difference: migration_pre_total_amount - migration_post_total_amount,
    });
    expect(validation_result.discrepancies).toContainEqual({
      category: "transaction_count",
      pre_value: migration_pre_transaction_count,
      post_value: migration_post_transaction_count,
      difference: migration_pre_transaction_count - migration_post_transaction_count,
    });

    const completion_attempt_with_inconsistency = () => {
      confirmMigrationCompletion({
        validation_result: validation_result,
        is_correction_applied: false,
      });
    };

    expect(completion_attempt_with_inconsistency).toThrow(/不整合データ/);

    const corrected_dataset = {
      pre_migration: test_dataset.pre_migration,
      post_migration: {
        customer_count: migration_pre_customer_count,
        total_sales_amount: migration_pre_total_amount,
        transaction_count: migration_pre_transaction_count,
        target_period_start: "2024-04-01",
        target_period_end: "2024-04-30",
      },
    };

    const corrected_validation_result = validateDataConsistency(corrected_dataset);

    expect(corrected_validation_result.is_consistent).toBe(true);
    expect(corrected_validation_result.discrepancies.length).toBe(0);

    const completion_result = confirmMigrationCompletion({
      validation_result: corrected_validation_result,
      is_correction_applied: true,
    });

    expect(completion_result.migration_status).toBe("completed");
    expect(completion_result.completion_timestamp).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/
    );
    expect(completion_result.data_validation_passed).toBe(true);
  });
});