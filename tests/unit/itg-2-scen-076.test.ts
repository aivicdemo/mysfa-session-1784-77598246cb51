import { describe, test, expect, beforeEach } from "@jest/globals";
import { generateDocuments } from "../../src/logic/it-1784969823049-2-1-2";

describe("顧客向けポータル - 帳票自動生成機能", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // SCEN-076
  test("商談明細が欠落している場合、帳票生成がエラー状態で停止する", () => {
    const deal_input = {
      deal_id: "DEAL-20240115-001",
      customer_id: "CUST-00001",
      customer_name: "テスト顧客企業",
      deal_amount: 1500000,
      deal_status: "成約",
      deal_details: [],
      invoice_scheduled_date: "2024-02-15",
    };

    expect(() => generateDocuments(deal_input)).toThrow(/商談明細/);
  });
});