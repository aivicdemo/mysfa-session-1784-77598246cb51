import { updateDealStatusToContracted } from "../../src/logic/it-1784969823049-2-1-1";

describe("商談レコードの進捗ステータスと提案内容の入力・保存機能", () => {
  // SCEN-125
  test("必須項目が全て入力された商談を『成約』に更新でき、請求データが自動紐付けされる", () => {
    const deal_input = {
      deal_id: "DEAL-001",
      deal_name: "A社システム導入プロジェクト",
      customer_id: "CUST-123",
      customer_name: "A社",
      amount: 5000000,
      due_date: "2024-06-30",
      status: "提案中",
      details: [
        {
          line_id: 1,
          product_name: "システムライセンス",
          quantity: 10,
          unit_price: 300000,
          subtotal: 3000000,
        },
        {
          line_id: 2,
          product_name: "導入支援サービス",
          quantity: 1,
          unit_price: 2000000,
          subtotal: 2000000,
        },
      ],
    };

    const result = updateDealStatusToContracted(deal_input);

    expect(result.deal_id).toBe("DEAL-001");
    expect(result.deal_name).toBe("A社システム導入プロジェクト");
    expect(result.customer_id).toBe("CUST-123");
    expect(result.customer_name).toBe("A社");
    expect(result.new_status).toBe("成約");
    expect(result.previous_status).toBe("提案中");
    expect(result.status_updated_at).toBeDefined();
    expect(typeof result.status_updated_at).toBe("string");

    expect(result.invoice_auto_generated).toBe(true);
    expect(result.invoice_id).toBeDefined();
    expect(result.invoice_amount).toBe(5000000);
    expect(result.invoice_customer_id).toBe("CUST-123");
    expect(result.invoice_details).toHaveLength(2);
    expect(result.invoice_details[0]).toEqual({
      line_id: 1,
      product_name: "システムライセンス",
      quantity: 10,
      unit_price: 300000,
      subtotal: 3000000,
    });
    expect(result.invoice_details[1]).toEqual({
      line_id: 2,
      product_name: "導入支援サービス",
      quantity: 1,
      unit_price: 2000000,
      subtotal: 2000000,
    });

    expect(result.invoice_linked).toBe(true);
    expect(result.validation_passed).toBe(true);
  });

  test("必須項目が不足している場合はエラーを投げる", () => {
    const deal_input_missing_name = {
      deal_id: "DEAL-002",
      deal_name: "",
      customer_id: "CUST-124",
      customer_name: "B社",
      amount: 3000000,
      due_date: "2024-07-15",
      status: "提案中",
      details: [],
    };

    expect(() => updateDealStatusToContracted(deal_input_missing_name)).toThrow(
      /商談名/
    );
  });

  test("顧客名が空の場合はエラーを投げる", () => {
    const deal_input_missing_customer = {
      deal_id: "DEAL-003",
      deal_name: "C社プロジェクト",
      customer_id: "CUST-125",
      customer_name: "",
      amount: 2000000,
      due_date: "2024-08-01",
      status: "提案中",
      details: [],
    };

    expect(() => updateDealStatusToContracted(deal_input_missing_customer)).toThrow(
      /顧客名/
    );
  });

  test("金額が0以下の場合はエラーを投げる", () => {
    const deal_input_invalid_amount = {
      deal_id: "DEAL-004",
      deal_name: "D社プロジェクト",
      customer_id: "CUST-126",
      customer_name: "D社",
      amount: 0,
      due_date: "2024-09-01",
      status: "提案中",
      details: [],
    };

    expect(() => updateDealStatusToContracted(deal_input_invalid_amount)).toThrow(
      /金額/
    );
  });

  test("期日が空の場合はエラーを投げる", () => {
    const deal_input_missing_due_date = {
      deal_id: "DEAL-005",
      deal_name: "E社プロジェクト",
      customer_id: "CUST-127",
      customer_name: "E社",
      amount: 1500000,
      due_date: "",
      status: "提案中",
      details: [],
    };

    expect(() => updateDealStatusToContracted(deal_input_missing_due_date)).toThrow(
      /期日/
    );
  });

  test("明細行が空の場合はエラーを投げる", () => {
    const deal_input_no_details = {
      deal_id: "DEAL-006",
      deal_name: "F社プロジェクト",
      customer_id: "CUST-128",
      customer_name: "F社",
      amount: 2500000,
      due_date: "2024-10-15",
      status: "提案中",
      details: [],
    };

    expect(() => updateDealStatusToContracted(deal_input_no_details)).toThrow(
      /明細/
    );
  });

  test("明細行の合計金額が取引金額と不一致の場合はエラーを投げる", () => {
    const deal_input_mismatched_amount = {
      deal_id: "DEAL-007",
      deal_name: "G社プロジェクト",
      customer_id: "CUST-129",
      customer_name: "G社",
      amount: 5000000,
      due_date: "2024-11-01",
      status: "提案中",
      details: [
        {
          line_id: 1,
          product_name: "製品A",
          quantity: 5,
          unit_price: 800000,
          subtotal: 4000000,
        },
      ],
    };

    expect(() => updateDealStatusToContracted(deal_input_mismatched_amount)).toThrow(
      /金額/
    );
  });
});