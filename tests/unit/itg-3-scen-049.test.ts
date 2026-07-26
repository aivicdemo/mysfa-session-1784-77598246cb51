import { assessMigrationReadiness } from "../../src/logic/it-1-br-1784969812908-1-1-1";

describe("Salesforce ライセンス利用状況の可視化機能（導入研修・運用マニュアル整備完了判定）", () => {
  // SCEN-049
  test("研修実施率・マニュアル理解度・操作習熟度がすべて基準以上のとき、移行準備完了と判定される", () => {
    // 入力: 研修実施率 80%, マニュアル理解度 80%, 操作習熟度 80%
    // いずれも基準値（80%）以上を満たす
    const training_completion_rate = 80;
    const manual_comprehension_level = 80;
    const system_operation_proficiency = 80;

    const result = assessMigrationReadiness({
      training_completion_rate,
      manual_comprehension_level,
      system_operation_proficiency,
    });

    // 期待値: 移行準備完了判定が true で返される
    expect(result.is_migration_ready).toBe(true);
    expect(result.status).toBe("complete");
    expect(result.status_badge_color).toBe("green");

    // 研修実施率が基準値より高い場合（90%）
    const result_high_training = assessMigrationReadiness({
      training_completion_rate: 90,
      manual_comprehension_level: 80,
      system_operation_proficiency: 80,
    });

    expect(result_high_training.is_migration_ready).toBe(true);
    expect(result_high_training.status).toBe("complete");

    // マニュアル理解度が基準値より高い場合（85%）
    const result_high_manual = assessMigrationReadiness({
      training_completion_rate: 80,
      manual_comprehension_level: 85,
      system_operation_proficiency: 80,
    });

    expect(result_high_manual.is_migration_ready).toBe(true);
    expect(result_high_manual.status).toBe("complete");

    // 操作習熟度が基準値より高い場合（95%）
    const result_high_proficiency = assessMigrationReadiness({
      training_completion_rate: 80,
      manual_comprehension_level: 80,
      system_operation_proficiency: 95,
    });

    expect(result_high_proficiency.is_migration_ready).toBe(true);
    expect(result_high_proficiency.status).toBe("complete");

    // すべての指標が基準値より高い場合（85%, 90%, 88%）
    const result_all_high = assessMigrationReadiness({
      training_completion_rate: 85,
      manual_comprehension_level: 90,
      system_operation_proficiency: 88,
    });

    expect(result_all_high.is_migration_ready).toBe(true);
    expect(result_all_high.status).toBe("complete");
    expect(result_all_high.status_badge_color).toBe("green");

    // 研修実施率が基準値未満の場合（79%）- 移行準備未完了
    const result_low_training = assessMigrationReadiness({
      training_completion_rate: 79,
      manual_comprehension_level: 80,
      system_operation_proficiency: 80,
    });

    expect(result_low_training.is_migration_ready).toBe(false);
    expect(result_low_training.status).toBe("incomplete");
    expect(result_low_training.status_badge_color).toBe("red");

    // マニュアル理解度が基準値未満の場合（75%）- 移行準備未完了
    const result_low_manual = assessMigrationReadiness({
      training_completion_rate: 80,
      manual_comprehension_level: 75,
      system_operation_proficiency: 80,
    });

    expect(result_low_manual.is_migration_ready).toBe(false);
    expect(result_low_manual.status).toBe("incomplete");

    // 操作習熟度が基準値未満の場合（70%）- 移行準備未完了
    const result_low_proficiency = assessMigrationReadiness({
      training_completion_rate: 80,
      manual_comprehension_level: 80,
      system_operation_proficiency: 70,
    });

    expect(result_low_proficiency.is_migration_ready).toBe(false);
    expect(result_low_proficiency.status).toBe("incomplete");

    // 複数の指標が基準値未満の場合（75%, 78%, 82%）- 移行準備未完了
    const result_multiple_low = assessMigrationReadiness({
      training_completion_rate: 75,
      manual_comprehension_level: 78,
      system_operation_proficiency: 82,
    });

    expect(result_multiple_low.is_migration_ready).toBe(false);
    expect(result_multiple_low.status).toBe("incomplete");
    expect(result_multiple_low.status_badge_color).toBe("red");

    // すべての指標が基準値未満の場合（50%, 60%, 70%）- 移行準備未完了
    const result_all_low = assessMigrationReadiness({
      training_completion_rate: 50,
      manual_comprehension_level: 60,
      system_operation_proficiency: 70,
    });

    expect(result_all_low.is_migration_ready).toBe(false);
    expect(result_all_low.status).toBe("incomplete");
    expect(result_all_low.status_badge_color).toBe("red");
  });
});