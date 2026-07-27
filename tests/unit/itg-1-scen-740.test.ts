import { describe, test, expect, beforeEach, afterEach } from "@jest/globals";
import {
  reconcileDealAndInvoice,
  ReconciliationResult,
} from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  // SCEN-740
  test("請求書の金額が商談金額と不一致である場合、金額ズレが検出される", async () => {
    // テスト用入力データ
    const dealRecord = {
      dealId: "DEAL-001",
      amount: 1000000,
      status: "受注",
    };

    const invoiceRecord = {
      invoiceId: "INV-001",
      amount: 950000,
      status: "発行済",
    };

    // 照合実行
    const reconciliationResult: ReconciliationResult =
      await reconcileDealAndInvoice(dealRecord, invoiceRecord);

    // 期待結果の検証
    // (1) 商談IDと請求書IDが照合対象として表示される
    expect(reconciliationResult.dealId).toBe("DEAL-001");
    expect(reconciliationResult.invoiceId).toBe("INV-001");

    // (2) 「金額ズレ検出」というステータスが表示される
    expect(reconciliationResult.reconciliationStatus).toBe("金額ズレ検出");

    // (3) ズレの詳細情報が表示される
    expect(reconciliationResult.discrepancyDetails.dealAmount).toBe(1000000);
    expect(reconciliationResult.discrepancyDetails.invoiceAmount).toBe(950000);
    expect(reconciliationResult.discrepancyDetails.discrepancyAmount).toBe(
      -50000
    );

    // (4) 照合レコードがデータベースに保存される
    expect(reconciliationResult.reconciliationMatchStatus).toBe("不一致");
    expect(reconciliationResult.discrepancyClassification).toBe("金額ズレ");
    expect(reconciliationResult.isSavedToDatabase).toBe(true);
  });
});