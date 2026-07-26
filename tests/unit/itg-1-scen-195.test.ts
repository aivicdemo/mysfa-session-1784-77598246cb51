import { filterActivityRecordsByTypes } from "../../src/logic/it-1";

describe("顧客レコード画面に過去の商談履歴・活動記録・課題解決状況を時系列で表示する機能", () => {
  // SCEN-195
  test("複数のアクティビティタイプを同時に選択した場合、いずれかのタイプに該当するすべての記録が表示される", () => {
    const activity_records = [
      {
        id: "act_001",
        type: "phone",
        description: "顧客との初期打ち合わせ",
        created_at: "2024-01-10T09:00:00Z",
      },
      {
        id: "act_002",
        type: "email",
        description: "提案資料送付",
        created_at: "2024-01-11T14:30:00Z",
      },
      {
        id: "act_003",
        type: "visit",
        description: "顧客訪問",
        created_at: "2024-01-12T10:15:00Z",
      },
      {
        id: "act_004",
        type: "phone",
        description: "フォローアップコール",
        created_at: "2024-01-13T11:45:00Z",
      },
      {
        id: "act_005",
        type: "memo",
        description: "内部メモ",
        created_at: "2024-01-14T16:20:00Z",
      },
      {
        id: "act_006",
        type: "email",
        description: "契約書確認",
        created_at: "2024-01-15T09:30:00Z",
      },
      {
        id: "act_007",
        type: "visit",
        description: "契約書署名立ち会い",
        created_at: "2024-01-16T13:00:00Z",
      },
    ];

    const selected_types = ["phone", "email", "visit"];

    const result = filterActivityRecordsByTypes(activity_records, selected_types);

    expect(result).toHaveLength(5);
    expect(result.map((r) => r.id)).toEqual([
      "act_001",
      "act_002",
      "act_003",
      "act_004",
      "act_006",
    ]);

    result.forEach((record) => {
      expect(selected_types).toContain(record.type);
    });

    const phone_records = result.filter((r) => r.type === "phone");
    expect(phone_records).toHaveLength(2);
    expect(phone_records.map((r) => r.id)).toEqual(["act_001", "act_004"]);

    const email_records = result.filter((r) => r.type === "email");
    expect(email_records).toHaveLength(2);
    expect(email_records.map((r) => r.id)).toEqual(["act_002", "act_006"]);

    const visit_records = result.filter((r) => r.type === "visit");
    expect(visit_records).toHaveLength(1);
    expect(visit_records.map((r) => r.id)).toEqual(["act_003"]);

    const memo_records = result.filter((r) => r.type === "memo");
    expect(memo_records).toHaveLength(0);

    const sorted_by_date = result.every(
      (record, index, arr) =>
        index === 0 ||
        new Date(arr[index - 1].created_at) >= new Date(record.created_at)
    );
    expect(sorted_by_date).toBe(true);

    const not_included_types = ["memo"];
    result.forEach((record) => {
      expect(not_included_types).not.toContain(record.type);
    });
  });
});