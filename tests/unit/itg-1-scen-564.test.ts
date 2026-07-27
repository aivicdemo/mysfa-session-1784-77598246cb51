import {
  detectDelayedDeals,
} from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  test("SCEN-564: 商談ステータスが「受注」でも請求書発行日が未記録の場合、遅延案件判定の対象外となる", () => {
    // Setup: テストデータ - 商談レコード
    const dealRecord = {
      dealId: "DEAL-564-001",
      customerName: "テスト顧客A",
      status: "受注",
      contractAmount: 100000,
      contractDate: "2024-01-15",
    };

    // Setup: テストデータ - 請求書レコード
    const invoiceRecord = {
      invoiceId: "INV-564-001",
      dealId: "DEAL-564-001",
      invoiceAmount: 100000,
      invoiceStatus: "未発行",
      issuedDate: null,
    };

    // Setup: 検出対象のレコードセット
    const deals = [dealRecord];
    const invoices = [invoiceRecord];

    // Execute: 遅延案件検出ロジックを実行
    const detectionResult = detectDelayedDeals(deals, invoices);

    // Assert: 商談DEAL-564-001は遅延案件リストに含まれないことを確認
    const isDelayedDeal = detectionResult.delayedDeals.some(
      (deal: { dealId: string }) => deal.dealId === "DEAL-564-001"
    );
    expect(isDelayedDeal).toBe(false);

    // Assert: 検出結果テーブルで当該商談の遅延フラグが'false'または対象外として記録されていることを確認
    const detectionRecord = detectionResult.detectionRecords.find(
      (record: { dealId: string }) => record.dealId === "DEAL-564-001"
    );
    expect(detectionRecord).toBeDefined();
    expect(detectionRecord.isDelayed).toBe(false);
    expect(detectionRecord.reason).toBe("発行日未記録のため遅延判定対象外");
  });
});