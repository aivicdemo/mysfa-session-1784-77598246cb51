import { detectUnbilledDeals } from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  // SCEN-556
  test("商談入力データの順序が逆でも同じ『未請求案件』リストが返される", () => {
    // テストデータの準備：同じ3件の商談を2つの異なる順序で定義
    const orderA_deals = [
      {
        deal_id: "DEAL001",
        status: "クローズ受注",
        invoice_id: null,
        invoice_issued_date: null,
      },
      {
        deal_id: "DEAL002",
        status: "クローズ受注",
        invoice_id: "INV002",
        invoice_issued_date: "2024-01-15",
      },
      {
        deal_id: "DEAL003",
        status: "クローズ受注",
        invoice_id: null,
        invoice_issued_date: null,
      },
    ];

    const orderB_deals = [
      {
        deal_id: "DEAL003",
        status: "クローズ受注",
        invoice_id: null,
        invoice_issued_date: null,
      },
      {
        deal_id: "DEAL001",
        status: "クローズ受注",
        invoice_id: null,
        invoice_issued_date: null,
      },
      {
        deal_id: "DEAL002",
        status: "クローズ受注",
        invoice_id: "INV002",
        invoice_issued_date: "2024-01-15",
      },
    ];

    // 順序Aでロジックを呼び出し、未請求案件リストを取得
    const list1 = detectUnbilledDeals(orderA_deals);

    // 順序Bでロジックを呼び出し、未請求案件リストを取得
    const list2 = detectUnbilledDeals(orderB_deals);

    // リスト1の商談IDを集合で抽出
    const list1_deal_ids = new Set(list1.map((item) => item.deal_id));

    // リスト2の商談IDを集合で抽出
    const list2_deal_ids = new Set(list2.map((item) => item.deal_id));

    // 商談ID集合が完全に一致することを検証
    expect(list1_deal_ids).toEqual(list2_deal_ids);

    // 期待される未請求案件：DEAL001とDEAL003（請求書が未発行）
    expect(list1_deal_ids.has("DEAL001")).toBe(true);
    expect(list1_deal_ids.has("DEAL003")).toBe(true);
    expect(list1_deal_ids.has("DEAL002")).toBe(false);

    // リスト1内の各商談について、ステータスが『クローズ受注』で請求書が未発行であることを検証
    list1.forEach((item) => {
      expect(item.status).toBe("クローズ受注");
      expect(item.invoice_id).toBeNull();
      expect(item.invoice_issued_date).toBeNull();
    });

    // リスト2内の各商談についても同様に検証
    list2.forEach((item) => {
      expect(item.status).toBe("クローズ受注");
      expect(item.invoice_id).toBeNull();
      expect(item.invoice_issued_date).toBeNull();
    });

    // 返されたリストのサイズが両者で同じことを検証
    expect(list1.length).toBe(list2.length);
    expect(list1.length).toBe(2);
  });
});