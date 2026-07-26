import { detectUnbilledDiscrepancy } from "../../src/logic/it-1784969823049-2-1-3";

describe("顧客ポータルのアクセス制御と権限管理", () => {
  // SCEN-058
  test("ステータス・請求ズレ検出機能 - 商談ステータスが完了で請求書が未発行の場合、未請求案件として警告フラグが立つ", () => {
    const deal_id = "DEAL-20240115-001";
    const customer_name = "株式会社テスト";
    const deal_status = "完了";
    const invoice_issued = false;
    const invoice_issued_date = null;
    const expected_billing_date = "2024-01-10";

    const result = detectUnbilledDiscrepancy({
      deal_id,
      customer_name,
      deal_status,
      invoice_issued,
      invoice_issued_date,
      expected_billing_date,
    });

    expect(result.warning_flag).toBe(true);
    expect(result.discrepancy_type).toBe("未請求");
    expect(result.deal_id).toBe("DEAL-20240115-001");
    expect(result.customer_name).toBe("株式会社テスト");
    expect(result.status_mismatch_detail).toBe(
      "商談ステータス：完了、請求書発行状況：未発行"
    );
    expect(result.visibility).toBe("visible");
  });
});