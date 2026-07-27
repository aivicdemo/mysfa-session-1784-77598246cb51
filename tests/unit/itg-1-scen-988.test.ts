import { validateMigrationCompletion } from "../../src/logic/it-1-3";

describe("売上実績・請求状況のリアルタイム集計・レポート生成", () => {
  test("SCEN-988: 移行完了判定機能 - 移行前Salesforceから移行後システムへのレコード引継件数が1件不足の場合、件数不整合として検出される", async () => {
    const salesforce_record_count_before = 100;
    const system_record_count_after = 99;
    const expected_missing_count = 1;

    const mockSalesforceDataSource = {
      fetchLicenseUsers: jest.fn().mockResolvedValue(
        Array.from({ length: salesforce_record_count_before }, (_, i) => ({
          id: `user_${i + 1}`,
          username: `user${i + 1}@example.com`,
          license_edition: "Enterprise",
        }))
      ),
    };

    const mockSystemDatabase = {
      getMigratedRecordsCount: jest
        .fn()
        .mockResolvedValue(system_record_count_after),
      getLatestMigrationLog: jest.fn().mockResolvedValue(null),
    };

    const result = await validateMigrationCompletion(
      mockSalesforceDataSource,
      mockSystemDatabase
    );

    expect(mockSalesforceDataSource.fetchLicenseUsers).toHaveBeenCalled();
    expect(mockSystemDatabase.getMigratedRecordsCount).toHaveBeenCalled();

    expect(result.status).toBe("migration_failed");
    expect(result.reason).toBe("record_count_mismatch");
    expect(result.record_count_before).toBe(100);
    expect(result.record_count_after).toBe(99);
    expect(result.missing_count).toBe(1);
    expect(result.display_message).toBe(
      "移行レコード件数が一致しません。不足件数：1件。詳細は管理者ログを確認してください"
    );
    expect(result.internal_log_message).toBe(
      "RecordCountMismatchException: Expected 100 records, but found 99 records"
    );
  });
});