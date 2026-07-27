import { extractActivitiesWithDuplicateRemoval } from "../../src/logic/it-1";

describe("顧客レコード画面に過去の商談履歴・活動記録・課題解決状況を時系列で表示する機能", () => {
  // SCEN-122
  test("月次報告期限・データ抽出処理 - 抽出対象期間内に同一の活動レコードが重複している場合、重複を排除して返される", () => {
    // Arrange: テスト用データセットアップ
    const extraction_start_date = new Date("2024-01-01T00:00:00Z");
    const extraction_end_date = new Date("2024-01-31T23:59:59Z");

    const salesforce_user_id = "USR_001";
    const customer_id = "CUST_001";
    const activity_type = "EMAIL";
    const activity_datetime = new Date("2024-01-15T10:30:00Z");
    const activity_subject = "Follow-up on proposal";
    const activity_description = "Customer confirmed interest in product A";

    // 同一の活動内容を示す重複レコードを3件作成
    const duplicate_activity_record_1 = {
      activity_id: "ACT_001",
      salesforce_user_id: salesforce_user_id,
      customer_id: customer_id,
      activity_type: activity_type,
      activity_datetime: activity_datetime,
      activity_subject: activity_subject,
      activity_description: activity_description,
      created_at: new Date("2024-01-15T10:30:00Z"),
    };

    const duplicate_activity_record_2 = {
      activity_id: "ACT_002",
      salesforce_user_id: salesforce_user_id,
      customer_id: customer_id,
      activity_type: activity_type,
      activity_datetime: activity_datetime,
      activity_subject: activity_subject,
      activity_description: activity_description,
      created_at: new Date("2024-01-15T10:30:01Z"),
    };

    const duplicate_activity_record_3 = {
      activity_id: "ACT_003",
      salesforce_user_id: salesforce_user_id,
      customer_id: customer_id,
      activity_type: activity_type,
      activity_datetime: activity_datetime,
      activity_subject: activity_subject,
      activity_description: activity_description,
      created_at: new Date("2024-01-15T10:30:02Z"),
    };

    // 期間内のその他の異なる活動レコード
    const unique_activity_record = {
      activity_id: "ACT_004",
      salesforce_user_id: salesforce_user_id,
      customer_id: customer_id,
      activity_type: "PHONE",
      activity_datetime: new Date("2024-01-20T14:15:00Z"),
      activity_subject: "Product demo call",
      activity_description: "Demonstrated key features to stakeholder",
      created_at: new Date("2024-01-20T14:15:00Z"),
    };

    const input_activities = [
      duplicate_activity_record_1,
      duplicate_activity_record_2,
      duplicate_activity_record_3,
      unique_activity_record,
    ];

    // Act: データ抽出処理を実行
    const result = extractActivitiesWithDuplicateRemoval(
      input_activities,
      extraction_start_date,
      extraction_end_date
    );

    // Assert: 抽出結果を検証
    // 重複していた3件が1件にまとめられ、異なる活動レコードは保持される
    // 期待結果: 活動レコード総数は2件（重複排除後）
    expect(result.length).toBe(2);

    // 排除されたレコードの重要情報が保持されていることを確認
    const deduped_email_activity = result.find(
      (record) => record.activity_type === "EMAIL"
    );
    expect(deduped_email_activity).toBeDefined();
    expect(deduped_email_activity?.salesforce_user_id).toBe(salesforce_user_id);
    expect(deduped_email_activity?.customer_id).toBe(customer_id);
    expect(deduped_email_activity?.activity_type).toBe(activity_type);
    expect(deduped_email_activity?.activity_datetime).toEqual(
      activity_datetime
    );
    expect(deduped_email_activity?.activity_subject).toBe(activity_subject);
    expect(deduped_email_activity?.activity_description).toBe(
      activity_description
    );

    // 異なる活動レコードが保持されていることを確認
    const unique_activity = result.find((record) => record.activity_type === "PHONE");
    expect(unique_activity).toBeDefined();
    expect(unique_activity?.activity_id).toBe("ACT_004");
    expect(unique_activity?.activity_subject).toBe("Product demo call");
    expect(unique_activity?.activity_datetime).toEqual(
      new Date("2024-01-20T14:15:00Z")
    );
  });
});