import { generateDocumentsOnDeal } from "../../src/logic/it-1784969823049-2-1-2";

describe("顧客向けポータル - 商談情報参照機能", () => {
  // SCEN-091
  test("見積・注文・請求書の自動生成機能 - 商談ステータス『成約』で顧客情報が欠落している場合、自動生成処理はエラーで中断される", () => {
    const deal_with_missing_customer_name = {
      deal_id: "DEAL-20240115-001",
      deal_status: "成約",
      customer_id: "CUST-001",
      customer_name: "",
      customer_address: "東京都渋谷区1-2-3",
      customer_phone: "03-1234-5678",
      deal_amount: 500000,
      deal_details: [
        {
          item_id: "ITEM-001",
          item_name: "システム開発サービス",
          unit_price: 250000,
          quantity: 2,
          line_total: 500000,
        },
      ],
    };

    expect(() => generateDocumentsOnDeal(deal_with_missing_customer_name)).toThrow(/顧客情報/);
  });

  test("見積・注文・請求書の自動生成機能 - 商談ステータス『成約』で顧客住所が欠落している場合、自動生成処理はエラーで中断される", () => {
    const deal_with_missing_customer_address = {
      deal_id: "DEAL-20240115-002",
      deal_status: "成約",
      customer_id: "CUST-002",
      customer_name: "テスト顧客株式会社",
      customer_address: "",
      customer_phone: "03-9876-5432",
      deal_amount: 300000,
      deal_details: [
        {
          item_id: "ITEM-002",
          item_name: "コンサルティングサービス",
          unit_price: 300000,
          quantity: 1,
          line_total: 300000,
        },
      ],
    };

    expect(() => generateDocumentsOnDeal(deal_with_missing_customer_address)).toThrow(/顧客情報/);
  });

  test("見積・注文・請求書の自動生成機能 - 商談ステータス『成約』で顧客電話番号が欠落している場合、自動生成処理はエラーで中断される", () => {
    const deal_with_missing_customer_phone = {
      deal_id: "DEAL-20240115-003",
      deal_status: "成約",
      customer_id: "CUST-003",
      customer_name: "顧客企業A",
      customer_address: "大阪府大阪市北区3-4-5",
      customer_phone: "",
      deal_amount: 750000,
      deal_details: [
        {
          item_id: "ITEM-003",
          item_name: "保守サービス",
          unit_price: 750000,
          quantity: 1,
          line_total: 750000,
        },
      ],
    };

    expect(() => generateDocumentsOnDeal(deal_with_missing_customer_phone)).toThrow(/顧客情報/);
  });

  test("見積・注文・請求書の自動生成機能 - 商談ステータス『成約』で複数の顧客情報が欠落している場合、自動生成処理はエラーで中断される", () => {
    const deal_with_multiple_missing_fields = {
      deal_id: "DEAL-20240115-004",
      deal_status: "成約",
      customer_id: "CUST-004",
      customer_name: "",
      customer_address: "",
      customer_phone: "",
      deal_amount: 1000000,
      deal_details: [
        {
          item_id: "ITEM-004",
          item_name: "統合サービス",
          unit_price: 500000,
          quantity: 2,
          line_total: 1000000,
        },
      ],
    };

    expect(() => generateDocumentsOnDeal(deal_with_multiple_missing_fields)).toThrow(/顧客情報/);
  });

  test("見積・注文・請求書の自動生成機能 - 商談ステータス『成約』で顧客情報がすべて完備されている場合、自動生成処理が成功する", () => {
    const deal_with_complete_customer_info = {
      deal_id: "DEAL-20240115-005",
      deal_status: "成約",
      customer_id: "CUST-005",
      customer_name: "完全顧客株式会社",
      customer_address: "京都府京都市中京区5-6-7",
      customer_phone: "075-2468-1357",
      deal_amount: 1200000,
      deal_details: [
        {
          item_id: "ITEM-005",
          item_name: "プレミアムパッケージ",
          unit_price: 600000,
          quantity: 2,
          line_total: 1200000,
        },
      ],
    };

    const result = generateDocumentsOnDeal(deal_with_complete_customer_info);

    expect(result).toHaveProperty("estimate_id");
    expect(result).toHaveProperty("order_id");
    expect(result).toHaveProperty("invoice_id");
    expect(result.estimate_id).toMatch(/^EST-/);
    expect(result.order_id).toMatch(/^ORD-/);
    expect(result.invoice_id).toMatch(/^INV-/);
    expect(result.deal_status_after_generation).toBe("成約");
    expect(result.documents_generated_count).toBe(3);
    expect(result.estimate_amount).toBe(1200000);
    expect(result.order_amount).toBe(1200000);
    expect(result.invoice_amount).toBe(1200000);
  });
});