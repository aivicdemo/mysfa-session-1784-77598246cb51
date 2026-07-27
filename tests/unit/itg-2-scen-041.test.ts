import { describe, test, expect, beforeEach } from "@jest/globals";
import { issueQuotation } from "../../src/logic/it-1784969823049-2-1-2";

describe("顧客向け専用ポータルでの商談情報参照機能", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // SCEN-041
  test("帳票発行・履歴管理機能 - 見積書を顧客に発行したとき、発行日時が自動付与され、発行履歴が記録される", () => {
    const issued_at = new Date("2024-06-15T14:30:00Z");
    const quotation_id = "QT-2024-001";
    const customer_id = "C-12345";
    const customer_name = "テスト株式会社";
    const quotation_amount = 1500000;

    const input = {
      quotation_id: quotation_id,
      customer_id: customer_id,
      customer_name: customer_name,
      product_line: [
        {
          product_name: "SaaS License",
          unit_price: 500000,
          quantity: 3,
        },
      ],
      quotation_amount: quotation_amount,
      issued_at: issued_at,
    };

    const result = issueQuotation(input);

    expect(result).toEqual({
      quotation_id: quotation_id,
      customer_id: customer_id,
      customer_name: customer_name,
      quotation_amount: quotation_amount,
      issued_at: issued_at,
      issued_flag: true,
      history_record: {
        quotation_id: quotation_id,
        customer_id: customer_id,
        customer_name: customer_name,
        quotation_amount: quotation_amount,
        issued_at: issued_at,
        issued_date_str: "2024-06-15",
        issued_time_str: "14:30:00",
      },
    });

    expect(result.issued_flag).toBe(true);
    expect(result.issued_at).toEqual(issued_at);
    expect(result.history_record.issued_at).toEqual(issued_at);
    expect(result.history_record.quotation_id).toBe(quotation_id);
    expect(result.history_record.customer_id).toBe(customer_id);
    expect(result.history_record.customer_name).toBe(customer_name);
    expect(result.history_record.quotation_amount).toBe(quotation_amount);
  });
});