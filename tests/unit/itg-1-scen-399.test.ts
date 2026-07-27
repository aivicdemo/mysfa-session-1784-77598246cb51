import { fetchDealAndActivityHistory } from "../../src/logic/it-1";

describe("顧客レコード画面の過去商談履歴・活動記録の時系列表示", () => {
  test("SCEN-399: 同一作成日時の商談と活動記録で相対順序が保持される", () => {
    // テストデータセットアップ
    const shared_created_at = new Date("2024-01-15T14:30:00Z");

    const deal_a = {
      id: "DEAL_A",
      customer_id: "CUST_001",
      type: "deal",
      title: "商談A",
      created_at: shared_created_at,
      created_at_unix: shared_created_at.getTime(),
      sequence: 1,
    };

    const activity_x = {
      id: "ACT_X",
      customer_id: "CUST_001",
      type: "activity",
      title: "活動記録X",
      created_at: shared_created_at,
      created_at_unix: shared_created_at.getTime(),
      sequence: 2,
    };

    const deal_b = {
      id: "DEAL_B",
      customer_id: "CUST_001",
      type: "deal",
      title: "商談B",
      created_at: shared_created_at,
      created_at_unix: shared_created_at.getTime(),
      sequence: 3,
    };

    const activity_y = {
      id: "ACT_Y",
      customer_id: "CUST_001",
      type: "activity",
      title: "活動記録Y",
      created_at: shared_created_at,
      created_at_unix: shared_created_at.getTime(),
      sequence: 4,
    };

    const deal_c = {
      id: "DEAL_C",
      customer_id: "CUST_001",
      type: "deal",
      title: "商談C",
      created_at: shared_created_at,
      created_at_unix: shared_created_at.getTime(),
      sequence: 5,
    };

    // 登録順序通りのテストデータ配列
    const input_records = [deal_a, activity_x, deal_b, activity_y, deal_c];

    // 関数実行
    const result = fetchDealAndActivityHistory(
      "CUST_001",
      input_records,
      100,
      shared_created_at
    );

    // 期待結果: 作成日時の降順、同一日時内では登録順序が保持される
    // この場合、全て同一日時なので登録順序が最新順（逆順）で表示される
    expect(result.length).toBe(5);

    // 表示順序を確認：最新の登録順から逆順で表示される
    expect(result[0].id).toBe("DEAL_C");
    expect(result[0].sequence).toBe(5);

    expect(result[1].id).toBe("ACT_Y");
    expect(result[1].sequence).toBe(4);

    expect(result[2].id).toBe("DEAL_B");
    expect(result[2].sequence).toBe(3);

    expect(result[3].id).toBe("ACT_X");
    expect(result[3].sequence).toBe(2);

    expect(result[4].id).toBe("DEAL_A");
    expect(result[4].sequence).toBe(1);

    // 相対順序の完全一致を確認：登録時の相対順序が保持されている
    for (let i = 0; i < result.length; i++) {
      const expected_sequence = 5 - i;
      expect(result[i].sequence).toBe(expected_sequence);
    }
  });
});