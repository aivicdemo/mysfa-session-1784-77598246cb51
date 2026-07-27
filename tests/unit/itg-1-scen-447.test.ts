import { fetchCustomerRecordsWithHistoryAndActivities } from "../../src/logic/it-1";

describe("顧客レコード画面の商談履歴・活動記録表示", () => {
  test("SCEN-447: 課題解決状況が複数件の顧客レコードを表示するとき、すべてのレコードが返される", async () => {
    // 前提: テスト環境の営業管理システムにログイン済み
    // 課題解決状況が複数の状態を持つ顧客レコード3件を作成
    const customer_a_id = "CUST_A_001";
    const customer_b_id = "CUST_B_001";
    const customer_c_id = "CUST_C_001";

    // 顧客A: 課題解決状況「解決中」
    const customer_a = {
      customer_id: customer_a_id,
      customer_name: "顧客A",
      issue_resolution_status: "IN_PROGRESS",
      deals: [
        {
          deal_id: "DEAL_A_001",
          deal_name: "商談A-1",
          status: "NEGOTIATING",
          amount: 500000,
        },
        {
          deal_id: "DEAL_A_002",
          deal_name: "商談A-2",
          status: "PROPOSAL",
          amount: 300000,
        },
      ],
      activities: [
        {
          activity_id: "ACT_A_001",
          activity_type: "EMAIL",
          description: "提案メール送信",
          timestamp: "2024-01-15T10:30:00Z",
        },
        {
          activity_id: "ACT_A_002",
          activity_type: "CALL",
          description: "顧客との電話打ち合わせ",
          timestamp: "2024-01-14T14:00:00Z",
        },
      ],
    };

    // 顧客B: 課題解決状況「保留中」
    const customer_b = {
      customer_id: customer_b_id,
      customer_name: "顧客B",
      issue_resolution_status: "PENDING",
      deals: [
        {
          deal_id: "DEAL_B_001",
          deal_name: "商談B-1",
          status: "INITIAL_CONTACT",
          amount: 150000,
        },
      ],
      activities: [
        {
          activity_id: "ACT_B_001",
          activity_type: "VISIT",
          description: "初回訪問",
          timestamp: "2024-01-13T09:00:00Z",
        },
      ],
    };

    // 顧客C: 課題解決状況「未対応」
    const customer_c = {
      customer_id: customer_c_id,
      customer_name: "顧客C",
      issue_resolution_status: "UNADDRESSED",
      deals: [
        {
          deal_id: "DEAL_C_001",
          deal_name: "商談C-1",
          status: "PROPOSAL",
          amount: 750000,
        },
        {
          deal_id: "DEAL_C_002",
          deal_name: "商談C-2",
          status: "NEGOTIATING",
          amount: 200000,
        },
        {
          deal_id: "DEAL_C_003",
          deal_name: "商談C-3",
          status: "INITIAL_CONTACT",
          amount: 100000,
        },
      ],
      activities: [
        {
          activity_id: "ACT_C_001",
          activity_type: "EMAIL",
          description: "初期接触メール",
          timestamp: "2024-01-12T11:00:00Z",
        },
        {
          activity_id: "ACT_C_002",
          activity_type: "EMAIL",
          description: "フォローアップメール",
          timestamp: "2024-01-11T15:30:00Z",
        },
      ],
    };

    // 手順: 顧客リスト画面から全体表示モードで検索・表示を実行
    // フィルタなしで全顧客レコードを取得
    const result = await fetchCustomerRecordsWithHistoryAndActivities({
      filter_by_issue_resolution_status: null,
      pagination_enabled: false,
      include_deal_history: true,
      include_activity_records: true,
      max_results_per_customer: 100,
    });

    // 期待結果: 作成した3件の顧客レコードがすべて返される
    const expected_customer_count = 3;
    expect(result.customers.length).toBe(expected_customer_count);

    // 顧客Aの検証: 商談2件、活動2件がすべて返される
    const returned_customer_a = result.customers.find(
      (c) => c.customer_id === customer_a_id
    );
    expect(returned_customer_a).toBeDefined();
    expect(returned_customer_a?.customer_name).toBe("顧客A");
    expect(returned_customer_a?.issue_resolution_status).toBe("IN_PROGRESS");
    expect(returned_customer_a?.deals.length).toBe(2);
    expect(returned_customer_a?.deals[0].deal_id).toBe("DEAL_A_001");
    expect(returned_customer_a?.deals[1].deal_id).toBe("DEAL_A_002");
    expect(returned_customer_a?.activities.length).toBe(2);
    expect(returned_customer_a?.activities[0].activity_type).toBe("EMAIL");
    expect(returned_customer_a?.activities[1].activity_type).toBe("CALL");

    // 顧客Bの検証: 商談1件、活動1件がすべて返される
    const returned_customer_b = result.customers.find(
      (c) => c.customer_id === customer_b_id
    );
    expect(returned_customer_b).toBeDefined();
    expect(returned_customer_b?.customer_name).toBe("顧客B");
    expect(returned_customer_b?.issue_resolution_status).toBe("PENDING");
    expect(returned_customer_b?.deals.length).toBe(1);
    expect(returned_customer_b?.deals[0].deal_id).toBe("DEAL_B_001");
    expect(returned_customer_b?.activities.length).toBe(1);
    expect(returned_customer_b?.activities[0].activity_type).toBe("VISIT");

    // 顧客Cの検証: 商談3件、活動2件がすべて返される
    const returned_customer_c = result.customers.find(
      (c) => c.customer_id === customer_c_id
    );
    expect(returned_customer_c).toBeDefined();
    expect(returned_customer_c?.customer_name).toBe("顧客C");
    expect(returned_customer_c?.issue_resolution_status).toBe("UNADDRESSED");
    expect(returned_customer_c?.deals.length).toBe(3);
    expect(returned_customer_c?.deals[0].deal_id).toBe("DEAL_C_001");
    expect(returned_customer_c?.deals[1].deal_id).toBe("DEAL_C_002");
    expect(returned_customer_c?.deals[2].deal_id).toBe("DEAL_C_003");
    expect(returned_customer_c?.activities.length).toBe(2);
    expect(returned_customer_c?.activities[0].activity_type).toBe("EMAIL");
    expect(returned_customer_c?.activities[1].activity_type).toBe("EMAIL");

    // ページネーション無効時に作成した顧客レコード数と表示数が完全に一致することを確認
    expect(result.customers.length).toBe(expected_customer_count);
    expect(result.total_count).toBe(expected_customer_count);
    expect(result.pagination_enabled).toBe(false);
  });
});