import { detectDiscrepancy } from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  // SCEN-535
  test("日付ズレがちょうど許容範囲の上限のとき、正常ズレとして判定される", () => {
    // テストデータ: 商談ステータスが『受注』で確定日が2024年1月15日
    const dealRecord = {
      dealId: "DEAL-001",
      status: "受注",
      confirmedDate: new Date("2024-01-15T00:00:00Z"),
    };

    // 対応する請求書レコード: 発行日を確定日＋許容範囲の上限日数（5日）として設定
    const invoiceRecord = {
      invoiceId: "INV-001",
      dealId: "DEAL-001",
      issuedDate: new Date("2024-01-20T00:00:00Z"),
    };

    // detectDiscrepancy()メソッドを呼び出す
    const result = detectDiscrepancy(dealRecord, invoiceRecord);

    // 戻り値のisNormalDiscrepancy属性が『true』であることを確認
    expect(result.isNormalDiscrepancy).toBe(true);

    // 戻り値のdiscrepancyDays属性が許容範囲の上限値（5日）と一致することを確認
    expect(result.discrepancyDays).toBe(5);

    // ステータスが「正常ズレ」を示すこと
    expect(result.status).toBe("正常ズレ");
  });
});